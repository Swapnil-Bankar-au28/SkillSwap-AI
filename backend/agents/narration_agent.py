"""
Narration / TTS Agent
──────────────────────
Input:  narration_text + output path
Output: audio file path + duration in seconds

Dispatches to the configured TTS provider.
Provider is fully swappable via configs/default.yaml.
"""
from __future__ import annotations

import logging
from pathlib import Path

from backend.config import AppConfig
from backend.tts import get_tts_provider

logger = logging.getLogger(__name__)


class NarrationAgent:
    def __init__(self, config: AppConfig):
        self.config = config
        self.provider = get_tts_provider(config)

    def run(self, narration_text: str, output_path: Path) -> float:
        """
        Synthesize narration audio.

        Returns:
            duration_seconds: length of the audio file
        """
        logger.info(
            f"[Narration] Synthesizing {len(narration_text)} chars → {output_path.name}"
        )
        duration = self.provider.synthesize(narration_text, output_path)
        logger.info(f"[Narration] Audio: {duration:.1f}s → {output_path}")
        return duration
