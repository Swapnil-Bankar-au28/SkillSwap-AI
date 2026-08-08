"""
Classifier Agent
────────────────
Input:  raw user question string
Output: ClassifierOutput — subject, level, topic_type, SMILES list, etc.

Uses Gemini to detect what kind of educational content is needed
before any search or animation work happens.
"""
from __future__ import annotations

import json
import logging
from typing import Optional

import google.generativeai as genai
from pydantic import ValidationError

from backend.config import AppConfig
from backend.schemas import ClassifierOutput, AcademicLevel, SubjectArea, TopicType, to_gemini_schema

from backend.agents.llm_helper import generate_content_with_fallback

logger = logging.getLogger(__name__)


SYSTEM_PROMPT = """You are an expert educational content classifier.
Given a user's question or topic, determine:
1. The academic subject area
2. The appropriate academic level (elementary through PhD)
3. The type of explanation needed
4. Whether 3D molecular visualization is required
5. Any SMILES strings for molecules to visualize
6. The best search query to ground the research

Be precise about the level — a question like "what is water?" is elementary,
"hydrogen bonding in water" is high school, "quantum mechanical treatment of water's
dipole moment" is graduate/PhD.

IMPORTANT: You MUST respond with a valid JSON object matching the schema exactly.
Do not add any text before or after the JSON."""


class ClassifierAgent:
    def __init__(self, config: AppConfig):
        self.config = config
        genai.configure(api_key=config.google_api_key)
        self.model = genai.GenerativeModel(
            model_name=config.llm.classifier_model,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=to_gemini_schema(ClassifierOutput),
            ),
            system_instruction=SYSTEM_PROMPT,
        )

    def run(self, user_question: str) -> ClassifierOutput:
        """Classify a user question into a structured routing object."""
        logger.info(f"[Classifier] Classifying: {user_question!r}")

        prompt = f"""Classify this educational question/topic:

"{user_question}"

Determine:
- subject area
- academic level (be specific — Grade 1 questions use elementary, PhD research uses phd)
- topic type
- whether 3D molecule viewing would help (True for chemistry molecules/reactions/orbitals)
- SMILES strings for any relevant molecules (e.g. water = "O", ethanol = "CCO")
- molecule names matching smiles_list order
- 3-6 key vocabulary words for this level
- an optimized search query (e.g. "SN2 reaction mechanism nucleophilic substitution LibreTexts")
- appropriate narration style for the level"""

        try:
            response = generate_content_with_fallback(
                primary_model=self.config.llm.classifier_model,
                prompt=prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                    response_schema=to_gemini_schema(ClassifierOutput),
                ),
                system_instruction=SYSTEM_PROMPT,
            )
            result = ClassifierOutput.model_validate_json(response.text)
            logger.info(
                f"[Classifier] Subject={result.subject.value}, "
                f"Level={result.level.value}, Type={result.topic_type.value}"
            )
            return result
        except (ValidationError, json.JSONDecodeError) as e:
            logger.warning(f"[Classifier] Schema parse failed, using fallback: {e}")
            return self._fallback(user_question)

    def _fallback(self, question: str) -> ClassifierOutput:
        """Safe fallback if Gemini response doesn't parse."""
        return ClassifierOutput(
            topic=question,
            subject=SubjectArea.GENERAL_SCIENCE,
            level=AcademicLevel.HIGH_SCHOOL,
            topic_type=TopicType.CONCEPTUAL,
            needs_3d_molecule=False,
            smiles_list=[],
            molecule_names=[],
            key_vocabulary=[],
            search_query=question,
            narration_style="clear and engaging",
        )
