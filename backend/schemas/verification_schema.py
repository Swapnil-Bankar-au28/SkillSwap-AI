"""Verification schema — output of Verifier Agent."""
from __future__ import annotations

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class IssueSeverity(str, Enum):
    CRITICAL = "critical"  # Factually wrong — blocks approval
    MAJOR = "major"        # Significant error or misleading
    MINOR = "minor"        # Small inaccuracy, style issue


class RevisionTarget(str, Enum):
    SCRIPT = "script"           # Narration text needs fixing
    ANIMATION = "animation"     # Animation code / visual description needs fixing
    BOTH = "both"


class VerificationIssue(BaseModel):
    issue_id: str
    severity: IssueSeverity
    claim_id: Optional[str] = Field(
        None, description="The must_include_claim this violates (if applicable)"
    )
    flagged_text: str = Field(
        description="Exact text or code snippet that is wrong"
    )
    explanation: str = Field(
        description="Why this is wrong, with reference to the fact sheet"
    )
    correction: str = Field(
        description="Specific, actionable fix for the revision agent"
    )
    revision_target: RevisionTarget


class VerificationResult(BaseModel):
    """Output of the Verifier Agent for one scene."""
    scene_id: str
    round_number: int
    approved: bool = Field(
        description="True if no critical or major issues remain"
    )
    issues: List[VerificationIssue] = Field(default_factory=list)
    critical_count: int = 0
    major_count: int = 0
    minor_count: int = 0
    verifier_notes: str = Field(
        default="",
        description="Overall summary of what was checked and any remaining concerns"
    )

    def model_post_init(self, __context):
        self.critical_count = sum(1 for i in self.issues if i.severity == IssueSeverity.CRITICAL)
        self.major_count = sum(1 for i in self.issues if i.severity == IssueSeverity.MAJOR)
        self.minor_count = sum(1 for i in self.issues if i.severity == IssueSeverity.MINOR)
        if not self.approved:
            # Auto-set approved: True only if no critical or major issues
            self.approved = self.critical_count == 0 and self.major_count == 0
