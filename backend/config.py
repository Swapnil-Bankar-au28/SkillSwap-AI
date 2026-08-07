"""
Config loader — reads configs/default.yaml and injects .env overrides.
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Dict, List, Optional

import yaml
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings

# Load .env from project root
_ROOT = Path(__file__).parent.parent
load_dotenv(_ROOT / ".env", override=False)
load_dotenv(_ROOT / ".env.example", override=False)


# ── Sub-config models ──────────────────────────────────────────────────────────

class LLMConfig(BaseModel):
    classifier_model: str = "gemini-3.1-flash-lite"
    research_model: str = "gemini-3.1-flash-lite"
    storyboard_model: str = "gemini-3.1-flash-lite"
    animation_model: str = "gemini-3.1-flash-lite"
    verifier_model: str = "gemini-3.1-flash-lite"
    evaluator_model: str = "gemini-3.1-flash-lite"





class TTSConfig(BaseModel):
    provider: str = "gtts"          # gtts | elevenlabs | openai
    language: str = "en"
    slow: bool = False


class SearchConfig(BaseModel):
    provider: str = "duckduckgo"
    max_results: int = 6
    trusted_domains: List[str] = Field(default_factory=list)


class PipelineConfig(BaseModel):
    max_revision_rounds: int = 3
    scenes_per_video: int = 4
    fallback_on_max_rounds: bool = True
    log_verification_rounds: bool = True


class ManimConfig(BaseModel):
    quality: str = "medium_quality"
    fps: int = 15
    background_color: str = "#0d0d1a"
    font: str = "Sans"


class ServerConfig(BaseModel):
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: List[str] = Field(default_factory=lambda: ["http://localhost:5173"])


class OutputConfig(BaseModel):
    base_dir: str = "outputs"
    keep_intermediate: bool = True


class AppConfig(BaseModel):
    llm: LLMConfig = Field(default_factory=LLMConfig)
    tts: TTSConfig = Field(default_factory=TTSConfig)
    search: SearchConfig = Field(default_factory=SearchConfig)
    pipeline: PipelineConfig = Field(default_factory=PipelineConfig)
    manim: ManimConfig = Field(default_factory=ManimConfig)
    server: ServerConfig = Field(default_factory=ServerConfig)
    output: OutputConfig = Field(default_factory=OutputConfig)

    # Injected from environment (not from YAML)
    google_api_key: str = Field(default="", description="GOOGLE_API_KEY env var")
    elevenlabs_api_key: str = Field(default="")
    openai_api_key: str = Field(default="")
    tavily_api_key: str = Field(default="")

    @property
    def output_dir(self) -> Path:
        return _ROOT / self.output.base_dir


def load_config(config_path: Optional[Path] = None) -> AppConfig:
    """Load YAML config and merge environment variables."""
    if config_path is None:
        config_path = _ROOT / "configs" / "default.yaml"

    raw: Dict[str, Any] = {}
    if config_path.exists():
        with open(config_path) as f:
            raw = yaml.safe_load(f) or {}

    config = AppConfig(**raw)

    # Inject env vars
    config.google_api_key = os.environ.get("GOOGLE_API_KEY", "")
    config.elevenlabs_api_key = os.environ.get("ELEVENLABS_API_KEY", "")
    config.openai_api_key = os.environ.get("OPENAI_API_KEY", "")
    config.tavily_api_key = os.environ.get("TAVILY_API_KEY", "")

    return config


# Singleton
_config: Optional[AppConfig] = None


def get_config() -> AppConfig:
    global _config
    if _config is None:
        _config = load_config()
    return _config
