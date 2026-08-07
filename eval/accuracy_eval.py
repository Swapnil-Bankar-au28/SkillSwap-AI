"""
Evaluation Harness
───────────────────
Runs the full pipeline (verifier ON vs OFF) across the test topic set
and scores factual accuracy of resulting narration scripts.

Usage:
  python eval/accuracy_eval.py --topics eval/topics_test_set.yaml --with-verifier
  python eval/accuracy_eval.py --topics eval/topics_test_set.yaml --no-verifier
  python eval/accuracy_eval.py --topics eval/topics_test_set.yaml --compare
"""
from __future__ import annotations

import argparse
import json
import logging
import sys
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional

import yaml

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.config import get_config
from backend.pipeline import Pipeline

logger = logging.getLogger(__name__)

# ── Scoring Rubric ──────────────────────────────────────────────────────────

JUDGE_SYSTEM_PROMPT = """You are an expert educational content evaluator.
Score the factual accuracy of a narration script against a ground-truth fact sheet.

For each must_include_claim in the fact sheet, score how accurately the narration covers it:
  2 = Correctly covered with appropriate detail
  1 = Mentioned but imprecise or oversimplified beyond the target level
  0 = Missing or factually wrong

Return JSON: {"scores": {"claim_id": score, ...}, "overall_notes": "..."}"""


@dataclass
class TopicResult:
    topic_id: str
    topic: str
    subject: str
    level: str
    difficulty: int
    verifier_enabled: bool
    success: bool
    claim_scores: dict = field(default_factory=dict)
    overall_accuracy: float = 0.0
    revision_rounds: int = 0
    error: Optional[str] = None
    run_id: Optional[str] = None


@dataclass
class EvalReport:
    mode: str  # "with_verifier" | "no_verifier"
    topics_run: int
    topics_succeeded: int
    mean_accuracy: float
    accuracy_by_level: dict
    accuracy_by_subject: dict
    mean_revision_rounds: float
    results: List[TopicResult]


def run_evaluation(
    topics: list,
    verifier_enabled: bool,
    max_topics: Optional[int] = None,
) -> EvalReport:
    """Run pipeline on all topics and score accuracy."""
    config = get_config()
    if not config.google_api_key:
        raise ValueError("GOOGLE_API_KEY not set. Copy .env.example → .env and add your key.")

    pipeline = Pipeline(config, verifier_enabled=verifier_enabled)
    results: List[TopicResult] = []

    topics_to_run = topics[:max_topics] if max_topics else topics

    for i, topic_entry in enumerate(topics_to_run):
        topic_id = topic_entry["id"]
        topic_str = topic_entry["topic"]
        subject = topic_entry["subject"]
        level = topic_entry["level"]
        difficulty = topic_entry.get("difficulty", 5)

        logger.info(f"\n{'='*60}")
        logger.info(f"[{i+1}/{len(topics_to_run)}] {topic_id}: {topic_str}")

        tr = TopicResult(
            topic_id=topic_id,
            topic=topic_str,
            subject=subject,
            level=level,
            difficulty=difficulty,
            verifier_enabled=verifier_enabled,
            success=False,
        )

        try:
            result = pipeline.run(topic_str)
            tr.run_id = result.run_id
            tr.revision_rounds = result.total_revision_rounds

            if result.success:
                tr.success = True
                # Score accuracy using LLM judge
                accuracy = score_accuracy(result, config)
                tr.claim_scores = accuracy.get("scores", {})
                tr.overall_accuracy = accuracy.get("overall_accuracy", 0.0)
            else:
                tr.error = result.error

        except Exception as e:
            logger.error(f"Topic {topic_id} failed: {e}")
            tr.error = str(e)

        results.append(tr)
        time.sleep(2)  # Rate limit

    return _build_report(results, verifier_enabled)


def score_accuracy(pipeline_result, config) -> dict:
    """Use Gemini as LLM judge to score narration against fact sheet."""
    try:
        import google.generativeai as genai
        genai.configure(api_key=config.google_api_key)

        # Load factsheet from run dir
        run_dir = pipeline_result.run_dir
        if not run_dir:
            return {"overall_accuracy": 0.0, "scores": {}}

        fs_path = run_dir / "factsheet.json"
        sb_path = run_dir / "storyboard.json"

        if not fs_path.exists() or not sb_path.exists():
            return {"overall_accuracy": 0.0, "scores": {}}

        factsheet = json.loads(fs_path.read_text())
        storyboard = json.loads(sb_path.read_text())

        # Collect all narration text
        narration = " ".join(
            s.get("narration_text", "") for s in storyboard.get("scenes", [])
        )

        claims = factsheet.get("must_include_claims", [])
        if not claims:
            return {"overall_accuracy": 1.0, "scores": {}}

        judge_prompt = f"""Evaluate this narration script against the fact sheet.

FACT SHEET — Must-Include Claims:
{json.dumps(claims, indent=2)}

NARRATION SCRIPT:
{narration[:3000]}

Score each claim (0/1/2) as described. Return JSON only."""

        model = genai.GenerativeModel(
            model_name=config.llm.evaluator_model,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.1,
            ),
            system_instruction=JUDGE_SYSTEM_PROMPT,
        )
        response = model.generate_content(judge_prompt)
        scored = json.loads(response.text)

        scores = scored.get("scores", {})
        if scores:
            max_score = len(scores) * 2
            actual_score = sum(scores.values())
            overall = actual_score / max_score if max_score > 0 else 0.0
        else:
            overall = 0.0

        return {
            "scores": scores,
            "overall_accuracy": overall,
            "notes": scored.get("overall_notes", ""),
        }

    except Exception as e:
        logger.warning(f"Scoring failed: {e}")
        return {"overall_accuracy": 0.0, "scores": {}}


def _build_report(results: List[TopicResult], verifier_enabled: bool) -> EvalReport:
    succeeded = [r for r in results if r.success]
    accuracies = [r.overall_accuracy for r in succeeded]
    mean_acc = sum(accuracies) / len(accuracies) if accuracies else 0.0

    # Group by level
    by_level: dict = {}
    for r in succeeded:
        by_level.setdefault(r.level, []).append(r.overall_accuracy)
    acc_by_level = {lvl: sum(v)/len(v) for lvl, v in by_level.items()}

    # Group by subject
    by_subj: dict = {}
    for r in succeeded:
        by_subj.setdefault(r.subject, []).append(r.overall_accuracy)
    acc_by_subj = {subj: sum(v)/len(v) for subj, v in by_subj.items()}

    mean_rounds = sum(r.revision_rounds for r in succeeded) / len(succeeded) if succeeded else 0

    return EvalReport(
        mode="with_verifier" if verifier_enabled else "no_verifier",
        topics_run=len(results),
        topics_succeeded=len(succeeded),
        mean_accuracy=mean_acc,
        accuracy_by_level=acc_by_level,
        accuracy_by_subject=acc_by_subj,
        mean_revision_rounds=mean_rounds,
        results=results,
    )


def save_report(report: EvalReport, output_dir: Path) -> None:
    """Save JSON + Markdown summary."""
    output_dir.mkdir(parents=True, exist_ok=True)
    fname = f"eval_{report.mode}"

    # JSON
    json_data = {
        "mode": report.mode,
        "topics_run": report.topics_run,
        "topics_succeeded": report.topics_succeeded,
        "mean_accuracy": report.mean_accuracy,
        "accuracy_by_level": report.accuracy_by_level,
        "accuracy_by_subject": report.accuracy_by_subject,
        "mean_revision_rounds": report.mean_revision_rounds,
        "results": [
            {
                "topic_id": r.topic_id,
                "topic": r.topic,
                "subject": r.subject,
                "level": r.level,
                "difficulty": r.difficulty,
                "success": r.success,
                "overall_accuracy": r.overall_accuracy,
                "revision_rounds": r.revision_rounds,
                "error": r.error,
            }
            for r in report.results
        ],
    }
    (output_dir / f"{fname}.json").write_text(json.dumps(json_data, indent=2))

    # Markdown summary
    md = f"""# EduVis AI Evaluation — {report.mode.replace('_', ' ').title()}

## Summary

| Metric | Value |
|--------|-------|
| Mode | {report.mode} |
| Topics Run | {report.topics_run} |
| Topics Succeeded | {report.topics_succeeded} |
| **Mean Accuracy** | **{report.mean_accuracy:.1%}** |
| Mean Revision Rounds | {report.mean_revision_rounds:.1f} |

## Accuracy by Academic Level

| Level | Accuracy |
|-------|----------|
{"".join(f"| {lvl} | {acc:.1%} |{chr(10)}" for lvl, acc in sorted(report.accuracy_by_level.items()))}

## Accuracy by Subject

| Subject | Accuracy |
|---------|----------|
{"".join(f"| {subj} | {acc:.1%} |{chr(10)}" for subj, acc in sorted(report.accuracy_by_subject.items()))}

## Per-Topic Results

| Topic | Subject | Level | Difficulty | Accuracy | Revisions | Status |
|-------|---------|-------|------------|----------|-----------|--------|
{"".join(f"| {r.topic[:35]} | {r.subject} | {r.level} | {r.difficulty}/10 | {r.overall_accuracy:.1%} | {r.revision_rounds} | {'✓' if r.success else '✗'} |{chr(10)}" for r in report.results)}
"""
    (output_dir / f"{fname}_summary.md").write_text(md)
    print(f"\nReport saved to: {output_dir}/{fname}_summary.md")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    parser = argparse.ArgumentParser(description="EduVis AI Evaluation Harness")
    parser.add_argument("--topics", default="eval/topics_test_set.yaml")
    parser.add_argument("--with-verifier", action="store_true", default=False)
    parser.add_argument("--no-verifier", action="store_true", default=False)
    parser.add_argument("--compare", action="store_true", help="Run both modes and compare")
    parser.add_argument("--max-topics", type=int, default=None, help="Limit topics for quick test")
    args = parser.parse_args()

    topics_data = yaml.safe_load(Path(args.topics).read_text())["topics"]

    results_dir = Path("eval/results")

    if args.compare:
        print("=== Running WITH verifier ===")
        r1 = run_evaluation(topics_data, verifier_enabled=True, max_topics=args.max_topics)
        save_report(r1, results_dir)

        print("\n=== Running WITHOUT verifier ===")
        r2 = run_evaluation(topics_data, verifier_enabled=False, max_topics=args.max_topics)
        save_report(r2, results_dir)

        print(f"\n{'='*50}")
        print(f"WITH verifier:    {r1.mean_accuracy:.1%} accuracy, {r1.mean_revision_rounds:.1f} rounds")
        print(f"WITHOUT verifier: {r2.mean_accuracy:.1%} accuracy")
        print(f"Improvement:      {(r1.mean_accuracy - r2.mean_accuracy):.1%}")

    elif args.with_verifier or (not args.no_verifier):
        report = run_evaluation(topics_data, verifier_enabled=True, max_topics=args.max_topics)
        save_report(report, results_dir)
        print(f"\nMean accuracy (WITH verifier): {report.mean_accuracy:.1%}")

    else:
        report = run_evaluation(topics_data, verifier_enabled=False, max_topics=args.max_topics)
        save_report(report, results_dir)
        print(f"\nMean accuracy (WITHOUT verifier): {report.mean_accuracy:.1%}")
