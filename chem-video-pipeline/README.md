# EduVis AI — Multi-Agent Animated Educational Video Generator

> Ask any question from Grade 1 to PhD. Get a narrated, animated explainer video with 3D molecular visualization in seconds.

---

## Architecture

```
User Question
     │
     ▼
[1] Classifier Agent     → subject, level, topic_type, SMILES list
     │
     ▼
[2] Research Agent       → FactSheet (grounded claims, citations)
     │
     ▼
[3] Storyboard Agent     → Scene-by-scene plan (narration + visual description)
     │
     ▼
     ┌── Per-Scene Loop (≤3 revision rounds) ──────────┐
     │                                                   │
     ▼                                                   │
[4] Animation Agent  → Manim Python code OR 3D JSON     │
     │                                                   │
     ▼                                                   │
[5] Verifier Agent   → PASS or specific issues ─────────►
     │
     ▼
[6] Narration Agent  → TTS audio (gTTS / ElevenLabs / OpenAI)
     │
     ▼
[7] Assembly Agent   → Final MP4 (moviepy + ffmpeg)
```

## Why Multi-Agent?

A single "explain X" prompt reliably produces plausible-sounding but often wrong content
(wrong mechanism directions, hallucinated bond angles, incorrect formulas). The verification loop
is the core engineering contribution: it routes specific flagged issues back to the animation
agent for targeted revision, and every round is logged for auditability.

## Agent Implementation

All agents use **Google Gemini API** (gemini-1.5-flash for speed, gemini-1.5-pro for verification)
with `response_schema` + Pydantic for guaranteed structured JSON outputs. The same model provider
is used throughout, with specialization coming from system prompts and output schemas — not model diversity.
This is intentional: lower cost, faster iteration, and full swappability via `configs/default.yaml`.

## Subject Coverage

| Level | Subjects |
|-------|---------|
| Elementary (Grade 1-5) | All subjects — simplified vocabulary, concrete examples |
| Middle (Grade 6-8) | Math, Science, Social studies |
| High School (Grade 9-12) | Chemistry, Physics, Biology, Math |
| Undergraduate | Chemistry, Physics, Biology, CS, Engineering, Math |
| Graduate / PhD | Research-level chemistry, biology, physics |

## Tech Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| LLM Agents | Google Gemini API | Structured JSON output via `response_schema` |
| 2D Animation | Manim Community Edition | Mathematically precise, code-driven animations |
| 3D Molecules | 3Dmol.js + RDKit | Browser-rotatable structures from SMILES |
| Chemistry Structures | RDKit | Prevents LLM from hallucinating molecular geometry |
| TTS | gTTS (default) / ElevenLabs / OpenAI | Pluggable via config |
| Video Assembly | moviepy + ffmpeg | Scene concatenation with audio sync |
| Backend | FastAPI + WebSocket | Real-time pipeline progress |
| Frontend | React + Vite | Modern chat-style UI |

## Quick Start

```bash
# 1. Setup environment
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt

# 2. Configure API key
copy .env.example .env  # Edit and add GOOGLE_API_KEY

# 3. Run pipeline (CLI)
python backend/pipeline.py --topic "SN2 reaction mechanism"

# 4. Or run full web app
python -m uvicorn backend.main:app --reload --port 8000
cd frontend && npm install && npm run dev
# → Open http://localhost:5173
```

See `INSTALL.md` for Manim and RDKit setup.

## Verification Loop Details

The verifier checks:
- Correct electron-pushing direction (nucleophile → electrophile, never reversed)
- Correct formal charges and oxidation states
- Correct stoichiometry
- Correct stereochemical outcome
- No fabricated numeric values not in the ground-truth fact sheet

On failure, the **specific issues** (not just "try again") are passed to the revision agent.
All rounds are logged to `outputs/<run_id>/verification_log.json`.

## Evaluation Results

*(Run `python eval/accuracy_eval.py --compare` to generate these)*

| Mode | Mean Accuracy | Mean Revision Rounds |
|------|--------------|---------------------|
| With Verifier | — | — |
| Without Verifier | — | — |

Results will be populated in `eval/results/` after running the evaluation harness.

### Methodology
- LLM-as-judge (Gemini 1.5 Pro) scores each narration script against must-include claims (0/1/2 per claim)
- Human spot-check: 5 randomly selected topics per mode for inter-rater reliability
- Cohen's kappa calculated between LLM judge and human scores

### Known Limitations
- PhD-level topics (DFT, advanced stereochemistry) have highest residual error rate
- Manim code generation fails ~15-20% on first attempt — the verifier retry loop addresses this
- 3D visualization requires internet for 3Dmol.js CDN
- Without Manim installed, animations are replaced with placeholder frames

## Configuration

All providers swappable in `configs/default.yaml`:

```yaml
llm:
  animation_model: gemini-1.5-flash   # or gemini-1.5-pro
tts:
  provider: gtts                       # or: elevenlabs | openai
search:
  provider: duckduckgo                 # or: tavily | serper
```

## Project Structure

```
chem-video-pipeline/
├── backend/
│   ├── agents/          # 6 specialized LLM agents
│   ├── render/          # Manim runner, helper, video assembler
│   ├── schemas/         # Pydantic inter-agent contracts
│   ├── tts/             # Pluggable TTS providers
│   ├── pipeline.py      # Full orchestrator
│   └── main.py          # FastAPI + WebSocket
├── frontend/            # React + Vite web UI
├── eval/                # Test set + accuracy evaluation harness
├── configs/             # YAML configs
├── outputs/             # Generated videos
└── INSTALL.md           # Setup guide
```

## License

MIT
