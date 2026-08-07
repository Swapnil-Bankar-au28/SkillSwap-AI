"""Google Text-to-Speech (gTTS) provider — free, no API key needed."""
from __future__ import annotations

import logging
from pathlib import Path

from backend.config import AppConfig
from backend.tts.base import BaseTTSProvider

logger = logging.getLogger(__name__)


class GTTSProvider(BaseTTSProvider):
    """Uses Google's gTTS library — free, requires internet, no API key."""

    def __init__(self, config: AppConfig):
        super().__init__(config)
        try:
            import gtts
            self._gtts = gtts
        except ImportError:
            raise ImportError("gTTS not installed. Run: pip install gTTS")

    def synthesize(self, text: str, output_path: Path) -> float:
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        tts = self._gtts.gTTS(
            text=text,
            lang=self.config.tts.language,
            slow=self.config.tts.slow,
        )
        tts.save(str(output_path))
        logger.debug(f"[gTTS] Saved to {output_path}")
        return self._get_duration(output_path)
