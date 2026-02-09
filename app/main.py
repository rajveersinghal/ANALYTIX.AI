# app/main.py
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from app.config import settings
from app.logger import logger
from app.api.routes import health, upload, task, dataset, clean, eda, stats, model, explain, decision, report, pipeline, status, explanations, inference

app = FastAPI(
    title=settings.APP_NAME,
)

@app.on_event("startup")
async def startup_event():
    logger.info(" AnalytixAI Backend Started Successfully")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global Exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error", "detail": str(exc)},
    )

@app.get("/")
async def root():
    return {
        "message": "Welcome to AnalytixAI API",
        "status": "running",
        "documentation": "/docs",
        "health_check": "/health"
    }

app.include_router(health.router)
app.include_router(upload.router)
app.include_router(task.router)
app.include_router(dataset.router)
app.include_router(clean.router)
app.include_router(eda.router)
app.include_router(stats.router)
app.include_router(model.router)
app.include_router(explain.router)
app.include_router(decision.router)
app.include_router(report.router)
app.include_router(pipeline.router)
app.include_router(status.router)
app.include_router(explanations.router)
app.include_router(inference.router)
