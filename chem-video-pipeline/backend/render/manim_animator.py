import os
import sys
import tempfile
import subprocess
import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

# Prompt for generating Manim python code
MANIM_PROMPT_TEMPLATE = """You are an expert Manim animator (Math Animation Engine).
Write a fully working Python script using Manim (v0.18+) to animate the following topic: {topic}
The scene class MUST be named `GeneratedScene`.
The animation should visually explain the concept step-by-step.
Make it visually stunning, use colors, shapes, and formulas.
Ensure the animation duration roughly matches the narration duration of {duration} seconds.
Use self.wait() to space out animations.

Narration script to sync visuals with:
"{script}"

Output ONLY valid Python code inside a ```python block. No explanations.
"""

def is_manim_available() -> bool:
    """Check if Manim is installed locally."""
    try:
        import manim
        return True
    except ImportError:
        return False

def generate_manim_code(topic: str, script: str, duration: float, llm_client) -> str:
    """Uses LLM to generate Manim script for the given topic."""
    prompt = MANIM_PROMPT_TEMPLATE.format(topic=topic, script=script, duration=duration)
    # Using the llm_client to generate code
    code_text = llm_client.generate_text(prompt, model="gemini-3.1-flash")
    
    # Extract python code from markdown block
    if "```python" in code_text:
        code = code_text.split("```python")[1].split("```")[0].strip()
    elif "```" in code_text:
        code = code_text.split("```")[1].strip()
    else:
        code = code_text.strip()
    return code

def render_manim_video(
    topic: str,
    script: str,
    duration: float,
    output_path: Path,
    llm_client
) -> Optional[Path]:
    """
    Generates and renders a Manim video locally.
    Returns the path to the generated MP4 if successful, or None if failed.
    """
    if not is_manim_available():
        logger.warning("Manim is not installed. Skipping Manim generation.")
        return None

    try:
        # 1. Generate Manim Code
        logger.info(f"Generating Manim code for: {topic}")
        manim_code = generate_manim_code(topic, script, duration, llm_client)
        
        # 2. Write to a temporary file
        temp_dir = Path(tempfile.mkdtemp(prefix="manim_build_"))
        script_path = temp_dir / "scene.py"
        script_path.write_text(manim_code, encoding="utf-8")
        
        # 3. Run Manim CLI
        # Output to the same temp directory
        out_vid_dir = temp_dir / "media" / "videos" / "scene" / "480p15"
        
        logger.info("Executing Manim CLI...")
        cmd = [
            sys.executable, "-m", "manim",
            "render",
            "-ql",  # low quality for faster rendering (480p15)
            "--media_dir", str(temp_dir / "media"),
            str(script_path),
            "GeneratedScene"
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            logger.error(f"Manim rendering failed:\n{result.stderr}")
            return None
            
        # 4. Find generated video file
        generated_mp4 = out_vid_dir / "GeneratedScene.mp4"
        if generated_mp4.exists():
            import shutil
            output_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy(generated_mp4, output_path)
            logger.info(f"Successfully rendered Manim video: {output_path}")
            return output_path
        else:
            logger.error("Manim finished but no MP4 was found.")
            return None

    except Exception as e:
        logger.error(f"Error during Manim generation: {str(e)}")
        return None
