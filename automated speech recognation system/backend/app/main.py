import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from backend.app.core.config import settings
from backend.app.api import (
    auth,
    transcribe,
    audio,
    history,
    datasets,
    research,
    training,
    evaluation,
    reports,
    system,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("speechsense")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent Automatic Speech Recognition and Speech Analysis Platform using Deep Learning",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount audio directory for streaming playback
app.mount("/static/audio", StaticFiles(directory=str(settings.AUDIO_DIR)), name="audio_static")

# Register API Routers
api_prefix = settings.API_V1_PREFIX
app.include_router(auth.router, prefix=api_prefix)
app.include_router(transcribe.router, prefix=api_prefix)
app.include_router(audio.router, prefix=api_prefix)
app.include_router(history.router, prefix=api_prefix)
app.include_router(datasets.router, prefix=api_prefix)
app.include_router(research.router, prefix=api_prefix)
app.include_router(training.router, prefix=api_prefix)
app.include_router(evaluation.router, prefix=api_prefix)
app.include_router(reports.router, prefix=api_prefix)
app.include_router(system.router, prefix=api_prefix)

@app.get("/")
async def root():
    return {
        "platform": settings.PROJECT_NAME,
        "tagline": "Transforming Human Speech into Intelligent, Accessible and Analyzable Text.",
        "version": settings.VERSION,
        "api_docs": "/docs",
        "status": "operational"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "version": settings.VERSION
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "InternalServerError", "detail": str(exc)}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
