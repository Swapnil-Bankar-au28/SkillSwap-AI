"""
FastAPI Application
────────────────────
Serves:
  POST /api/generate  — start a pipeline run
  GET  /api/status/{run_id}  — poll run status
  WS   /ws/{run_id}  — real-time progress via WebSocket
  GET  /api/video/{run_id}  — download final video
  GET  /api/viewer3d/{run_id}/{scene_id}  — 3D viewer config JSON
  GET  /outputs/{path}  — serve static output files
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
from pathlib import Path
from typing import Dict, Optional

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from backend.config import get_config
from backend.pipeline import Pipeline, PipelineResult

logger = logging.getLogger(__name__)
config = get_config()

app = FastAPI(
    title="EduVis AI",
    description="Multi-agent animated educational video generator",
    version="1.0.0",
)

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

# ── Custom CORS Middleware (bypasses Starlette CORSMiddleware bugs) ────────────
class CORSHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Handle preflight OPTIONS immediately — never forward to route handlers
        if request.method == "OPTIONS":
            response = Response(status_code=200)
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
            response.headers["Access-Control-Allow-Headers"] = "*"
            response.headers["Access-Control-Max-Age"] = "86400"
            return response

        # For all other requests, call route and add CORS headers to response
        response = await call_next(request)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "*"
        return response

app.add_middleware(CORSHandlerMiddleware)

# Serve output files statically
outputs_dir = config.output_dir
outputs_dir.mkdir(parents=True, exist_ok=True)
app.mount("/outputs", StaticFiles(directory=outputs_dir), name="outputs")


# ── In-memory run store ────────────────────────────────────────────────────────

class RunState:
    def __init__(self, topic: str):
        self.topic = topic
        self.status: str = "pending"      # pending | running | done | error
        self.current_stage: str = ""
        self.stage_message: str = ""
        self.progress: float = 0.0
        self.result: Optional[PipelineResult] = None
        self.error: Optional[str] = None
        self.ws_clients: list[WebSocket] = []

    async def broadcast(self, data: dict):
        dead = []
        for ws in self.ws_clients:
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.ws_clients.remove(ws)


_runs: Dict[str, RunState] = {}


# ── Request/Response models ────────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    topic: str
    verifier_enabled: bool = True


class GenerateResponse(BaseModel):
    run_id: str
    message: str


class StatusResponse(BaseModel):
    run_id: str
    topic: str
    status: str
    current_stage: str
    stage_message: str
    progress: float
    video_url: Optional[str] = None
    viewer_3d_configs: Optional[dict] = None
    error: Optional[str] = None
    result_summary: Optional[dict] = None


# ── API Endpoints ──────────────────────────────────────────────────────────────

@app.post("/api/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest, background_tasks: BackgroundTasks):
    """Start a pipeline run for the given topic."""
    if not config.google_api_key:
        raise HTTPException(
            status_code=503,
            detail="GOOGLE_API_KEY not configured. Set it in .env"
        )

    pipeline = Pipeline(config, verifier_enabled=req.verifier_enabled)
    run_state = RunState(req.topic)
    run_id = None  # Will be set after pipeline.run()
    main_loop = asyncio.get_running_loop()

    async def run_in_background():
        nonlocal run_id
        run_state.status = "running"

        def progress_cb(stage: str, msg: str, pct: float):
            run_state.current_stage = stage
            run_state.stage_message = msg
            run_state.progress = pct
            # Schedule broadcast back on the main asyncio event loop from worker thread
            asyncio.run_coroutine_threadsafe(
                run_state.broadcast({
                    "type": "progress",
                    "stage": stage,
                    "message": msg,
                    "progress": pct,
                }),
                main_loop,
            )

        def _worker():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                return pipeline.run(req.topic, progress_cb=progress_cb)
            finally:
                try:
                    loop.close()
                except Exception:
                    pass

        try:
            result = await main_loop.run_in_executor(None, _worker)
            run_state.result = result
            run_state.status = "done" if result.success else "error"
            run_state.error = result.error
            run_state.progress = 1.0

            await run_state.broadcast({
                "type": "complete",
                "success": result.success,
                "video_url": f"/outputs/{result.run_id}/{_video_filename(result)}",
                "error": result.error,
            })
        except Exception as e:
            logger.exception(f"Background run failed: {e}")
            run_state.status = "error"
            run_state.error = str(e)
            await run_state.broadcast({"type": "error", "error": str(e)})

    # We need a placeholder run_id before the run starts
    import uuid
    placeholder_id = str(uuid.uuid4())[:8]
    _runs[placeholder_id] = run_state
    background_tasks.add_task(run_in_background)

    return GenerateResponse(run_id=placeholder_id, message="Pipeline started")


@app.get("/api/status/{run_id}", response_model=StatusResponse)
async def get_status(run_id: str):
    """Poll pipeline run status."""
    state = _runs.get(run_id)
    if not state:
        raise HTTPException(status_code=404, detail=f"Run {run_id!r} not found")

    video_url = None
    viewer_3d_configs = None
    result_summary = None

    if state.result:
        r = state.result
        if r.final_video_path and r.final_video_path.exists():
            video_url = f"/outputs/{r.run_id}/{r.final_video_path.name}"

        # Collect 3D viewer configs from scenes
        viewer_3d_configs = {}
        for sr in r.scene_results:
            if sr.viewer_3d_config:
                viewer_3d_configs[sr.scene_id] = sr.viewer_3d_config

        result_summary = {
            "subject": r.subject,
            "level": r.level,
            "total_scenes": len(r.scene_results),
            "total_duration_seconds": r.total_duration_seconds,
            "total_revision_rounds": r.total_revision_rounds,
        }

    return StatusResponse(
        run_id=run_id,
        topic=state.topic,
        status=state.status,
        current_stage=state.current_stage,
        stage_message=state.stage_message,
        progress=state.progress,
        video_url=video_url,
        viewer_3d_configs=viewer_3d_configs or None,
        error=state.error,
        result_summary=result_summary,
    )


@app.websocket("/ws/{run_id}")
async def websocket_endpoint(websocket: WebSocket, run_id: str):
    """WebSocket for real-time pipeline progress."""
    await websocket.accept()
    state = _runs.get(run_id)

    if not state:
        await websocket.send_json({"type": "error", "error": f"Run {run_id!r} not found"})
        await websocket.close()
        return

    state.ws_clients.append(websocket)

    # Send current state immediately
    await websocket.send_json({
        "type": "status",
        "status": state.status,
        "stage": state.current_stage,
        "message": state.stage_message,
        "progress": state.progress,
    })

    try:
        while True:
            await asyncio.sleep(30)  # Keep alive
    except WebSocketDisconnect:
        if websocket in state.ws_clients:
            state.ws_clients.remove(websocket)


@app.get("/api/viewer3d/{run_id}/{scene_id}")
async def get_viewer_config(run_id: str, scene_id: str):
    """Get 3D viewer JSON config for a specific scene."""
    config_path = outputs_dir / run_id / scene_id / "viewer_3d_config.json"
    if not config_path.exists():
        raise HTTPException(status_code=404, detail="3D config not found")
    return JSONResponse(content=json.loads(config_path.read_text()))


@app.get("/api/video/{run_id}")
async def download_video(run_id: str):
    """Download the final assembled video."""
    run_dir = outputs_dir / run_id
    videos = list(run_dir.glob("*_final.mp4"))
    if not videos:
        raise HTTPException(status_code=404, detail="Video not ready")
    return FileResponse(str(videos[0]), media_type="video/mp4", filename=videos[0].name)


@app.get("/health")
async def health():
    return {"status": "ok", "api_key_set": bool(config.google_api_key)}


def _video_filename(result: PipelineResult) -> str:
    if result.final_video_path:
        return result.final_video_path.name
    return ""


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    uvicorn.run(
        "backend.main:app",
        host=config.server.host,
        port=config.server.port,
        reload=True,
    )
