"""
Video Assembler
────────────────
Concatenates per-scene MP4s with narration audio and generates final video.
Supports both MoviePy v1.x and v2.x.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional

logger = logging.getLogger(__name__)


@dataclass
class SceneOutput:
    scene_id: str
    video_path: Optional[Path]   # Manim-rendered MP4 (or None)
    audio_path: Optional[Path]   # TTS audio MP3
    audio_duration: float        # seconds
    narration_text: str


try:
    # MoviePy 2.x
    from moviepy import (
        VideoFileClip, AudioFileClip, ImageClip, ColorClip,
        concatenate_videoclips, CompositeAudioClip,
    )
except ImportError:
    try:
        # MoviePy 1.x
        from moviepy.editor import (
            VideoFileClip, AudioFileClip, ImageClip, ColorClip,
            concatenate_videoclips, CompositeAudioClip,
        )
    except ImportError as e:
        raise ImportError(f"moviepy/Pillow not installed: {e}. Run: pip install moviepy Pillow")


def _subclip(clip, start: float, end: float):
    if hasattr(clip, "subclipped"):
        return clip.subclipped(start, end)
    return clip.subclip(start, end)


def _set_audio(clip, audio):
    if hasattr(clip, "with_audio"):
        return clip.with_audio(audio)
    return clip.set_audio(audio)


def _with_duration(clip, duration: float):
    if hasattr(clip, "with_duration"):
        return clip.with_duration(duration)
    return clip.set_duration(duration)


def assemble_video(
    scenes: List[SceneOutput],
    output_path: Path,
    add_subtitles: bool = True,
    fade_duration: float = 0.3,
) -> Path:
    """
    Assemble all scenes into a single narrated video.

    Strategy:
      - For each scene: loop/extend animation to match audio duration.
      - Concatenate all scenes.
      - Burn subtitle SRT if add_subtitles=True.

    Returns:
        Path to the final video file.
    """
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    clips = []

    for scene in scenes:
        audio_duration = max(scene.audio_duration, 1.0)

        # Load or create animation clip
        if scene.video_path and scene.video_path.exists():
            video_clip = VideoFileClip(str(scene.video_path))
            # Loop animation to fill audio duration, or trim if longer
            if video_clip.duration < audio_duration:
                n_loops = int(audio_duration / video_clip.duration) + 1
                video_clip = _subclip(concatenate_videoclips([video_clip] * n_loops), 0, audio_duration)
            else:
                video_clip = _subclip(video_clip, 0, audio_duration)
        else:
            # Placeholder clip for scenes without video (e.g. 3D web-only scenes)
            logger.info(f"[Assemble] Creating placeholder clip for {scene.scene_id}")
            video_clip = _placeholder_clip(scene.scene_id, audio_duration)

        # Attach audio
        if scene.audio_path and scene.audio_path.exists():
            audio = _subclip(AudioFileClip(str(scene.audio_path)), 0, audio_duration)
            video_clip = _set_audio(video_clip, audio)

        clips.append(video_clip)

    if not clips:
        raise ValueError("No scene clips to assemble.")

    # Concatenate all scenes
    logger.info(f"[Assemble] Concatenating {len(clips)} scenes...")
    final = concatenate_videoclips(clips, method="compose")

    # Write output
    logger.info(f"[Assemble] Writing final video → {output_path}")
    final.write_videofile(
        str(output_path),
        fps=15,
        codec="libx264",
        audio_codec="aac",
        logger=None,
    )

    # Close all clips
    final.close()
    for c in clips:
        c.close()

    # Generate SRT if requested
    if add_subtitles:
        _write_srt(scenes, output_path.with_suffix(".srt"))

    logger.info(f"[Assemble] ✓ Final video: {output_path}")
    return output_path


def _placeholder_clip(scene_id: str, duration: float):
    """A dark placeholder clip for missing scenes."""
    try:
        from PIL import Image, ImageDraw
        import numpy as np

        img = Image.new("RGB", (854, 480), (13, 13, 26))
        d = ImageDraw.Draw(img)
        d.text((380, 230), f"[{scene_id}]", fill=(100, 160, 255))
        return _with_duration(ImageClip(np.array(img)), duration)
    except Exception:
        try:
            clip = ColorClip(size=(854, 480), color=(13, 13, 26))
        except Exception:
            clip = ColorClip((854, 480), color=(13, 13, 26))
        return _with_duration(clip, duration)


def _write_srt(scenes: List[SceneOutput], srt_path: Path) -> None:
    """Generate SRT subtitle file from narration text + timing."""
    lines = []
    t = 0.0

    for i, scene in enumerate(scenes, start=1):
        start = _fmt_time(t)
        end = _fmt_time(t + scene.audio_duration)

        # Split narration into ~2-line chunks for readability
        text = scene.narration_text.strip()
        words = text.split()
        mid = len(words) // 2
        line1 = " ".join(words[:mid])
        line2 = " ".join(words[mid:])
        subtitle_text = f"{line1}\n{line2}" if line2 else line1

        lines.append(f"{i}\n{start} --> {end}\n{subtitle_text}\n")
        t += scene.audio_duration

    srt_path.write_text("\n".join(lines), encoding="utf-8")
    logger.info(f"[Assemble] SRT written → {srt_path}")


def _fmt_time(seconds: float) -> str:
    """Format seconds as SRT timestamp HH:MM:SS,mmm"""
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds - int(seconds)) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
