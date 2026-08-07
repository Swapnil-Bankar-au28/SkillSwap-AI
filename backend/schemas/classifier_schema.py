"""Classifier Agent output schema."""
from __future__ import annotations

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class SubjectArea(str, Enum):
    CHEMISTRY = "chemistry"
    PHYSICS = "physics"
    BIOLOGY = "biology"
    MATHEMATICS = "mathematics"
    COMPUTER_SCIENCE = "computer_science"
    HISTORY = "history"
    GEOGRAPHY = "geography"
    LITERATURE = "literature"
    ECONOMICS = "economics"
    ENGINEERING = "engineering"
    GENERAL_SCIENCE = "general_science"
    OTHER = "other"


class AcademicLevel(str, Enum):
    ELEMENTARY = "elementary"       # Grade 1–5
    MIDDLE = "middle"               # Grade 6–8
    HIGH_SCHOOL = "high_school"     # Grade 9–12
    UNDERGRADUATE = "undergraduate" # College / B.Sc.
    GRADUATE = "graduate"           # M.Sc.
    PHD = "phd"                     # Research / PhD


class TopicType(str, Enum):
    CONCEPTUAL = "conceptual"           # What is X?
    MECHANISM = "mechanism"             # How does X happen step-by-step?
    DERIVATION = "derivation"           # Prove / derive X
    DIAGRAM = "diagram"                 # Draw / show X
    PROBLEM_SOLVING = "problem_solving" # Solve / calculate X
    COMPARISON = "comparison"           # Compare X and Y
    HISTORICAL = "historical"           # Who / when / why in history


class ClassifierOutput(BaseModel):
    """Output of the Classifier Agent — routes the pipeline."""
    topic: str = Field(description="Cleaned, canonical topic string")
    subject: SubjectArea
    level: AcademicLevel
    topic_type: TopicType
    needs_3d_molecule: bool = Field(
        description="True if 3D molecular structure visualization is needed"
    )
    smiles_list: List[str] = Field(
        default_factory=list,
        description="SMILES strings for molecules to be shown (if chemistry)"
    )
    molecule_names: List[str] = Field(
        default_factory=list,
        description="Human-readable names matching smiles_list"
    )
    key_vocabulary: List[str] = Field(
        default_factory=list,
        description="3-8 key terms relevant to this topic and level"
    )
    search_query: str = Field(
        description="Optimized search query for the Research Agent to use"
    )
    narration_style: str = Field(
        default="friendly and clear",
        description="Narration tone e.g. 'simple and engaging', 'technical and precise'"
    )
