"""
Graphic Video Animator
───────────────────────
Generates rich, high-quality, animated educational videos (MP4)
with glowing diagrams, physics light rays, molecular structures,
equations, and animated subtitles.

Used as a primary or fallback animation engine when Manim CLI is unavailable.
"""
from __future__ import annotations

import math
import logging
from pathlib import Path
from typing import List, Optional

import numpy as np
from PIL import Image, ImageDraw, ImageFont

try:
    from moviepy import ImageSequenceClip
except ImportError:
    from moviepy.editor import ImageSequenceClip

logger = logging.getLogger(__name__)

# Colors
COLOR_BG_TOP = (13, 13, 26)
COLOR_BG_BOTTOM = (25, 25, 55)
COLOR_ACCENT_BLUE = (60, 140, 255)
COLOR_ACCENT_CYAN = (45, 212, 191)
COLOR_ACCENT_RED = (248, 113, 113)
COLOR_ACCENT_YELLOW = (251, 191, 36)
COLOR_ACCENT_PURPLE = (168, 85, 247)
COLOR_WHITE = (255, 255, 255)
COLOR_TEXT_MUTED = (160, 175, 200)


def generate_scene_video(
    scene_id: str,
    title: str,
    subject: str,
    narration_text: str,
    duration: float,
    output_path: Path,
    visual_description: str = "",
    smiles_list: Optional[List[str]] = None,
    vocabulary: Optional[List[str]] = None,
    fps: int = 15,
    width: int = 854,
    height: int = 480,
) -> Path:
    """Generate a full animated MP4 video clip for a scene."""
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    n_frames = max(int(duration * fps), fps)
    frames = []

    # Detect visual theme based on subject & description
    theme = _detect_theme(subject, title, visual_description)

    for frame_idx in range(n_frames):
        t = frame_idx / fps
        progress = frame_idx / max(n_frames - 1, 1)

        # Create gradient canvas
        img = _create_gradient_background(width, height, t)
        draw = ImageDraw.Draw(img)

        # Render Header Badge
        _render_header(draw, subject, title, width)

        # Render Main Diagram based on theme
        if theme == "optics":
            _render_optics_diagram(draw, width, height, t, progress)
        elif theme == "chemistry":
            _render_chemistry_diagram(draw, width, height, t, smiles_list)
        elif theme == "math":
            _render_math_diagram(draw, width, height, t, progress)
        else:
            _render_conceptual_diagram(draw, width, height, t, progress, vocabulary)

        # Render Subtitles Banner at Bottom
        _render_subtitles(draw, narration_text, width, height)

        frames.append(np.array(img))

    clip = ImageSequenceClip(frames, fps=fps)
    temp_audio = str(output_path.parent / f"{output_path.stem}_temp_audio.m4a")
    clip.write_videofile(
        str(output_path),
        fps=fps,
        codec="libx264",
        audio_codec="aac",
        temp_audiofile=temp_audio,
        logger=None,
    )
    clip.close()
    logger.info(f"[GraphicAnimator] Generated clip: {output_path} ({duration:.1f}s)")
    return output_path


def _detect_theme(subject: str, title: str, desc: str) -> str:
    combined = (subject + " " + title + " " + desc).lower()
    if any(k in combined for k in ["light", "sky", "blue", "optics", "rayleigh", "scattering", "prism", "refraction", "photon"]):
        return "optics"
    if any(k in combined for k in ["chemistry", "molecule", "atom", "bond", "reaction", "sn2", "water", "h2o", "acid", "element"]):
        return "chemistry"
    if any(k in combined for k in ["math", "mathematics", "euler", "formula", "equation", "calculus", "function", "graph", "geometry", "vector", "derivation", "proof", "trigonometry", "algebra"]):
        return "math"
    return "conceptual"


def _create_gradient_background(width: int, height: int, t: float) -> Image.Image:
    """Create gradient background with animated glowing grid particles."""
    base = Image.new("RGB", (width, height), COLOR_BG_TOP)
    draw = ImageDraw.Draw(base)

    # Soft glowing background grid lines
    grid_size = 40
    shift = int((t * 15) % grid_size)
    for x in range(-grid_size + shift, width + grid_size, grid_size):
        draw.line([(x, 0), (x, height)], fill=(20, 25, 45), width=1)
    for y in range(0, height, grid_size):
        draw.line([(0, y), (width, y)], fill=(20, 25, 45), width=1)

    # Floating ambient particles
    for i in range(12):
        px = int((i * 73 + t * 20) % width)
        py = int((i * 41 + math.sin(t + i) * 30 + 200) % height)
        size = 2 + (i % 3)
        draw.ellipse([px, py, px + size, py + size], fill=(50, 90, 160))

    return base


def _render_header(draw: ImageDraw.ImageDraw, subject: str, title: str, width: int):
    """Render top header badge."""
    # Subject Pill
    subj_str = subject.upper()
    draw.rectangle([24, 18, 140, 42], fill=(30, 50, 90), outline=COLOR_ACCENT_BLUE, width=1)
    draw.text((82, 30), subj_str, fill=COLOR_ACCENT_CYAN, anchor="mm")

    # Title
    draw.text((156, 30), title, fill=COLOR_WHITE, anchor="lm")


def _render_optics_diagram(draw: ImageDraw.ImageDraw, width: int, height: int, t: float, progress: float):
    """Render Rayleigh Scattering / Optics Light Wave Diagram."""
    cx, cy = width // 2, height // 2 - 10

    # Sun source on left
    sun_x, sun_y = 100, cy
    sun_r = 36 + int(4 * math.sin(t * 3))
    draw.ellipse([sun_x - sun_r, sun_y - sun_r, sun_x + sun_r, sun_y + sun_r], fill=COLOR_ACCENT_YELLOW)
    draw.text((sun_x, sun_y), "Sun", fill=(20, 20, 20), anchor="mm")

    # Atmosphere Region Box
    atmo_box = [260, 90, 680, cy + 120]
    draw.rectangle(atmo_box, fill=(20, 30, 60), outline=(60, 100, 180), width=2)
    draw.text((470, 110), "Earth's Atmosphere (N₂ & O₂ Molecules)", fill=COLOR_TEXT_MUTED, anchor="mm")

    # Air Molecules Grid
    molecules = [(320, 170), (420, 230), (520, 180), (600, 240), (370, 270), (490, 290)]
    for mx, my in molecules:
        draw.ellipse([mx - 10, my - 10, mx + 10, my + 10], fill=(40, 80, 150), outline=COLOR_ACCENT_CYAN)

    # Incoming White Light Beam
    beam_x = sun_x + sun_r + int((t * 120) % 140)
    draw.line([(sun_x + sun_r, cy), (320, cy)], fill=(240, 240, 255), width=4)

    # Scattering Blue Light Waves (radial scattering)
    for angle in range(0, 360, 45):
        rad = math.radians(angle)
        dist = 30 + int((t * 80 + angle * 2) % 90)
        bx = 420 + int(dist * math.cos(rad))
        by = 230 + int(dist * math.sin(rad))
        draw.ellipse([bx - 4, by - 4, bx + 4, by + 4], fill=COLOR_ACCENT_BLUE)

    # Transmitted Red Light Ray (passes straight through)
    draw.line([(320, cy + 20), (760, cy + 20)], fill=COLOR_ACCENT_RED, width=3)
    draw.text((720, cy + 38), "Red Light (Longer λ)", fill=COLOR_ACCENT_RED, anchor="mm")
    draw.text((470, cy - 65), "Blue Light Scatters (Short λ)", fill=COLOR_ACCENT_BLUE, anchor="mm")

    # Formula Card
    draw.rectangle([280, cy + 85, 660, cy + 115], fill=(15, 20, 40), outline=COLOR_ACCENT_PURPLE, width=1)
    draw.text((470, cy + 100), "Rayleigh Scattering: Intensity  I ∝ 1 / λ⁴", fill=COLOR_ACCENT_CYAN, anchor="mm")


def _render_chemistry_diagram(draw: ImageDraw.ImageDraw, width: int, height: int, t: float, smiles_list: Optional[List[str]]):
    """Render 2D/3D Molecule Ball-and-Stick Structure."""
    cx, cy = width // 2, height // 2 - 10

    # Draw Central Water H2O / Nitrogen N2 Molecule
    rot = t * 1.5

    # Oxygen Atom (Center Red)
    ox, oy = cx, cy - 10
    draw.ellipse([ox - 32, oy - 32, ox + 32, oy + 32], fill=(239, 68, 68), outline=COLOR_WHITE, width=2)
    draw.text((ox, oy), "O", fill=COLOR_WHITE, anchor="mm")

    # Hydrogen Atom 1
    h1_angle = rot + 2.2
    h1x = int(ox + 90 * math.cos(h1_angle))
    h1y = int(oy + 60 * math.sin(h1_angle))
    draw.line([(ox, oy), (h1x, h1y)], fill=(200, 200, 220), width=6)
    draw.ellipse([h1x - 20, h1y - 20, h1x + 20, h1y + 20], fill=(240, 240, 250), outline=COLOR_WHITE, width=2)
    draw.text((h1x, h1y), "H", fill=(30, 30, 30), anchor="mm")

    # Hydrogen Atom 2
    h2_angle = rot + 4.1
    h2x = int(ox + 90 * math.cos(h2_angle))
    h2y = int(oy + 60 * math.sin(h2_angle))
    draw.line([(ox, oy), (h2x, h2y)], fill=(200, 200, 220), width=6)
    draw.ellipse([h2x - 20, h2y - 20, h2x + 20, h2y + 20], fill=(240, 240, 250), outline=COLOR_WHITE, width=2)
    draw.text((h2x, h2y), "H", fill=(30, 30, 30), anchor="mm")

    # Molecular Badge Card
    smiles_str = smiles_list[0] if smiles_list else "O (Water)"
    draw.rectangle([cx - 150, cy + 95, cx + 150, cy + 125], fill=(20, 30, 60), outline=COLOR_ACCENT_CYAN, width=1)
    draw.text((cx, cy + 110), f"Molecule: H₂O  |  SMILES: {smiles_str}", fill=COLOR_ACCENT_CYAN, anchor="mm")


def _render_math_diagram(draw: ImageDraw.ImageDraw, width: int, height: int, t: float, progress: float):
    """Render Animated Complex Unit Circle, Euler's Identity & Waves."""
    cx, cy = width // 2 - 120, height // 2 - 10
    radius = 90

    # Complex Axes (Real Re vs Imaginary Im)
    draw.line([(cx - 110, cy), (cx + 110, cy)], fill=COLOR_TEXT_MUTED, width=2)
    draw.line([(cx, cy - 110), (cx, cy + 110)], fill=COLOR_TEXT_MUTED, width=2)
    draw.text((cx + 120, cy), "Re", fill=COLOR_TEXT_MUTED, anchor="mm")
    draw.text((cx, cy - 122), "Im (i)", fill=COLOR_ACCENT_CYAN, anchor="mm")

    # Unit Circle
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], outline=(60, 90, 160), width=2)

    # Rotating Phasor e^(iθ)
    theta = (t * 2.0) % (2 * math.pi)
    px = int(cx + radius * math.cos(theta))
    py = int(cy - radius * math.sin(theta))

    # Radius vector line
    draw.line([(cx, cy), (px, py)], fill=COLOR_ACCENT_YELLOW, width=3)
    draw.ellipse([px - 6, py - 6, px + 6, py + 6], fill=COLOR_ACCENT_CYAN, outline=COLOR_WHITE, width=2)

    # Cosine projection line (Re)
    draw.line([(cx, cy), (px, cy)], fill=COLOR_ACCENT_YELLOW, width=3)

    # Sine projection line (Im)
    draw.line([(px, cy), (px, py)], fill=COLOR_ACCENT_CYAN, width=3)

    # Right side: Sine / Cosine Wave plot
    wave_start_x = cx + 180
    draw.line([(wave_start_x, cy), (wave_start_x + 220, cy)], fill=COLOR_TEXT_MUTED, width=1)
    wave_pts = []
    for step in range(0, 220, 3):
        x_val = step / 30.0
        y_val = math.sin(x_val - theta) * 60
        wave_pts.append((wave_start_x + step, int(cy - y_val)))

    if len(wave_pts) > 1:
        draw.line(wave_pts, fill=COLOR_ACCENT_CYAN, width=3)

    # Connecting dashed line from circle point to wave start
    draw.line([(px, py), (wave_start_x, py)], fill=(100, 120, 160), width=1)

    # Formulas Card
    draw.rectangle([cx - 120, cy + 125, cx + 380, cy + 160], fill=(20, 30, 60), outline=COLOR_ACCENT_PURPLE, width=1)
    draw.text((cx + 130, cy + 142), "Euler's Formula:  e^(iθ) = cos(θ) + i·sin(θ)   |   e^(iπ) + 1 = 0", fill=COLOR_WHITE, anchor="mm")



def _render_conceptual_diagram(
    draw: ImageDraw.ImageDraw, width: int, height: int, t: float, progress: float, vocab: Optional[List[str]]
):
    """Render Multi-step Concept Flow Nodes."""
    cx, cy = width // 2, height // 2 - 10

    nodes = ["1. Source", "2. Interaction", "3. Result"]
    node_xs = [220, 427, 634]

    for idx, (name, nx) in enumerate(zip(nodes, node_xs)):
        is_active = (progress * 3) >= idx
        bg_col = (40, 90, 180) if is_active else (25, 30, 55)
        border_col = COLOR_ACCENT_CYAN if is_active else (60, 70, 100)

        # Draw Node Circle
        draw.ellipse([nx - 45, cy - 45, nx + 45, cy + 45], fill=bg_col, outline=border_col, width=2)
        draw.text((nx, cy), name, fill=COLOR_WHITE, anchor="mm")

        # Arrow to next node
        if idx < len(nodes) - 1:
            draw.line([(nx + 50, cy), (node_xs[idx + 1] - 50, cy)], fill=COLOR_TEXT_MUTED, width=2)

    # Vocabulary Badges at bottom
    if vocab:
        terms_str = " • ".join(vocab[:4])
        draw.rectangle([cx - 200, cy + 85, cx + 200, cy + 115], fill=(20, 30, 60), outline=COLOR_ACCENT_BLUE, width=1)
        draw.text((cx, cy + 100), f"Key Terms: {terms_str}", fill=COLOR_ACCENT_CYAN, anchor="mm")


def _render_subtitles(draw: ImageDraw.ImageDraw, narration_text: str, width: int, height: int):
    """Render readable bottom subtitle banner."""
    if not narration_text:
        return

    words = narration_text.strip().split()
    if not words:
        return

    # Format into max 2 lines (~60 chars max per line)
    line1_words, line2_words = [], []
    curr_len = 0
    for w in words:
        if curr_len + len(w) < 45:
            line1_words.append(w)
            curr_len += len(w) + 1
        else:
            line2_words.append(w)

    l1 = " ".join(line1_words)
    l2 = " ".join(line2_words)
    sub_text = f"{l1}\n{l2}" if l2 else l1

    banner_y = height - 60
    draw.rectangle([40, banner_y - 22, width - 40, banner_y + 22], fill=(10, 10, 22), outline=(40, 50, 80), width=1)
    draw.text((width // 2, banner_y), sub_text, fill=COLOR_WHITE, anchor="mm")
