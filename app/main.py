# app/main.py
# --- SRE PASSLIB/BCRYPT FIX ---
import bcrypt
try:
    if not hasattr(bcrypt, "__about__"):
        bcrypt.__about__ = type('about', (object,), {'__version__': '4.0.1'})
except Exception:
    pass
# -----------------------------

from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect, Response
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from datetime import datetime
from app.config import settings
from app.logger import logger
from app.api.routes import (
    health, upload, pipeline, auth, history, download, sales, project, billing, chat,
    explain, inference, status
)
from app.core.db.mongodb import connect_to_mongo, close_mongo_connection
from app.core.sockets import socket_manager

app = FastAPI(
    title="AnalytixAI API",
    description="Production-Ready AI Data Intelligence Platform",
    version="2.1.0"
)

# Failsafe CORS Bridging Middleware
@app.middleware("http")
async def cors_handler(request: Request, call_next):
    # 1. Handle Preflight (OPTIONS)
    if request.method == "OPTIONS":
        response = Response(status_code=204)
    else:
        response = await call_next(request)
        
    # 2. Inject Headers for ALL Responses
    origin = request.headers.get("origin")
    if origin and ("vercel.app" in origin or "localhost" in origin):
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, X-Vercel-Id, Accept, Origin"
        
    return response

# Standard Ping for Diagnostic
@app.get("/ping")
async def ping():
    return {"status": "online", "message": "AnalytixAI Backend is reachable!"}

@app.on_event("startup")
async def startup_event():
    logger.info("Initializing AnalytixAI Backend Engine...")
    await connect_to_mongo()
    
    # Create Default Admin
    try:
        from app.core.db.mongodb import get_database
        from app.core.auth.security import get_password_hash
        db = get_database()
        admin_email = "admin@analytix.ai"
        exists = await db.users.find_one({"email": admin_email})
        if not exists:
            await db.users.insert_one({
                "email": admin_email,
                "hashed_password": get_password_hash("admin"),
                "full_name": "System Admin",
                "tier": "enterprise",
                "is_active": True,
                "created_at": datetime.utcnow()
            })
            logger.info("Universal Admin Created: admin@analytix.ai / admin")
    except Exception as e:
        logger.error(f"Startup: Admin creation failed: {e}")

    logger.info("MongoDB Connection Established.")
    asyncio.create_task(background_maintenance())

async def background_maintenance():
    import os
    import time
    import gc
    import shutil
    from app.utils.data_manager import data_manager
    MAINTENANCE_INTERVAL = 21600 # 6 hours
    MAX_FILE_AGE = 86400 # 24 hours
    while True:
        try:
            await asyncio.sleep(MAINTENANCE_INTERVAL)
            logger.info("Starting System Maintenance Sweep...")
            def _perform_cleanup():
                dirs_to_clean = [settings.REPORT_DIR, settings.DATASET_DIR, settings.MODEL_DIR]
                now = time.time()
                for directory in dirs_to_clean:
                    if not os.path.exists(directory): continue
                    with os.scandir(directory) as entries:
                        for entry in entries:
                            if entry.name.startswith('.'): continue
                            if entry.stat().st_mtime < now - MAX_FILE_AGE:
                                if entry.is_file(): os.remove(entry.path)
                                elif entry.is_dir(): shutil.rmtree(entry.path)
                from app.core.orchestrator import orchestrator
                orchestrator.cleanup_old_jobs(max_age_hours=12)
                data_manager.clear_cache()
                gc.collect()
            await asyncio.to_thread(_perform_cleanup)
            logger.info("Maintenance Sweep Completed Successfully.")
        except Exception as e:
            logger.error(f"Maintenance Sweep Failed: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global Exception: {str(exc)}", exc_info=True)
    response = JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error", "detail": str(exc)},
    )
    response.headers["Access-Control-Allow-Origin"] = request.headers.get("origin", "*")
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

@app.get("/")
async def root():
    return {
        "message": "Welcome to AnalytixAI API",
        "status": "online",
        "version": "2.1.0",
        "mode": "Distributed MongoDB + WebSockets"
    }

@app.websocket("/ws/{job_id}")
async def websocket_endpoint(websocket: WebSocket, job_id: str):
    await socket_manager.connect(websocket, job_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        socket_manager.disconnect(websocket, job_id)
    except Exception as e:
        logger.error(f"WebSocket Error: {e}")
        socket_manager.disconnect(websocket, job_id)

app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(pipeline.router)
app.include_router(history.router)
app.include_router(download.router)
app.include_router(health.router)
app.include_router(sales.router)
app.include_router(project.router)
app.include_router(billing.router)
app.include_router(chat.router)
app.include_router(explain.router)
app.include_router(inference.router)
app.include_router(status.router)
