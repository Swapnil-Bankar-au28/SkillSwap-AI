"""TTS provider package."""
from .base import BaseTTSProvider
from .gtts_provider import GTTSProvider

def get_tts_provider(config) -> BaseTTSProvider:
    provider_name = config.tts.provider.lower()
    if provider_name == "gtts":
        return GTTSProvider(config)
    elif provider_name == "elevenlabs":
        from .elevenlabs_provider import ElevenLabsProvider
        return ElevenLabsProvider(config)
    elif provider_name == "openai":
        from .openai_provider import OpenAITTSProvider
        return OpenAITTSProvider(config)
    else:
        raise ValueError(f"Unknown TTS provider: {provider_name!r}. Options: gtts, elevenlabs, openai")

__all__ = ["BaseTTSProvider", "GTTSProvider", "get_tts_provider"]
