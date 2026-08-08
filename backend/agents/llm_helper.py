"""
LLM Helper Module with Automatic Model Fallback
─────────────────────────────────────────────
Handles calling Gemini models with graceful fallbacks if a specific model
encounters 429 Quota Exceeded, 404 Model Not Found, or schema errors.
"""
from __future__ import annotations

import logging
import time
from typing import Any, List, Optional

import google.generativeai as genai

logger = logging.getLogger(__name__)

# Active working models prioritized (avoiding models that hit 429 daily quota)
FALLBACK_MODELS = [
    "gemini-3.1-flash-lite",
    "gemma-4-31b-it",
    "gemma-4-26b-a4b-it",
]


def generate_content_with_fallback(
    primary_model: str,
    prompt: Any,
    generation_config: Optional[Any] = None,
    system_instruction: Optional[str] = None,
    max_retries: int = 1,
) -> genai.types.GenerateContentResponse:
    """
    Generates content using primary_model, automatically trying active fallback models
    if quota (429) or model errors occur.
    """
    models_to_try: List[str] = []
    # If primary model is exhausted (e.g. gemini-2.0-flash), place active models first
    if primary_model and "2.0-flash" not in primary_model:
        models_to_try.append(primary_model)

    for fm in FALLBACK_MODELS:
        if fm not in models_to_try:
            models_to_try.append(fm)

    last_exception: Optional[Exception] = None

    for model_name in models_to_try:
        for attempt in range(max_retries):
            try:
                model_kwargs: dict = {"model_name": model_name}
                if generation_config is not None:
                    model_kwargs["generation_config"] = generation_config
                if system_instruction is not None:
                    model_kwargs["system_instruction"] = system_instruction

                model = genai.GenerativeModel(**model_kwargs)
                response = model.generate_content(prompt, request_options={"timeout": 12})
                logger.info(f"[LLM Helper] Success with model: {model_name!r}")
                return response
            except Exception as e:
                err_msg = str(e)
                last_exception = e
                logger.warning(
                    f"[LLM Helper] Model {model_name!r} attempt {attempt+1} error: {err_msg.splitlines()[0]}"
                )

                # If quota (429) or model not found (404), break to try next active model immediately
                if "429" in err_msg or "Quota exceeded" in err_msg or "404" in err_msg:
                    break

                # If schema error (400), try removing schema and retrying JSON mode
                if "400" in err_msg and generation_config and hasattr(generation_config, "response_schema"):
                    try:
                        clean_config = genai.GenerationConfig(response_mime_type="application/json")
                        model = genai.GenerativeModel(
                            model_name=model_name,
                            generation_config=clean_config,
                            system_instruction=system_instruction,
                        )
                        response = model.generate_content(prompt, request_options={"timeout": 12})
                        logger.info(f"[LLM Helper] Success with model {model_name!r} (schema omitted)")
                        return response
                    except Exception:
                        pass

                time.sleep(0.3)

    # If all fail, raise the last exception
    raise last_exception or RuntimeError("All LLM models failed.")
