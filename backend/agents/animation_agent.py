"""
Animation Code Agent
─────────────────────
Input:  StoryboardScene + optional revision issues from Verifier
Output: Runnable Manim Python code (string) OR 3D viewer JSON config

Called per-scene for reliability — small generation units fail far less often.
Uses manim_helper.py primitives to reduce hallucination of custom drawing code.
"""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import List, Optional

import google.generativeai as genai
from pydantic import BaseModel
from backend.agents.llm_helper import generate_content_with_fallback

from backend.config import AppConfig
from backend.schemas import StoryboardScene, AnimationType, VerificationIssue

logger = logging.getLogger(__name__)

# ── Output Models ────────────────────────────────────────────────────────────

class AnimationOutput(BaseModel):
    scene_id: str
    animation_type: str
    code: str                          # Manim Python code or JSON config
    class_name: Optional[str] = None  # e.g. "Scene_01"
    extra_assets: dict = {}            # e.g. {"molecule_sdf": "..."} for 3Dmol


# ── System prompts ────────────────────────────────────────────────────────────

MANIM_SYSTEM_PROMPT = """You are an expert Manim Community Edition developer specializing in
educational animations. You write clean, runnable Manim Python code.

MANDATORY RULES:
1. Always start with: `from manim import *` and `from manim_helper import *`
2. Create ONE class inheriting from Scene, named exactly Scene_XX (e.g. Scene_01).
3. Override ONLY `construct(self)`.
4. Use `manim_helper` primitives when available:
   - `chemistry_arrow(start, end, color)` for curved electron-pushing arrows
   - `energy_diagram(levels, labels, color)` for energy level diagrams
   - `molecule_svg(path, scale)` to import RDKit-generated SVG
   - `labeled_equation(latex_str)` for boxed equations
5. Use dark background (#0d0d1a). Use bright colors for highlights.
6. Animations: Write(), FadeIn(), Create(), Transform(), Indicate(), MoveAlongPath()
7. Timing: self.wait(n) between key moments. Total scene duration ~15-30 seconds.
8. Add NARRATION COMMENT at each visual moment: # NARRATION: "exact words said here"
9. DO NOT use undefined variables or methods. DO NOT import anything beyond manim and manim_helper.
10. Respond with ONLY the Python code — no markdown, no explanations."""

MOLECULE_3D_SYSTEM_PROMPT = """You are an expert at configuring 3Dmol.js molecular viewers for
educational content. Given a scene description, output a JSON configuration.

Output a JSON object with:
{
  "viewer_type": "3dmol",
  "molecules": [{"name": "...", "smiles": "...", "style": "stick|sphere|surface"}],
  "camera": {"zoom": 1.5, "x": 0, "y": 0, "z": 0},
  "highlight_atoms": [list of 0-indexed atom indices to highlight],
  "highlight_color": "#ffff00",
  "rotation_animation": {"axis": "y", "speed": 1.0},
  "labels": [{"text": "...", "position": [x,y,z], "color": "#fff"}],
  "background_color": "#0d0d1a"
}

Respond with ONLY valid JSON — no markdown, no explanation."""


class AnimationAgent:
    def __init__(self, config: AppConfig):
        self.config = config
        genai.configure(api_key=config.google_api_key)

        self.manim_model = genai.GenerativeModel(
            model_name=config.llm.animation_model,
            generation_config=genai.GenerationConfig(temperature=0.3),
            system_instruction=MANIM_SYSTEM_PROMPT,
        )
        self.mol3d_model = genai.GenerativeModel(
            model_name=config.llm.animation_model,
            generation_config=genai.GenerationConfig(
                temperature=0.2,
                response_mime_type="application/json",
            ),
            system_instruction=MOLECULE_3D_SYSTEM_PROMPT,
        )

    def run(
        self,
        scene: StoryboardScene,
        revision_issues: Optional[List[VerificationIssue]] = None,
        run_dir: Optional[Path] = None,
    ) -> AnimationOutput:
        """Generate animation code for a single scene."""
        logger.info(f"[Animation] Generating {scene.animation_type.value} for {scene.scene_id}")

        if scene.animation_type in (AnimationType.MANIM_2D, AnimationType.MANIM_MOLECULE):
            return self._generate_manim(scene, revision_issues, run_dir)
        elif scene.animation_type == AnimationType.MOLECULE_3D:
            return self._generate_molecule_3d(scene, revision_issues)
        elif scene.animation_type == AnimationType.THREEJS_3D:
            return self._generate_threejs_3d(scene, revision_issues)
        else:
            # Fallback to Manim 2D
            return self._generate_manim(scene, revision_issues, run_dir)

    def _generate_manim(
        self,
        scene: StoryboardScene,
        issues: Optional[List[VerificationIssue]],
        run_dir: Optional[Path],
    ) -> AnimationOutput:
        """Generate Manim Scene Python code."""
        # Pre-generate molecule SVGs via RDKit if available
        svg_paths = self._generate_svgs(scene, run_dir)

        prompt = self._build_manim_prompt(scene, issues, svg_paths)
        response = generate_content_with_fallback(
            primary_model=self.config.llm.animation_model,
            prompt=prompt,
            generation_config=genai.GenerationConfig(temperature=0.3),
            system_instruction=MANIM_SYSTEM_PROMPT,
        )
        code = self._clean_code(response.text)

        # Inject class name fix if missing
        class_name = f"Scene_{scene.scene_id.split('_')[-1].zfill(2)}"
        if class_name not in code:
            code = code.replace("class Scene(Scene)", f"class {class_name}(Scene)")

        return AnimationOutput(
            scene_id=scene.scene_id,
            animation_type=scene.animation_type.value,
            code=code,
            class_name=class_name,
            extra_assets={"svg_paths": {k: str(v) for k, v in svg_paths.items()}},
        )

    def _generate_molecule_3d(
        self,
        scene: StoryboardScene,
        issues: Optional[List[VerificationIssue]],
    ) -> AnimationOutput:
        """Generate 3Dmol.js viewer config JSON."""
        prompt = self._build_3d_prompt(scene, issues)
        response = generate_content_with_fallback(
            primary_model=self.config.llm.animation_model,
            prompt=prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.2,
                response_mime_type="application/json",
            ),
            system_instruction=MOLECULE_3D_SYSTEM_PROMPT,
        )

        try:
            config = json.loads(response.text)
        except json.JSONDecodeError:
            config = {
                "viewer_type": "3dmol",
                "molecules": [
                    {"name": m.name, "smiles": m.smiles, "style": "stick"}
                    for m in scene.molecules
                ],
                "camera": {"zoom": 1.5},
                "background_color": "#0d0d1a",
            }

        return AnimationOutput(
            scene_id=scene.scene_id,
            animation_type=AnimationType.MOLECULE_3D.value,
            code=json.dumps(config, indent=2),
            class_name=None,
        )

    def _generate_threejs_3d(
        self,
        scene: StoryboardScene,
        issues: Optional[List[VerificationIssue]],
    ) -> AnimationOutput:
        """Generate Three.js orbital/wavefunction config."""
        # Use the same 3D model but with orbital-specific prompt
        prompt = f"""Generate a Three.js 3D orbital visualization config for:
Scene: {scene.title}
Description: {scene.visual_description}

Output JSON with:
{{
  "viewer_type": "threejs_orbital",
  "orbital_type": "s|p|d|sp3|sp2|pi",
  "quantum_numbers": {{"n": 1, "l": 0, "m": 0}},
  "color_positive": "#4488ff",
  "color_negative": "#ff4444",
  "transparency": 0.6,
  "camera_position": [4, 3, 4],
  "rotation_speed": 0.5,
  "background_color": "#0d0d1a",
  "labels": []
}}"""
        response = self.mol3d_model.generate_content(prompt)
        try:
            config = json.loads(response.text)
        except json.JSONDecodeError:
            config = {"viewer_type": "threejs_orbital", "orbital_type": "p"}

        return AnimationOutput(
            scene_id=scene.scene_id,
            animation_type=AnimationType.THREEJS_3D.value,
            code=json.dumps(config, indent=2),
        )

    def _generate_svgs(self, scene: StoryboardScene, run_dir: Optional[Path]) -> dict:
        """Use RDKit to generate molecule SVGs before LLM sees them."""
        svg_paths = {}
        if not scene.molecules or not run_dir:
            return svg_paths
        try:
            from rdkit import Chem
            from rdkit.Chem.Draw import rdMolDraw2D
            from rdkit.Chem import AllChem

            svg_dir = run_dir / "molecule_svgs"
            svg_dir.mkdir(exist_ok=True)

            for mol_ref in scene.molecules:
                mol = Chem.MolFromSmiles(mol_ref.smiles)
                if mol is None:
                    continue
                AllChem.Compute2DCoords(mol)
                drawer = rdMolDraw2D.MolDraw2DSVG(400, 300)
                drawer.drawOptions().addAtomIndices = False
                drawer.DrawMolecule(mol)
                drawer.FinishDrawing()
                svg_text = drawer.GetDrawingText()

                safe_name = mol_ref.name.replace(" ", "_").lower()
                svg_path = svg_dir / f"{safe_name}.svg"
                svg_path.write_text(svg_text)
                svg_paths[mol_ref.name] = svg_path
                logger.info(f"[Animation] Generated SVG for {mol_ref.name}")
        except ImportError:
            logger.warning("[Animation] RDKit not available — skipping SVG generation")
        return svg_paths

    def _build_manim_prompt(
        self,
        scene: StoryboardScene,
        issues: Optional[List[VerificationIssue]],
        svg_paths: dict,
    ) -> str:
        revision_block = ""
        if issues:
            revision_block = "\n\nREVISION REQUIRED — fix these specific issues:\n" + "\n".join(
                f"  [{i.severity.value.upper()}] {i.flagged_text} → {i.correction}"
                for i in issues
            )

        svg_block = ""
        if svg_paths:
            svg_block = "\nAvailable RDKit molecule SVG paths (use molecule_svg() helper):\n" + \
                "\n".join(f"  - {name}: '{path}'" for name, path in svg_paths.items())

        molecules_str = ""
        if scene.molecules:
            molecules_str = "\nMolecules in this scene:\n" + "\n".join(
                f"  - {m.name}: SMILES={m.smiles}, role={m.role}"
                for m in scene.molecules
            )

        return f"""Generate Manim CE Python code for this scene.

Scene ID: {scene.scene_id}
Title: {scene.title}
Animation Type: {scene.animation_type.value}
Duration: ~{scene.duration_hint_seconds:.0f} seconds

NARRATION (what the viewer hears):
{scene.narration_text}

VISUAL DESCRIPTION (what must be shown):
{scene.visual_description}

VISUAL ELEMENTS:
{chr(10).join(f'  - {e.element_type}: {e.description}' for e in scene.visual_elements)}

SYNC POINTS (narration words that must align with specific visual moments):
{chr(10).join(f'  - "{s}"' for s in scene.sync_points)}
{molecules_str}
{svg_block}
{revision_block}

Generate the complete Scene_{scene.scene_id.split('_')[-1].zfill(2)} class."""

    def _build_3d_prompt(
        self,
        scene: StoryboardScene,
        issues: Optional[List[VerificationIssue]],
    ) -> str:
        revision_block = ""
        if issues:
            revision_block = "\nFix these issues: " + "; ".join(
                f"{i.flagged_text} → {i.correction}" for i in issues
            )

        return f"""Configure a 3Dmol.js viewer for this scene.

Scene: {scene.title}
Molecules: {[(m.name, m.smiles) for m in scene.molecules]}
Description: {scene.visual_description}
{revision_block}"""

    def _clean_code(self, raw: str) -> str:
        """Strip markdown code fences from LLM output."""
        raw = raw.strip()
        if raw.startswith("```"):
            lines = raw.split("\n")
            # Remove first and last fence lines
            start = 1 if lines[0].startswith("```") else 0
            end = len(lines) - 1 if lines[-1].strip() == "```" else len(lines)
            raw = "\n".join(lines[start:end])
        return raw
