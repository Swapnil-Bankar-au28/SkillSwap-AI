"""
Research / Grounding Agent
──────────────────────────
Input:  ClassifierOutput
Output: FactSheet — structured grounding with must-include claims, citations

Searches trusted educational sources and synthesizes a fact sheet
that all downstream agents use as ground truth.
"""
from __future__ import annotations

import json
import logging
from typing import List, Optional
from urllib.parse import quote_plus

import requests
from bs4 import BeautifulSoup

import google.generativeai as genai
from pydantic import ValidationError

from backend.config import AppConfig
from backend.schemas import ClassifierOutput, FactSheet, to_gemini_schema
from backend.agents.llm_helper import generate_content_with_fallback

logger = logging.getLogger(__name__)




TRUSTED_DOMAINS = [
    "libretexts.org",
    "openstax.org",
    "chem.libretexts.org",
    "phys.libretexts.org",
    "bio.libretexts.org",
    "wikipedia.org",
    "khanacademy.org",
    "mit.edu",
    "stanford.edu",
    "nih.gov",
    "chemguide.co.uk",
    "hyperphysics.phy-astr.gsu.edu",
]

SYSTEM_PROMPT = """You are an expert scientific researcher and curriculum designer.
Given raw search results about a topic, synthesize a precise, authoritative FactSheet.

Rules:
1. Extract 3-8 essential key concepts with clear definitions.
2. Formulate 3-8 "must_include_claims" — specific factual assertions the video MUST make correctly.
3. Scale vocabulary and complexity to the detected academic level.
4. For chemistry: include specific SMILES strings and mechanism steps.
5. For math: include LaTeX equations in the equations field.
6. For physics: include correct units and formulas.
7. Never fabricate numbers, constants, or mechanism steps.
8. Respond ONLY with valid JSON matching the schema."""


class ResearchAgent:
    def __init__(self, config: AppConfig):
        self.config = config
        genai.configure(api_key=config.google_api_key)
        self.model = genai.GenerativeModel(
            model_name=config.llm.research_model,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=to_gemini_schema(FactSheet),
                temperature=0.2,
            ),
            system_instruction=SYSTEM_PROMPT,
        )

    def run(self, classifier_output: ClassifierOutput) -> FactSheet:
        """Search, scrape, and synthesize a FactSheet."""
        logger.info(f"[Research] Searching for: {classifier_output.search_query}")

        excerpts = self._search_and_scrape(
            classifier_output.search_query,
            classifier_output.topic,
        )

        prompt = self._build_prompt(classifier_output, excerpts)

        try:
            response = generate_content_with_fallback(
                primary_model=self.config.llm.research_model,
                prompt=prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                    response_schema=to_gemini_schema(FactSheet),
                    temperature=0.2,
                ),
                system_instruction=SYSTEM_PROMPT,
            )
            fact_sheet = FactSheet.model_validate_json(response.text)
            fact_sheet.raw_search_excerpts = excerpts[:5]  # Keep for verifier
            logger.info(
                f"[Research] FactSheet ready — "
                f"{len(fact_sheet.must_include_claims)} claims, "
                f"{len(fact_sheet.citations)} citations"
            )
            return fact_sheet
        except (ValidationError, json.JSONDecodeError) as e:
            logger.error(f"[Research] Failed to parse FactSheet: {e}")
            raise

    def _search_and_scrape(self, query: str, topic: str) -> List[str]:
        """Search DuckDuckGo and scrape top results."""
        excerpts: List[str] = []

        try:
            from duckduckgo_search import DDGS
            with DDGS() as ddgs:
                results = list(ddgs.text(
                    f"{query} site:libretexts.org OR site:openstax.org "
                    f"OR site:khanacademy.org OR site:hyperphysics.phy-astr.gsu.edu",
                    max_results=self.config.search.max_results,
                ))

            for r in results[:self.config.search.max_results]:
                url = r.get("href", "")
                body = r.get("body", "")
                if body:
                    excerpts.append(f"[Source: {url}]\n{body[:800]}")

                # Try to scrape more content from the URL
                if url and len(excerpts) < 4:
                    scraped = self._scrape_url(url)
                    if scraped:
                        excerpts.append(f"[Scraped: {url}]\n{scraped[:1200]}")

        except Exception as e:
            logger.warning(f"[Research] DuckDuckGo search failed: {e}. Using fallback.")
            excerpts = [f"No search results available for: {topic}"]

        return excerpts

    def _scrape_url(self, url: str) -> str:
        """Scrape readable text from a URL."""
        try:
            headers = {"User-Agent": "EduVisAI/1.0 (educational research bot)"}
            resp = requests.get(url, headers=headers, timeout=8)
            if resp.status_code != 200:
                return ""
            soup = BeautifulSoup(resp.text, "lxml")

            # Remove navigation, scripts, styles
            for tag in soup(["script", "style", "nav", "footer", "header"]):
                tag.decompose()

            # Get main content
            main = soup.find("main") or soup.find("article") or soup.body
            if main:
                text = main.get_text(separator=" ", strip=True)
                return text[:1500]
        except Exception:
            pass
        return ""

    def _build_prompt(self, cls: ClassifierOutput, excerpts: List[str]) -> str:
        molecules_str = ""
        if cls.molecule_names:
            pairs = [f"{n} (SMILES: {s})" for n, s in zip(cls.molecule_names, cls.smiles_list)]
            molecules_str = f"\nRelevant molecules: {', '.join(pairs)}"

        excerpts_str = "\n\n---\n\n".join(excerpts) if excerpts else "No search results."

        return f"""Create a comprehensive fact sheet for this educational topic.

Topic: {cls.topic}
Subject: {cls.subject.value}
Academic Level: {cls.level.value}
Topic Type: {cls.topic_type.value}
Key Vocabulary: {', '.join(cls.key_vocabulary)}{molecules_str}

SEARCH RESULTS (use these as ground truth — do not fabricate):
{excerpts_str}

Generate a FactSheet with:
- summary: 2-3 sentences at {cls.level.value} level
- key_concepts: 4-7 concepts, definitions appropriate for {cls.level.value}
- must_include_claims: 5-8 specific claims that MUST be correct in the video
  (include common misconceptions in each)
- equations: LaTeX if math/physics/chemistry formulas are central
- real_world_applications: 2-3 relatable examples
- citations: source names + URLs from the search results above"""
