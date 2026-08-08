"""ElevenLabs TTS provider — high quality, requires API key."""
from __future__ import annotations

import logging
from pathlib import Path

from backend.config import AppConfig
from backend.tts.base import BaseTTSProvider

logger = logging.getLogger(__name__)


class ElevenLabsProvider(BaseTTSProvider):
    """ElevenLabs high-quality TTS. Needs ELEVENLABS_API_KEY in .env"""

    DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"  # Rachel — clear, educational

    def __init__(self, config: AppConfig):
        super().__init__(config)
        if not config.elevenlabs_api_key:
            raise ValueError("ELEVENLABS_API_KEY not set in .env")
        try:
            from elevenlabs.client import ElevenLabs
            self._client = ElevenLabs(api_key=config.elevenlabs_api_key)
        except ImportError:
            raise ImportError("elevenlabs not installed. Run: pip install elevenlabs")

    def synthesize(self, text: str, output_path: Path) -> float:
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        voice_id = getattr(self.config.tts, "voice_id", self.DEFAULT_VOICE_ID)
        audio = self._client.generate(
            text=text,
            voice=voice_id,
            model="eleven_turbo_v2",
        )

        with open(output_path, "wb") as f:
            for chunk in audio:
                f.write(chunk)

        logger.debug(f"[ElevenLabs] Saved to {output_path}")
        return self._get_duration(output_path)
