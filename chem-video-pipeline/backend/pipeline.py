"""
Pipeline Orchestrator
──────────────────────
Runs all agents in sequence:
  Classifier → Research → Storyboard → [AnimationAgent + VerifierLoop + Narration] → Assembly

Logs every stage's input/output JSON to the run directory for auditability.
"""
from __future__ import annotations

import json
import logging
import time
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, List, Optional

from backend.config import AppConfig, get_config
from backend.agents import (
    ClassifierAgent, ResearchAgent, StoryboardAgent,
    AnimationAgent, VerifierAgent, NarrationAgent,
)
from backend.agents.animation_agent import AnimationOutput
from backend.render.manim_runner import ManimRunner
from backend.render.assemble_video import SceneOutput, assemble_video
from backend.schemas import VerificationIssue

logger = logging.getLogger(__name__)


# ── Pipeline result ────────────────────────────────────────────────────────────

@dataclass
class SceneResult:
    scene_id: str
    animation_output: Optional[AnimationOutput] = None
    video_path: Optional[Path] = None
    audio_path: Optional[Path] = None
    audio_duration: float = 0.0
    narration_text: str = ""
    revision_rounds: int = 0
    approved: bool = False
    verification_log: list = field(default_factory=list)
    viewer_3d_config: Optional[dict] = None  # For 3Dmol.js / Three.js scenes


@dataclass
class PipelineResult:
    run_id: str
    topic: str
    subject: str
    level: str
    final_video_path: Optional[Path] = None
    scene_results: List[SceneResult] = field(default_factory=list)
    total_duration_seconds: float = 0.0
    total_revision_rounds: int = 0
    success: bool = False
    error: Optional[str] = None
    run_dir: Optional[Path] = None


# ── Progress callback type ─────────────────────────────────────────────────────

ProgressCallback = Callable[[str, str, float], None]
# (stage_name, message, progress_0_to_1) → None


def _noop_progress(stage: str, msg: str, progress: float) -> None:
    logger.info(f"[{stage}] ({progress*100:.0f}%) {msg}")


# ── Main Pipeline ──────────────────────────────────────────────────────────────

class Pipeline:
    def __init__(
        self,
        config: Optional[AppConfig] = None,
        verifier_enabled: bool = True,
    ):
        self.config = config or get_config()
        self.verifier_enabled = verifier_enabled

        # Initialize all agents
        self.classifier = ClassifierAgent(self.config)
        self.researcher = ResearchAgent(self.config)
        self.storyboarder = StoryboardAgent(self.config)
        self.animator = AnimationAgent(self.config)
        self.verifier = VerifierAgent(self.config) if verifier_enabled else None
        self.narrator = NarrationAgent(self.config)
        self.manim_runner = ManimRunner(self.config)

    def run(
        self,
        topic: str,
        progress_cb: ProgressCallback = _noop_progress,
        dry_run: bool = False,
    ) -> PipelineResult:
        """Run the full pipeline for a given topic."""
        run_id = str(uuid.uuid4())[:8]
        run_dir = self.config.output_dir / run_id
        run_dir.mkdir(parents=True, exist_ok=True)

        result = PipelineResult(run_id=run_id, topic=topic, subject="", level="", run_dir=run_dir)
        start_time = time.time()

        try:
            # ── Stage 1: Classify ─────────────────────────────────────────────
            progress_cb("classify", f"Classifying topic: {topic}", 0.05)
            classifier_out = self.classifier.run(topic)
            result.subject = classifier_out.subject.value
            result.level = classifier_out.level.value
            self._save_json(run_dir / "classifier_output.json", classifier_out.model_dump())

            if dry_run:
                result.success = True
                return result

            # ── Stage 2: Research ─────────────────────────────────────────────
            progress_cb("research", "Searching educational sources...", 0.15)
            factsheet = self.researcher.run(classifier_out)
            self._save_json(run_dir / "factsheet.json", factsheet.model_dump())

            # ── Stage 3: Storyboard ────────────────────────────────────────────
            progress_cb("storyboard", "Planning scenes...", 0.25)
            storyboard = self.storyboarder.run(factsheet, classifier_out)
            self._save_json(run_dir / "storyboard.json", storyboard.model_dump())

            # ── Stage 4: Per-scene loop (Animation + Verify + Narration) ───────
            scene_results: List[SceneResult] = []
            n_scenes = len(storyboard.scenes)

            for i, scene in enumerate(storyboard.scenes):
                scene_progress = 0.30 + (i / n_scenes) * 0.50
                progress_cb(
                    "animation",
                    f"Animating scene {i+1}/{n_scenes}: {scene.title}",
                    scene_progress,
                )

                scene_result = self._run_scene(
                    scene=scene,
                    factsheet=factsheet,
                    classifier_out=classifier_out,
                    run_dir=run_dir,
                    scene_index=i,
                    progress_cb=progress_cb,
                )
                scene_results.append(scene_result)
                result.total_revision_rounds += scene_result.revision_rounds

            result.scene_results = scene_results

            # ── Stage 5: Assembly ─────────────────────────────────────────────
            progress_cb("assembly", "Assembling final video...", 0.85)
            final_video = self._assemble(scene_results, run_dir, topic)
            result.final_video_path = final_video
            result.total_duration_seconds = sum(s.audio_duration for s in scene_results)

            # Save verification log
            self._save_verification_log(scene_results, run_dir)

            result.success = True
            elapsed = time.time() - start_time
            progress_cb("done", f"✓ Video ready in {elapsed:.1f}s", 1.0)
            logger.info(f"[Pipeline] Run {run_id} complete → {final_video}")

        except Exception as e:
            logger.exception(f"[Pipeline] Run {run_id} failed: {e}")
            result.error = str(e)
            result.success = False

        return result

    def _run_scene(
        self,
        scene,
        factsheet,
        classifier_out,
        run_dir: Path,
        scene_index: int,
        progress_cb: ProgressCallback,
    ) -> SceneResult:
        """Run animation → verify → revise loop for one scene."""
        sr = SceneResult(scene_id=scene.scene_id, narration_text=scene.narration_text)
        scene_dir = run_dir / scene.scene_id
        scene_dir.mkdir(exist_ok=True)

        revision_issues: List[VerificationIssue] = []
        max_rounds = self.config.pipeline.max_revision_rounds

        for round_num in range(1, max_rounds + 1):
            # Generate animation
            anim_out = self.animator.run(scene, revision_issues or None, scene_dir)
            sr.animation_output = anim_out

            # Save generated code
            code_file = scene_dir / f"animation_r{round_num}.py"
            if anim_out.animation_type in ("manim_2d", "manim_molecule"):
                code_file.write_text(anim_out.code, encoding="utf-8")

                # Render
                mp4 = self.manim_runner.render_scene(
                    code_file, anim_out.class_name, scene_dir
                )
                if not mp4 or not mp4.exists():
                    mp4 = self.manim_runner._generate_fallback_video(
                        class_name=anim_out.class_name or f"Scene_{scene_index+1:02d}",
                        output_dir=scene_dir,
                        scene_title=scene.title,
                        subject=classifier_out.subject.value,
                        narration_text=scene.narration_text,
                        duration=scene.duration_hint_seconds,
                        smiles_list=classifier_out.smiles_list,
                        vocabulary=classifier_out.key_vocabulary,
                    )
                sr.video_path = mp4
            else:
                # 3D viewer — save JSON config for frontend
                config_file = scene_dir / "viewer_3d_config.json"
                config_file.write_text(anim_out.code)
                try:
                    sr.viewer_3d_config = json.loads(anim_out.code)
                except Exception:
                    pass
                sr.video_path = None  # Rendered in browser, not as MP4

            # Ensure 3D viewer config is available for 3D Molecular Viewer panel
            if not sr.viewer_3d_config:
                mols = []
                if scene.molecules:
                    mols = [{"name": m.name, "smiles": m.smiles} for m in scene.molecules]
                elif classifier_out.smiles_list:
                    names = classifier_out.molecule_names or ["Molecule"] * len(classifier_out.smiles_list)
                    mols = [{"name": n, "smiles": s} for n, s in zip(names, classifier_out.smiles_list)]
                else:
                    # Atmospheric / general science fallback molecules for 3D viewer
                    mols = [
                        {"name": "Nitrogen (N₂)", "smiles": "N#N"},
                        {"name": "Oxygen (O₂)", "smiles": "O=O"},
                        {"name": "Water (H₂O)", "smiles": "O"},
                    ]
                sr.viewer_3d_config = {
                    "viewer_type": "3dmol",
                    "molecules": mols,
                    "camera": {"zoom": 1.5},
                    "rotation_animation": {"axis": "y"},
                    "background_color": "#0d0d1a"
                }

            # Verify (if enabled)
            if self.verifier_enabled and self.verifier:
                verification = self.verifier.run(
                    factsheet, scene, anim_out.code, round_num
                )
                sr.verification_log.append(verification.model_dump())
                self._save_json(
                    scene_dir / f"verification_r{round_num}.json",
                    verification.model_dump(),
                )

                if verification.approved:
                    sr.approved = True
                    sr.revision_rounds = round_num
                    break
                else:
                    revision_issues = [
                        i for i in verification.issues
                        if i.severity.value in ("critical", "major")
                    ]
                    if round_num == max_rounds:
                        logger.warning(
                            f"[Pipeline] {scene.scene_id} max rounds reached — "
                            "shipping best-so-far with issues flagged"
                        )
                        sr.approved = False
                        sr.revision_rounds = round_num
            else:
                # Verifier disabled — approve immediately
                sr.approved = True
                sr.revision_rounds = 1
                break

        # Narration audio
        audio_path = scene_dir / f"{scene.scene_id}_narration.mp3"
        try:
            duration = self.narrator.run(scene.narration_text, audio_path)
            sr.audio_path = audio_path
            sr.audio_duration = duration
        except Exception as e:
            logger.error(f"[Pipeline] Narration failed for {scene.scene_id}: {e}")
            sr.audio_duration = scene.duration_hint_seconds

        return sr

    def _assemble(
        self, scene_results: List[SceneResult], run_dir: Path, topic: str
    ) -> Optional[Path]:
        """Assemble all scenes into final video."""
        scenes_for_assembly = [
            SceneOutput(
                scene_id=sr.scene_id,
                video_path=sr.video_path,
                audio_path=sr.audio_path,
                audio_duration=sr.audio_duration,
                narration_text=sr.narration_text,
            )
            for sr in scene_results
        ]

        # Check if any scene has a real video file
        has_video = any(s.video_path and s.video_path.exists() for s in scenes_for_assembly)
        if not has_video:
            logger.warning("[Pipeline] No rendered videos — final video will be audio-only placeholder")

        safe_topic = "".join(c if c.isalnum() or c in "-_" else "_" for c in topic[:40])
        output_path = run_dir / f"{safe_topic}_final.mp4"

        return assemble_video(scenes_for_assembly, output_path)

    def _save_json(self, path: Path, data: dict) -> None:
        path.write_text(json.dumps(data, indent=2, default=str), encoding="utf-8")

    def _save_verification_log(self, scene_results: List[SceneResult], run_dir: Path) -> None:
        log = {
            "total_scenes": len(scene_results),
            "total_revision_rounds": sum(s.revision_rounds for s in scene_results),
            "scenes": [
                {
                    "scene_id": s.scene_id,
                    "approved": s.approved,
                    "revision_rounds": s.revision_rounds,
                    "verification_rounds": s.verification_log,
                }
                for s in scene_results
            ],
        }
        self._save_json(run_dir / "verification_log.json", log)


# ── CLI entry point ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import argparse
    from rich.console import Console
    from rich.progress import Progress, SpinnerColumn, TextColumn

    console = Console()

    parser = argparse.ArgumentParser(description="EduVis AI — Animated Educational Video Generator")
    parser.add_argument("--topic", required=True, help='Topic to explain (e.g. "SN2 reaction mechanism")')
    parser.add_argument("--no-verifier", action="store_true", help="Skip the verification loop")
    parser.add_argument("--dry-run", action="store_true", help="Only classify, no API calls to render")
    parser.add_argument("--config", default=None, help="Path to custom config YAML")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")

    config = get_config()
    if not config.google_api_key:
        console.print("[bold red]ERROR:[/] GOOGLE_API_KEY not set. Copy .env.example to .env and add your key.")
        exit(1)

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console,
    ) as progress:
        task = progress.add_task("Starting pipeline...", total=None)

        def on_progress(stage: str, msg: str, pct: float):
            progress.update(task, description=f"[cyan]{stage}[/] {msg}")

        pipeline = Pipeline(config, verifier_enabled=not args.no_verifier)
        result = pipeline.run(args.topic, progress_cb=on_progress, dry_run=args.dry_run)

    if result.success:
        console.print(f"\n[bold green]✓ Done![/] Video: [link]{result.final_video_path}[/link]")
        console.print(f"  Run ID: {result.run_id}")
        console.print(f"  Duration: {result.total_duration_seconds:.1f}s")
        console.print(f"  Revision rounds: {result.total_revision_rounds}")
    else:
        console.print(f"\n[bold red]✗ Pipeline failed:[/] {result.error}")
