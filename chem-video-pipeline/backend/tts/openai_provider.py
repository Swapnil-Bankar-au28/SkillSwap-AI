"""OpenAI TTS provider — high quality, requires OPENAI_API_KEY."""
from __future__ import annotations

import logging
from pathlib import Path

from backend.config import AppConfig
from backend.tts.base import BaseTTSProvider

logger = logging.getLogger(__name__)


class OpenAITTSProvider(BaseTTSProvider):
    """OpenAI TTS API. Needs OPENAI_API_KEY in .env"""

    def __init__(self, config: AppConfig):
        super().__init__(config)
        if not config.openai_api_key:
            raise ValueError("OPENAI_API_KEY not set in .env")
        try:
            from openai import OpenAI
            self._client = OpenAI(api_key=config.openai_api_key)
        except ImportError:
            raise ImportError("openai not installed. Run: pip install openai")

    def synthesize(self, text: str, output_path: Path) -> float:
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        voice = getattr(self.config.tts, "voice", "alloy")

        response = self._client.audio.speech.create(
            model="tts-1",
            voice=voice,
            input=text,
            response_format="mp3",
        )
        response.stream_to_file(str(output_path))
        logger.debug(f"[OpenAI TTS] Saved to {output_path}")
        return self._get_duration(output_path)
