import os
from typing import List, Union, Optional
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "Dermalytics"
    VERSION: str = "2.1.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Security
    SECRET_KEY: str = "d88f9c909f6e46d31a7acff0faf0e7b69664532d6f678b859ea484810c5282a1"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Seed Accounts (Read from .env; accounts are NOT seeded when ENVIRONMENT=production)
    DEMO_USER_PASSWORD: str = "DemoPass123!"
    ADMIN_USER_PASSWORD: str = "AdminPass123!"

    # Database: Use /tmp/dermalytics.db on Vercel serverless for write permissions
    DATABASE_URL: str = (
        "sqlite:////tmp/dermalytics.db"
        if os.environ.get("VERCEL")
        else "sqlite:///./dermalytics.db"
    )
    
    # Uploads & Storage: Use /tmp/uploads on Vercel
    UPLOAD_DIR: str = (
        "/tmp/uploads"
        if os.environ.get("VERCEL")
        else os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
    )
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10 MB
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/webp", "image/jpg"]

    # OpenRouter AI Chat Assistant (Configured on server only)
    OPENROUTER_API_KEY: Optional[str] = None
    OPENROUTER_MODEL: str = "openrouter/free"
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    KNOWLEDGE_BASE_PATH: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "knowledge.txt")

    # CORS
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "https://dermalytics.com"
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    def parse_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    # AI Model Engine
    MODEL_CONFIDENCE_THRESHOLD: float = 80.0
    RISK_ALERT_THRESHOLD: float = 75.0
    ENABLE_GRADCAM: bool = True

    class Config:
        case_sensitive = True
        env_file = (
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
            ".env"
        )

settings = Settings()

# Ensure uploads directories exist
os.makedirs(os.path.join(settings.UPLOAD_DIR, "assessments"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "thumbnails"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "gradcam"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "profiles"), exist_ok=True)
