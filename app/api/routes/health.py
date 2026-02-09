from fastapi import APIRouter
import platform
import psutil
import os

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    return {"status": "ok"}

@router.get("/status")
def system_status():
    process = psutil.Process(os.getpid())
    return {
        "status": "online",
        "system": platform.system(),
        "memory_usage_mb": round(process.memory_info().rss / 1024 / 1024, 2),
        "cpu_percent": psutil.cpu_percent()
    }
