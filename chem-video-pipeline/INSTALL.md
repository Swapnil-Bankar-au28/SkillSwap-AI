# Installation Guide — EduVis AI

## 1. Python Environment

```bash
# Python 3.11+ required
python -m venv .venv
.venv\Scripts\activate      # Windows
# or: source .venv/bin/activate  (Linux/Mac)

pip install -r requirements.txt
```

## 2. API Key Setup

```bash
copy .env.example .env     # Windows
# or: cp .env.example .env  (Linux/Mac)
```
Edit `.env` and add your Google AI Studio key:
```
GOOGLE_API_KEY=your_key_from_aistudio.google.com
```

## 3. Manim (Animation Engine) — Optional but Recommended

Manim requires LaTeX and Cairo. The pipeline has a **fallback mode** if Manim is not installed
(produces placeholder frames — all other agents still work fully).

### Option A: Conda (Recommended — handles all system deps automatically)
```bash
conda create -n eduvis python=3.11
conda activate eduvis
conda install -c conda-forge manim
pip install -r requirements.txt
```

### Option B: Manual (Windows)
1. Install [MiKTeX](https://miktex.org/download) (LaTeX)
2. Install [FFmpeg](https://ffmpeg.org/download.html) — add to PATH
3. Install Cairo: download from [cairographics.org](https://cairographics.org/download/)
4. `pip install manim`

### Verify Manim:
```bash
manim --version
# Should print: Manim Community v0.18.x
```

## 4. RDKit (Molecular Structure Generation) — Optional

RDKit is used to generate chemically correct 2D/3D molecular structures.
Without it, the pipeline skips SMILES validation and SVG generation.

### Via Conda (easiest):
```bash
conda install -c conda-forge rdkit
```

### Via pip (Python 3.8+):
```bash
pip install rdkit
```

## 5. FFmpeg — Required for video assembly

### Windows:
```bash
winget install ffmpeg
# or download from: https://ffmpeg.org/download.html#build-windows
```

### Verify:
```bash
ffmpeg -version
```

## 6. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev        # Starts at http://localhost:5173
```

## 7. Run the Backend

```bash
# From project root
python -m uvicorn backend.main:app --reload --port 8000
```

## 8. Quick Test (CLI, no frontend needed)

```bash
python backend/pipeline.py --topic "water molecule" --dry-run
# → Should classify and return without making full API calls

python backend/pipeline.py --topic "acid-base neutralization"
# → Runs full pipeline, outputs to outputs/<run_id>/
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `GOOGLE_API_KEY not set` | Copy `.env.example` → `.env`, add your key |
| `manim: command not found` | Install Manim via conda or pip. Pipeline still works without it. |
| `No module named rdkit` | Install via `conda install -c conda-forge rdkit` |
| `ffmpeg not found` | Install FFmpeg and ensure it's in PATH |
| `duckduckgo_search` errors | Temporary rate limit — try again in 30s |
| WebSocket not connecting | Make sure backend is running on port 8000 |
