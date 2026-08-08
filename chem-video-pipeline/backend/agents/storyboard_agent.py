"""
Storyboard / Script Agent
──────────────────────────
Input:  FactSheet + ClassifierOutput
Output: Storyboard — scene-by-scene plan with narration + visual instructions
"""
from __future__ import annotations

import json
import logging
from typing import List

import google.generativeai as genai
from pydantic import ValidationError

from backend.config import AppConfig
from backend.schemas import ClassifierOutput, FactSheet, Storyboard, to_gemini_schema
from backend.agents.llm_helper import generate_content_with_fallback

logger = logging.getLogger(__name__)




SYSTEM_PROMPT = """You are an expert educational video producer who creates premium, cinematic 3D educational explainer videos.
You design scenes that are visually clear, scientifically accurate, and paced perfectly for the target audience.

### Advanced 3D Educational Video Prompt
Create a premium, cinematic 3D educational explainer video that teaches the topic visually, as if an expert teacher is presenting a lesson in a modern classroom/studio.
The video must NOT look like a basic slideshow, simple infographic, stock-footage compilation, or flat 2D animation.

#### 1. Virtual Teacher / Presenter
Show a realistic 3D animated teacher/instructor throughout the lesson. The teacher should look professional, friendly, confident, and expressive. The teacher should actively point toward, interact with, and explain the 3D visualizations.

#### 2. 3D Presentation Environment
Create a sophisticated 3D virtual classroom / futuristic presentation studio. Include large interactive 3D presentation screens, floating holographic diagrams, 3D models, animated labels and arrows, depth, lighting, shadows, and realistic materials.

#### 3. Visual Explanation
Every important concept in the narration must be visually demonstrated, not merely written on the screen. (e.g., If explaining a process, show it happening step-by-step in 3D).

#### 4. Cinematic 3D Animation
Use high-quality 3D animation throughout: photorealistic lighting, dynamic camera angles, cinematic depth of field, and professional transitions.

#### 5. Teacher + Visualization Interaction
The teacher should be integrated into the explanation. The presentation should feel like the teacher and the 3D animation are working together.

#### 6. Dynamic Camera Direction
Do not keep the camera static. Use slow cinematic push-ins, orbit shots, close-ups, and smooth tracking shots.

#### 7. Progressive Teaching
Build complex concepts gradually. Use visual emphasis such as glowing highlights, color coding, animated outlines, transparent layers, and exploded 3D views.

#### 8. Presentation Graphics
Use clean, modern educational typography. On-screen text should be minimal, large and readable, and used only to reinforce the explanation. Do NOT fill the screen with paragraphs. Use short labels.

#### 9. Audio and Teaching Style
Use a professional teacher-style voiceover. The narration should explain concepts clearly, match every visual action, and pause when an important visualization appears.

#### 10. Scene-by-Scene Synchronization
Every scene must be planned according to the narration: Narration -> Teacher action -> 3D visualization -> Camera movement -> Highlight/animation -> Explanation.

#### 11. Quality Standard
The final result should resemble a combination of: Expert teacher presentation + cinematic 3D animation + interactive holographic classroom + documentary-quality visualization + professional educational course.

### Important Negative Prompt
Do NOT create: Basic PowerPoint slides, Static images, Simple 2D diagrams, Generic stock footage, Repetitive animations, Static talking-head videos, Cheap cartoon graphics, Text-heavy screens. Every visual element must have a teaching purpose.

### PIPELINE CONSTRAINTS (CRITICAL)
1. ONE clear idea per scene — never cram two concepts into one scene.
2. Narration and animation must be synchronized — mark sync points explicitly.
3. Narration must use level-appropriate language.
4. Visual descriptions must be CODE-GENERATOR-READY:
   - For Manim: describe exact Mobjects (Text, MathTex, Arrow, Circle), animations (Write, FadeIn, Transform), and timing
   - For 3D molecule: describe camera angle, rotation, which atoms to highlight, zoom level
   - For mechanism: describe each curved arrow precisely
5. For SMILES molecules: include the SMILES string so RDKit can generate the structure.
6. Total video: 60-120 seconds (3-5 scenes, 15-30 seconds each).
7. Respond ONLY with valid JSON matching the Storyboard schema."""


class StoryboardAgent:
    def __init__(self, config: AppConfig):
        self.config = config
        genai.configure(api_key=config.google_api_key)
        self.model = genai.GenerativeModel(
            model_name=config.llm.storyboard_model,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=to_gemini_schema(Storyboard),
                temperature=0.7,
            ),
            system_instruction=SYSTEM_PROMPT,
        )

    def run(self, factsheet: FactSheet, classifier: ClassifierOutput) -> Storyboard:
        """Generate a full scene-by-scene storyboard."""
        logger.info(f"[Storyboard] Creating storyboard for: {factsheet.topic}")

        prompt = self._build_prompt(factsheet, classifier)

        try:
            response = generate_content_with_fallback(
                primary_model=self.config.llm.storyboard_model,
                prompt=prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                    response_schema=to_gemini_schema(Storyboard),
                    temperature=0.7,
                ),
                system_instruction=SYSTEM_PROMPT,
            )
            storyboard = Storyboard.model_validate_json(response.text)

            # Validate SMILES in each scene using RDKit (if available)
            storyboard = self._validate_smiles(storyboard)

            logger.info(
                f"[Storyboard] {storyboard.total_scenes} scenes, "
                f"~{storyboard.estimated_duration_seconds:.0f}s"
            )
            return storyboard
        except (ValidationError, json.JSONDecodeError) as e:
            logger.error(f"[Storyboard] Failed to parse storyboard: {e}")
            raise

    def _validate_smiles(self, storyboard: Storyboard) -> Storyboard:
        """Validate SMILES strings using RDKit (skip if not installed)."""
        try:
            from rdkit import Chem
            for scene in storyboard.scenes:
                valid_mols = []
                for mol in scene.molecules:
                    rdkit_mol = Chem.MolFromSmiles(mol.smiles)
                    if rdkit_mol is None:
                        logger.warning(
                            f"[Storyboard] Invalid SMILES for {mol.name}: {mol.smiles!r} — removing"
                        )
                    else:
                        valid_mols.append(mol)
                scene.molecules = valid_mols
        except ImportError:
            logger.warning("[Storyboard] RDKit not installed — SMILES not validated")
        return storyboard

    def _build_prompt(self, fs: FactSheet, cls: ClassifierOutput) -> str:
        claims_str = "\n".join(
            f"  - [{c.claim_id}] {c.claim} (misconception: {c.common_misconception or 'none'})"
            for c in fs.must_include_claims
        )
        concepts_str = "\n".join(
            f"  - {c.name}: {c.definition}"
            for c in fs.key_concepts
        )
        molecules_str = ""
        if cls.smiles_list:
            pairs = [
                f"{n} (SMILES: {s})"
                for n, s in zip(cls.molecule_names, cls.smiles_list)
            ]
            molecules_str = f"\nMolecules to visualize:\n" + "\n".join(f"  - {p}" for p in pairs)

        anim_guidance = self._animation_guidance(cls)

        return f"""Create a video storyboard for this topic.

Topic: {fs.topic}
Subject: {fs.subject}
Level: {fs.level}
Narration Style: {cls.narration_style}
Topic Type: {cls.topic_type.value}

SUMMARY: {fs.summary}

KEY CONCEPTS:
{concepts_str}

MUST-INCLUDE CLAIMS (all must appear correctly):
{claims_str}
{molecules_str}

EQUATIONS (use in MathTex if math/physics/chemistry):
{chr(10).join(fs.equations) if fs.equations else 'None'}

REAL-WORLD EXAMPLES (use in final scene):
{chr(10).join(fs.real_world_applications)}

ANIMATION GUIDANCE:
{anim_guidance}

Create {self.config.pipeline.scenes_per_video} scenes (60-120 seconds total).
Each scene: narration_text + animation_type + precise visual_description + key_claim_ids covered.
Make the first scene a hook, last scene a memorable summary with real-world connection."""

    def _animation_guidance(self, cls: ClassifierOutput) -> str:
        """Give animation type guidance based on subject/type."""
        from backend.schemas import SubjectArea, TopicType
        if cls.subject == SubjectArea.CHEMISTRY:
            if cls.needs_3d_molecule:
                return (
                    "Use molecule_3d for 3D molecular structures (rotatable 3Dmol.js viewer). "
                    "Use manim_molecule for 2D reaction mechanisms with curved arrows. "
                    "Use manim_2d for energy diagrams and graphs."
                )
            return "Use manim_molecule for 2D structures, manim_2d for energy diagrams and graphs."
        elif cls.subject == SubjectArea.PHYSICS:
            return (
                "Use manim_2d for force diagrams, wave animations, energy diagrams. "
                "Use threejs_3d for 3D field visualizations or orbital mechanics."
            )
        elif cls.subject == SubjectArea.BIOLOGY:
            return (
                "Use molecule_3d for protein/DNA structures. "
                "Use manim_2d for cell diagrams, process flowcharts, graphs."
            )
        elif cls.subject == SubjectArea.MATHEMATICS:
            return (
                "Use manim_2d for all mathematical content: equations (MathTex), "
                "graphs (Axes + plot), geometric constructions, number lines."
            )
        else:
            return (
                "Use manim_2d for text animations, timelines, diagrams, graphs. "
                "Use molecule_3d only if molecular structures are specifically needed."
            )
