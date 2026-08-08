"""Abstract base class for all TTS providers."""
from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import Path

from backend.config import AppConfig


class BaseTTSProvider(ABC):
    def __init__(self, config: AppConfig):
        self.config = config

    @abstractmethod
    def synthesize(self, text: str, output_path: Path) -> float:
        """
        Convert text to speech and save to output_path.

        Args:
            text: The narration text to speak.
            output_path: Where to save the .mp3 / .wav file.

        Returns:
            Duration of the audio in seconds.
        """
        ...

    def _get_duration(self, audio_path: Path) -> float:
        """Get audio duration using moviepy."""
        try:
            try:
                from moviepy import AudioFileClip
            except ImportError:
                from moviepy.editor import AudioFileClip
            clip = AudioFileClip(str(audio_path))
            duration = clip.duration
            clip.close()
            return float(duration)
        except Exception:
            return 5.0
