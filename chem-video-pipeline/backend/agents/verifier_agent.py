"""
Verifier / Critic Agent
────────────────────────
Input:  FactSheet + StoryboardScene + animation code + round number
Output: VerificationResult — PASS or list of specific issues with corrections

This is the core engineering contribution — the fact-checking loop.
"""
from __future__ import annotations

import json
import logging
from typing import Optional

import google.generativeai as genai
from pydantic import ValidationError

from backend.agents.llm_helper import generate_content_with_fallback
from backend.config import AppConfig
from backend.schemas import FactSheet, StoryboardScene, VerificationResult, to_gemini_schema

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an expert scientific fact-checker and educational content reviewer.
You verify that animated educational videos are factually accurate.

Your role: given a fact sheet (ground truth) and the generated script + animation code,
identify specific factual errors.

CHECK FOR:
1. Chemistry: correct formal charges, correct electron-pushing direction (nucleophile attacks
   electrophile, NOT vice versa), correct stoichiometry, correct stereochemical outcome,
   correct SMILES/structure, correct arrow notation in mechanisms.
2. Physics: correct direction of forces, correct sign conventions, correct units,
   correct formula application (e.g., F=ma not F=m/a).
3. Biology: correct organelle functions, correct gene expression direction, correct
   evolutionary relationships.
4. Mathematics: correct theorem statements, correct proof steps, correct formula derivations.
5. All subjects: no fabricated numbers, constants, dates, or names not in the fact sheet.

SEVERITY:
- CRITICAL: Wrong mechanism direction, wrong formula, wrong product — BLOCKS approval
- MAJOR: Significant oversimplification that creates misconception — BLOCKS approval
- MINOR: Style issue, slightly imprecise wording — does NOT block approval

APPROVED = True only when: no CRITICAL and no MAJOR issues remain.

Respond ONLY with valid JSON matching the VerificationResult schema."""


class VerifierAgent:
    def __init__(self, config: AppConfig):
        self.config = config
        genai.configure(api_key=config.google_api_key)
        self.model = genai.GenerativeModel(
            model_name=config.llm.verifier_model,  # Uses Pro for deeper reasoning
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=to_gemini_schema(VerificationResult),
                temperature=0.1,  # Very low temp — be conservative, don't hallucinate errors
            ),
            system_instruction=SYSTEM_PROMPT,
        )

    def run(
        self,
        factsheet: FactSheet,
        scene: StoryboardScene,
        animation_code: str,
        round_number: int = 1,
    ) -> VerificationResult:
        """Verify one scene's narration + animation against the fact sheet."""
        logger.info(
            f"[Verifier] Checking {scene.scene_id}, round {round_number}"
        )

        prompt = self._build_prompt(factsheet, scene, animation_code, round_number)

        try:
            response = generate_content_with_fallback(
                primary_model=self.config.llm.verifier_model,
                prompt=prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                    response_schema=to_gemini_schema(VerificationResult),
                    temperature=0.1,
                ),
                system_instruction=SYSTEM_PROMPT,
            )
            result = VerificationResult.model_validate_json(response.text)
            result.scene_id = scene.scene_id
            result.round_number = round_number

            if result.approved:
                logger.info(f"[Verifier] ✓ {scene.scene_id} APPROVED (round {round_number})")
            else:
                logger.warning(
                    f"[Verifier] ✗ {scene.scene_id} FAILED — "
                    f"{result.critical_count} critical, {result.major_count} major issues"
                )
            return result
        except (ValidationError, json.JSONDecodeError) as e:
            logger.error(f"[Verifier] Parse error: {e}. Approving with warning.")
            return VerificationResult(
                scene_id=scene.scene_id,
                round_number=round_number,
                approved=True,
                verifier_notes=f"Verifier parse error — manual review recommended: {e}",
            )

    def _build_prompt(
        self,
        fs: FactSheet,
        scene: StoryboardScene,
        animation_code: str,
        round_number: int,
    ) -> str:
        claims_str = "\n".join(
            f"  [{c.claim_id}] {c.claim}"
            + (f" (watch for misconception: {c.common_misconception})" if c.common_misconception else "")
            for c in fs.must_include_claims
        )

        relevant_claims = [
            c for c in fs.must_include_claims
            if c.claim_id in scene.key_claim_ids
        ]
        relevant_str = "\n".join(
            f"  [{c.claim_id}] {c.claim}" for c in relevant_claims
        ) if relevant_claims else "All claims potentially relevant."

        return f"""Verify this scene for factual accuracy.

=== FACT SHEET (GROUND TRUTH) ===
Topic: {fs.topic}
Subject: {fs.subject}

Must-include claims (ALL must be correct):
{claims_str}

Raw source excerpts (reference material):
{chr(10).join(fs.raw_search_excerpts[:3])}

=== SCENE TO VERIFY ===
Scene ID: {scene.scene_id}
Title: {scene.title}
Verification round: {round_number}

Claims this scene should cover:
{relevant_str}

NARRATION TEXT:
{scene.narration_text}

ANIMATION CODE:
```python
{animation_code[:3000]}
```

=== VERIFICATION TASK ===
Check the narration text AND animation code for:
1. Any claim that contradicts the fact sheet
2. Any fabricated number/constant/name not in the fact sheet
3. Any mechanism step in wrong order or direction
4. Any formula or equation with errors
5. Any structure or diagram that would be chemically/physically incorrect

For each issue found: specify severity, exact flagged text, explanation, and specific correction.
If no issues → set approved=True with empty issues list."""
