"""Fact Sheet schema — output of Research Agent."""
from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class Citation(BaseModel):
    source_name: str
    url: Optional[str] = None
    excerpt: Optional[str] = Field(None, description="Key quote from the source")


class KeyConcept(BaseModel):
    name: str
    definition: str
    importance: str = Field(description="Why this concept matters for the topic")


class MustIncludeClaim(BaseModel):
    """A specific factual claim that MUST appear correctly in the final video."""
    claim_id: str = Field(description="Short unique ID e.g. 'claim_01'")
    claim: str = Field(description="The specific factual statement")
    category: str = Field(
        description="Type: equation | mechanism_step | diagram_feature | numeric_value | definition"
    )
    common_misconception: Optional[str] = Field(
        None,
        description="Common wrong version of this claim to watch for"
    )
    citations: List[str] = Field(
        default_factory=list,
        description="Source names supporting this claim"
    )


class FactSheet(BaseModel):
    """Structured grounding document produced by the Research Agent."""
    topic: str
    subject: str
    level: str
    summary: str = Field(description="2-3 sentence plain-language summary")
    key_concepts: List[KeyConcept] = Field(
        description="3-8 core concepts the video must explain"
    )
    prerequisite_concepts: List[str] = Field(
        description="What the viewer should already know"
    )
    must_include_claims: List[MustIncludeClaim] = Field(
        description="Specific factual claims/equations/steps that must be correct"
    )
    equations: List[str] = Field(
        default_factory=list,
        description="LaTeX equations relevant to the topic"
    )
    real_world_applications: List[str] = Field(
        default_factory=list,
        description="1-3 real-world examples to make the topic concrete"
    )
    citations: List[Citation] = Field(default_factory=list)
    raw_search_excerpts: List[str] = Field(
        default_factory=list,
        description="Raw text from search results for verifier reference"
    )
