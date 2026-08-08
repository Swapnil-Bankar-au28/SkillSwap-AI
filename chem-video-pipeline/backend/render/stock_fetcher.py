import os
import requests
import random
import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

def fetch_stock_video(query: str, duration: float, output_path: Path) -> Optional[Path]:
    """
    Fetches a stock video from Pexels based on the query.
    """
    api_key = os.environ.get("PEXELS_API_KEY")
    if not api_key:
        logger.warning("PEXELS_API_KEY is not set. Skipping stock video fetch.")
        return None

    try:
        # Simplify the query to first word or two to maximize Pexels hits
        clean_query = query.replace("'", "").replace('"', '').split()[0]
        logger.info(f"Pexels search keyword for '{query}': {clean_query}")

        url = f"https://api.pexels.com/videos/search?query={clean_query}&per_page=15&orientation=landscape"
        headers = {"Authorization": api_key}
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if not data.get("videos"):
            logger.warning(f"No Pexels videos found for keyword: {clean_query}")
            return None
            
        videos = data["videos"]
        valid_videos = [v for v in videos if v.get("duration", 0) >= duration - 5]
        selected = random.choice(valid_videos) if valid_videos else random.choice(videos)
        
        video_files = selected.get("video_files", [])
        best_file = None
        for file in video_files:
            if file.get("quality") == "hd" and file.get("height", 0) >= 720:
                best_file = file
                break
                
        if not best_file:
            best_file = video_files[0] if video_files else None
            
        if not best_file:
            logger.warning("No valid video files found in Pexels result.")
            return None
            
        download_url = best_file.get("link")
        logger.info(f"Downloading Pexels video: {download_url}")
        
        r = requests.get(download_url, stream=True, timeout=20)
        r.raise_for_status()
        
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)
                
        logger.info(f"Successfully downloaded stock video to {output_path}")
        return output_path
        
    except Exception as e:
        logger.error(f"Error fetching Pexels video: {str(e)}")
        return None
