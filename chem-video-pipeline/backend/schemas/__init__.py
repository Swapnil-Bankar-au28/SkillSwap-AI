from typing import Any, Dict, Type
from pydantic import BaseModel

from .classifier_schema import ClassifierOutput, SubjectArea, AcademicLevel, TopicType
from .factsheet_schema import FactSheet, KeyConcept, MustIncludeClaim, Citation
from .storyboard_schema import Storyboard, StoryboardScene, MoleculeRef, AnimationType
from .verification_schema import VerificationResult, VerificationIssue, IssueSeverity, RevisionTarget


def to_gemini_schema(model_cls: Type[BaseModel]) -> Dict[str, Any]:
    """Convert a Pydantic model class to a schema dict compatible with Google Generative AI."""
    raw = model_cls.model_json_schema()
    defs = raw.get("$defs", {})

    def _resolve(node: Dict[str, Any]) -> Dict[str, Any]:
        if "$ref" in node:
            ref_key = node["$ref"].split("/")[-1]
            node = defs.get(ref_key, node)

        out: Dict[str, Any] = {}
        if "type" in node:
            t = node["type"]
            if t == "string":
                out["type"] = "STRING"
            elif t == "integer":
                out["type"] = "INTEGER"
            elif t in ("number", "float"):
                out["type"] = "NUMBER"
            elif t in ("boolean", "bool"):
                out["type"] = "BOOLEAN"
            elif t == "array":
                out["type"] = "ARRAY"
            elif t == "object":
                out["type"] = "OBJECT"
            else:
                out["type"] = t.upper()

        if "description" in node:
            out["description"] = node["description"]

        if "enum" in node:
            out["enum"] = [str(x) for x in node["enum"]]
            if "type" not in out:
                out["type"] = "STRING"

        if "items" in node:
            out["items"] = _resolve(node["items"])

        if "properties" in node:
            out["properties"] = {k: _resolve(v) for k, v in node["properties"].items()}

        if "required" in node:
            out["required"] = list(node["required"])

        if "nullable" in node:
            out["nullable"] = bool(node["nullable"])

        return out

    return _resolve(raw)


__all__ = [
    "ClassifierOutput", "SubjectArea", "AcademicLevel", "TopicType",
    "FactSheet", "KeyConcept", "MustIncludeClaim", "Citation",
    "Storyboard", "StoryboardScene", "MoleculeRef", "AnimationType",
    "VerificationResult", "VerificationIssue", "IssueSeverity", "RevisionTarget",
    "to_gemini_schema",
]

