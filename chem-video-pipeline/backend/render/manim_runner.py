"""
Manim Runner
─────────────
Renders a generated Manim Scene Python file to MP4 via subprocess.
Includes AST validation before running to catch syntax errors early.
"""
from __future__ import annotations

import ast
import logging
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Optional

from backend.config import AppConfig

logger = logging.getLogger(__name__)

QUALITY_FLAGS = {
    "low_quality": "-ql",
    "medium_quality": "-qm",
    "high_quality": "-qh",
    "production_quality": "-qk",
}


class ManimRunner:
    def __init__(self, config: AppConfig):
        self.config = config
        self.quality_flag = QUALITY_FLAGS.get(
            config.manim.quality, "-qm"
        )

    def validate_code(self, code: str) -> tuple[bool, str]:
        """AST-parse the generated code before running it."""
        try:
            ast.parse(code)
            return True, ""
        except SyntaxError as e:
            return False, f"SyntaxError at line {e.lineno}: {e.msg}"

    def render_scene(
        self,
        scene_file: Path,
        class_name: str,
        output_dir: Path,
        timeout_seconds: int = 120,
    ) -> Optional[Path]:
        """
        Render a Manim scene to MP4.

        Args:
            scene_file: Path to the .py file containing the Scene class.
            class_name: Name of the class to render (e.g. "Scene_01").
            output_dir: Where to save the rendered video.
            timeout_seconds: Kill Manim if it takes longer than this.

        Returns:
            Path to the rendered MP4, or None on failure.
        """
        output_dir.mkdir(parents=True, exist_ok=True)

        # Validate syntax first
        code = scene_file.read_text(encoding="utf-8")
        valid, error = self.validate_code(code)
        if not valid:
            logger.error(f"[ManimRunner] Syntax error in {scene_file.name}: {error}")
            return None

        # Check Manim is installed
        if not shutil.which("manim"):
            logger.error("[ManimRunner] 'manim' command not found. See INSTALL.md")
            return self._generate_fallback_video(class_name, output_dir)

        cmd = [
            sys.executable, "-m", "manim",
            self.quality_flag,
            "--fps", str(self.config.manim.fps),
            "--background_color", self.config.manim.background_color,
            "--media_dir", str(output_dir),
            "--disable_caching",
            str(scene_file),
            class_name,
        ]

        logger.info(f"[ManimRunner] Rendering {class_name} from {scene_file.name}")
        logger.debug(f"[ManimRunner] cmd: {' '.join(cmd)}")

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=timeout_seconds,
            )

            if result.returncode != 0:
                logger.error(
                    f"[ManimRunner] Manim failed (exit {result.returncode}):\n{result.stderr[-2000:]}"
                )
                return None

            # Find the output MP4 (Manim saves under media/videos/.../quality/)
            mp4_candidates = list(output_dir.rglob(f"{class_name}*.mp4"))
            if not mp4_candidates:
                mp4_candidates = list(output_dir.rglob("*.mp4"))

            if mp4_candidates:
                out_file = max(mp4_candidates, key=lambda p: p.stat().st_mtime)
                logger.info(f"[ManimRunner] ✓ Rendered → {out_file}")
                return out_file
            else:
                logger.error("[ManimRunner] No MP4 found after render")
                return None

        except subprocess.TimeoutExpired:
            logger.error(f"[ManimRunner] Timeout after {timeout_seconds}s")
            return None

    def _generate_fallback_video(
        self,
        class_name: str,
        output_dir: Path,
        scene_title: str = "",
        subject: str = "general_science",
        narration_text: str = "",
        duration: float = 15.0,
        smiles_list: Optional[list] = None,
        vocabulary: Optional[list] = None,
    ) -> Optional[Path]:
        """Generate a rich graphic animated video clip if Manim CLI is not installed."""
        try:
            from backend.render.graphic_animator import generate_scene_video
            out_path = output_dir / f"{class_name}.mp4"
            title = scene_title or class_name.replace("_", " ")
            return generate_scene_video(
                scene_id=class_name,
                title=title,
                subject=subject,
                narration_text=narration_text,
                duration=duration,
                output_path=out_path,
                smiles_list=smiles_list,
                vocabulary=vocabulary,
            )
        except Exception as e:
            logger.error(f"[ManimRunner] Graphic animation rendering failed: {e}")
            return None


