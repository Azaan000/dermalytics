import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.core.exceptions import AppException, global_exception_handler
from app.core.logging import setup_logging, logger
from app.core.security import get_password_hash
from app.models.user import User
from app.models.system_settings import SystemSetting
from app.api.v1 import api_router

# Initialize Logging
setup_logging()

# Create Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Driven Skin and Hair Health Assessment Platform - Final Year Project (Hamdard University)",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Exception Handlers
app.add_exception_handler(AppException, global_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static Files for Uploaded and Grad-CAM Images
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def startup_populate_db():
    db = SessionLocal()
    try:
        # Seed demo user
        demo_user = db.query(User).filter(User.email == "demo@dermalytics.com").first()
        if not demo_user:
            demo_user = User(
                email="demo@dermalytics.com",
                username="demouser",
                password_hash=get_password_hash("DemoPass123!"),
                first_name="Demo",
                last_name="Patient",
                phone_number="+92 300 1234567",
                gender="Female",
                is_active=True,
                is_admin=True,
                is_verified=True
            )
            db.add(demo_user)
            logger.info("Demo patient user seeded (demo@dermalytics.com / DemoPass123!)")

        # Seed admin user
        admin_user = db.query(User).filter(User.email == "admin@dermalytics.com").first()
        if not admin_user:
            admin_user = User(
                email="admin@dermalytics.com",
                username="admin",
                password_hash=get_password_hash("AdminPass123!"),
                first_name="Dr. Khurram",
                last_name="Iqbal",
                is_active=True,
                is_admin=True,
                is_verified=True
            )
            db.add(admin_user)
            logger.info("Admin user seeded (admin@dermalytics.com / AdminPass123!)")

        db.commit()
    except Exception as e:
        logger.error(f"Startup DB init error: {e}")
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/admin/health"
    }
