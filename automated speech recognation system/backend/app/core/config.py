import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent
STORAGE_DIR = BASE_DIR / "storage"
AUDIO_DIR = STORAGE_DIR / "audio"
MODELS_DIR = BASE_DIR / "ml" / "models"
CHECKPOINTS_DIR = BASE_DIR.parent / "experiments" / "checkpoints"
DATASETS_DIR = BASE_DIR.parent / "datasets"
REPORTS_DIR = BASE_DIR.parent / "reports"

for directory in [STORAGE_DIR, AUDIO_DIR, MODELS_DIR, CHECKPOINTS_DIR, DATASETS_DIR, REPORTS_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

class Settings(BaseModel):
    PROJECT_NAME: str = "SpeechSense AI"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "speechsense-super-secret-key-production-ready-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "speechsense_db")
    USE_EMBEDDED_FALLBACK: bool = True
    
    # Machine Learning
    DEFAULT_WHISPER_MODEL: str = "openai/whisper-tiny"
    OFFLINE_ONLY: bool = True
    DEVICE: str = "cpu"
    SAMPLE_RATE: int = 16000
    
    # Audio Upload Limits
    MAX_UPLOAD_SIZE_MB: int = 50
    ALLOWED_EXTENSIONS: list[str] = [".wav", ".mp3", ".m4a", ".flac", ".ogg", ".webm"]
    
    # Storage Paths
    BASE_DIR: Path = BASE_DIR
    STORAGE_DIR: Path = STORAGE_DIR
    AUDIO_DIR: Path = AUDIO_DIR
    MODELS_DIR: Path = MODELS_DIR
    CHECKPOINTS_DIR: Path = CHECKPOINTS_DIR
    DATASETS_DIR: Path = DATASETS_DIR
    REPORTS_DIR: Path = REPORTS_DIR

settings = Settings()
