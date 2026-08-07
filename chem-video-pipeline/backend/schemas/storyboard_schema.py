"""Storyboard schema — output of Storyboard Agent."""
from __future__ import annotations

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class AnimationType(str, Enum):
    MANIM_2D = "manim_2d"           # Manim scene (diagrams, graphs, equations, text)
    THREEJS_3D = "threejs_3d"       # Three.js 3D orbital / wavefunction
    MOLECULE_3D = "molecule_3d"     # 3Dmol.js rotatable molecule from SMILES/SDF
    MANIM_MOLECULE = "manim_molecule" # Manim 2D reaction mechanism (from RDKit SVG)


class MoleculeRef(BaseModel):
    name: str
    smiles: str
    role: str = Field(description="e.g. 'reactant', 'product', 'catalyst', 'example'")


class VisualElement(BaseModel):
    element_type: str = Field(
        description="e.g. 'arrow', 'label', 'equation', 'highlight', 'energy_diagram', 'orbital'"
    )
    description: str = Field(
        description="Precise description of what to show and how"
    )
    timing: Optional[str] = Field(
        None, description="When in the scene: 'start' | 'at_3s' | 'end'"
    )


class StoryboardScene(BaseModel):
    """One scene (≈15-30 seconds) in the video."""
    scene_id: str = Field(description="e.g. 'scene_01'")
    title: str = Field(description="Short title for this scene")
    narration_text: str = Field(
        description="Exactly what the narrator says. Level-appropriate language."
    )
    animation_type: AnimationType
    visual_description: str = Field(
        description=(
            "Precise, code-generator-ready description of the animation. "
            "For Manim: describe each Mobject, transformation, and timing. "
            "For 3D: describe camera angle, highlighted atoms, rotation path."
        )
    )
    visual_elements: List[VisualElement] = Field(default_factory=list)
    molecules: List[MoleculeRef] = Field(
        default_factory=list,
        description="Molecules to show in this scene (SMILES validated)"
    )
    duration_hint_seconds: float = Field(
        default=20.0,
        description="Target duration for this scene"
    )
    key_claim_ids: List[str] = Field(
        default_factory=list,
        description="must_include_claim IDs that this scene must convey correctly"
    )
    sync_points: List[str] = Field(
        default_factory=list,
        description="Narration phrases that must align with specific visual moments"
    )


class Storyboard(BaseModel):
    """Full video storyboard — output of Storyboard Agent."""
    topic: str
    subject: str
    level: str
    total_scenes: int
    estimated_duration_seconds: float
    scenes: List[StoryboardScene]
    overall_narrative_arc: str = Field(
        description="How the scenes flow from introduction to conclusion"
    )
