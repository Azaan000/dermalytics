import os
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "Dermalytics"
    VERSION: str = "2.1.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Security
    SECRET_KEY: str = "dermalytics-super-secure-secret-key-2026-production-ready"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    DATABASE_URL: str = "sqlite:///./dermalytics.db"
    
    # Uploads & Storage
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10 MB
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/webp", "image/jpg"]

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "https://dermalytics.com"
    ]

    # AI Model Engine
    MODEL_CONFIDENCE_THRESHOLD: float = 80.0
    RISK_ALERT_THRESHOLD: float = 75.0
    ENABLE_GRADCAM: bool = True

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

# Ensure uploads directories exist
os.makedirs(os.path.join(settings.UPLOAD_DIR, "assessments"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "thumbnails"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "gradcam"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "profiles"), exist_ok=True)
