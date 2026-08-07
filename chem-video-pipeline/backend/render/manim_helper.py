"""
Manim Helper — Reusable Chemistry/Physics/Math Primitives
──────────────────────────────────────────────────────────
The Animation Agent is instructed to `from manim_helper import *`.
This keeps generated code short and reduces hallucination of custom drawing logic.

ALL classes and functions here are drop-in Manim Mobjects or utilities.
"""
from manim import *
import numpy as np


# ── Color Palette (dark-mode optimized) ──────────────────────────────────────

CHEM_BLUE = "#4488ff"
CHEM_RED = "#ff4455"
CHEM_GREEN = "#44cc77"
CHEM_YELLOW = "#ffdd44"
CHEM_ORANGE = "#ff8833"
CHEM_PURPLE = "#aa55ff"
CHEM_CYAN = "#44ddee"
BACKGROUND = "#0d0d1a"

ATOM_COLORS = {
    "H": "#ffffff", "C": "#aaaaaa", "N": "#4488ff",
    "O": "#ff4444", "S": "#ffcc00", "F": "#44ff88",
    "Cl": "#00cc44", "Br": "#cc4400", "I": "#8844cc",
    "P": "#ff8800", "Na": "#ffaa00", "K": "#cc44ff",
}


# ── Molecular Diagram Helpers ─────────────────────────────────────────────────

def molecule_svg(svg_path: str, scale: float = 1.5) -> SVGMobject:
    """Load a RDKit-generated molecule SVG into Manim."""
    mol = SVGMobject(svg_path)
    mol.scale(scale)
    mol.set_color(WHITE)
    return mol


def atom_dot(symbol: str, color: str = None, radius: float = 0.3) -> VGroup:
    """A labeled atom circle."""
    color = color or ATOM_COLORS.get(symbol, WHITE)
    circle = Circle(radius=radius, color=color, fill_color=color, fill_opacity=0.9)
    label = Text(symbol, font_size=18, color=BLACK, weight=BOLD)
    return VGroup(circle, label)


def chemistry_arrow(
    start: np.ndarray,
    end: np.ndarray,
    color: str = CHEM_YELLOW,
    tip_length: float = 0.2,
) -> CurvedArrow:
    """A curved electron-pushing arrow (like in mechanism drawings)."""
    mid = (start + end) / 2 + UP * 0.5
    arrow = CurvedArrow(
        start_point=start,
        end_point=end,
        color=color,
        tip_length=tip_length,
        stroke_width=3,
    )
    return arrow


def lone_pair(position: np.ndarray, angle_deg: float = 0) -> VGroup:
    """Two dots representing a lone pair of electrons."""
    angle = np.radians(angle_deg)
    offset = np.array([np.cos(angle), np.sin(angle), 0]) * 0.15
    d1 = Dot(point=position + offset, radius=0.05, color=CHEM_YELLOW)
    d2 = Dot(point=position - offset, radius=0.05, color=CHEM_YELLOW)
    return VGroup(d1, d2)


# ── Energy Diagram ─────────────────────────────────────────────────────────────

class EnergyDiagram(VGroup):
    """
    A reaction energy diagram with reactants, transition state, products.

    Usage:
        diag = EnergyDiagram(
            levels=[0.0, 2.5, -1.0],
            labels=["Reactants", "Transition\nState", "Products"],
        )
    """
    def __init__(
        self,
        levels: list,          # Energy values (arbitrary units)
        labels: list,          # Labels for each level
        colors: list = None,
        width: float = 5.0,
        height: float = 3.5,
        **kwargs,
    ):
        super().__init__(**kwargs)
        colors = colors or [CHEM_BLUE, CHEM_RED, CHEM_GREEN]
        n = len(levels)
        xs = np.linspace(-width / 2, width / 2, n)
        min_e, max_e = min(levels), max(levels)
        e_range = max_e - min_e or 1.0

        def y(e): return (e - min_e) / e_range * height - height / 2

        # Draw horizontal level lines
        for i, (x, e) in enumerate(zip(xs, levels)):
            color = colors[i % len(colors)]
            line = Line(
                start=[x - 0.4, y(e), 0],
                end=[x + 0.4, y(e), 0],
                color=color, stroke_width=4,
            )
            self.add(line)

            lbl = Text(labels[i], font_size=16, color=color).next_to(
                line, DOWN if e < max_e else UP, buff=0.1
            )
            self.add(lbl)

        # Draw connecting curved path
        points = [[xs[i], y(levels[i]), 0] for i in range(n)]
        path = VMobject(color=WHITE, stroke_width=1.5, stroke_opacity=0.4)
        path.set_points_as_corners(points)
        self.add(path)

        # Y-axis label
        y_label = Text("Energy", font_size=18, color=GREY).rotate(PI / 2).shift(LEFT * (width / 2 + 0.6))
        self.add(y_label)


# ── Orbital Shapes ────────────────────────────────────────────────────────────

class SOrbital(VGroup):
    """Spherical s-orbital."""
    def __init__(self, color=CHEM_BLUE, radius=0.8, opacity=0.4, **kwargs):
        super().__init__(**kwargs)
        sphere = Circle(radius=radius, color=color, fill_color=color, fill_opacity=opacity)
        self.add(sphere)


class POrbital(VGroup):
    """Two-lobe p-orbital (2D representation)."""
    def __init__(
        self,
        color_pos=CHEM_BLUE,
        color_neg=CHEM_RED,
        size: float = 0.6,
        orientation: str = "vertical",  # "vertical" | "horizontal"
        opacity=0.5,
        **kwargs,
    ):
        super().__init__(**kwargs)
        lobe1 = Ellipse(width=size, height=size * 1.8, color=color_pos,
                        fill_color=color_pos, fill_opacity=opacity)
        lobe2 = Ellipse(width=size, height=size * 1.8, color=color_neg,
                        fill_color=color_neg, fill_opacity=opacity)

        if orientation == "vertical":
            lobe1.shift(UP * size * 0.9)
            lobe2.shift(DOWN * size * 0.9)
        else:
            lobe1.rotate(PI / 2).shift(RIGHT * size * 0.9)
            lobe2.rotate(PI / 2).shift(LEFT * size * 0.9)

        plus = Text("+", font_size=20, color=color_pos).move_to(lobe1)
        minus = Text("−", font_size=20, color=color_neg).move_to(lobe2)
        self.add(lobe1, lobe2, plus, minus)


# ── Equation Box ──────────────────────────────────────────────────────────────

def labeled_equation(latex_str: str, color: str = WHITE) -> VGroup:
    """A boxed MathTex equation."""
    eq = MathTex(latex_str, color=color, font_size=40)
    box = SurroundingRectangle(eq, color=CHEM_BLUE, buff=0.2, corner_radius=0.1)
    return VGroup(box, eq)


# ── Number Line / Axis Helpers ────────────────────────────────────────────────

def simple_axes(
    x_range=(-3, 3, 1),
    y_range=(-2, 2, 1),
    x_label: str = "x",
    y_label: str = "y",
) -> Axes:
    axes = Axes(
        x_range=x_range,
        y_range=y_range,
        axis_config={"color": GREY, "stroke_width": 2},
        tips=True,
    )
    x_lbl = axes.get_x_axis_label(x_label)
    y_lbl = axes.get_y_axis_label(y_label)
    return VGroup(axes, x_lbl, y_lbl)


# ── Title Card ────────────────────────────────────────────────────────────────

def scene_title(title_text: str, subtitle_text: str = "") -> VGroup:
    """Animated title card for scene openings."""
    title = Text(title_text, font_size=42, color=CHEM_BLUE, weight=BOLD)
    if subtitle_text:
        sub = Text(subtitle_text, font_size=24, color=GREY_B)
        group = VGroup(title, sub).arrange(DOWN, buff=0.3)
    else:
        group = VGroup(title)
    return group


# ── Step-by-Step Mechanism Builder ───────────────────────────────────────────

class MechanismStep(VGroup):
    """
    A numbered step label for reaction mechanisms.
    Usage: step = MechanismStep(1, "Nucleophile attacks carbon")
    """
    def __init__(self, number: int, description: str, **kwargs):
        super().__init__(**kwargs)
        badge = Circle(radius=0.22, color=CHEM_ORANGE, fill_color=CHEM_ORANGE, fill_opacity=1.0)
        num = Text(str(number), font_size=20, color=BLACK, weight=BOLD).move_to(badge)
        desc = Text(description, font_size=20, color=WHITE)
        desc.next_to(badge, RIGHT, buff=0.2)
        self.add(badge, num, desc)
