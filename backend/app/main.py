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

# CORS Middleware (Using settings.CORS_ORIGINS instead of '*' with credentials)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
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
    # Do not seed demo/test accounts in production
    if settings.ENVIRONMENT.lower() == "production":
        logger.info("ENVIRONMENT=production: Account auto-seeding is disabled.")
        return

    db = SessionLocal()
    try:
        # Seed demo user (is_admin=False)
        demo_user = db.query(User).filter(User.email == "demo@dermalytics.com").first()
        if not demo_user:
            demo_user = User(
                email="demo@dermalytics.com",
                username="demouser",
                password_hash=get_password_hash(settings.DEMO_USER_PASSWORD),
                first_name="Demo",
                last_name="Patient",
                phone_number="+92 300 1234567",
                gender="Female",
                is_active=True,
                is_admin=False,  # Regular patient account, not admin
                is_verified=True
            )
            db.add(demo_user)
            logger.info("Demo patient user seeded with is_admin=False (demo@dermalytics.com)")
        else:
            # If demo user was previously seeded as admin, downgrade to regular patient
            if demo_user.is_admin:
                demo_user.is_admin = False
                db.add(demo_user)
                logger.info("Updated existing demo user: is_admin set to False")

        # Seed admin user (password from settings/.env)
        admin_user = db.query(User).filter(User.email == "admin@dermalytics.com").first()
        if not admin_user:
            admin_user = User(
                email="admin@dermalytics.com",
                username="admin",
                password_hash=get_password_hash(settings.ADMIN_USER_PASSWORD),
                first_name="Dr. Khurram",
                last_name="Iqbal",
                is_active=True,
                is_admin=True,
                is_verified=True
            )
            db.add(admin_user)
            logger.info("Admin user seeded (admin@dermalytics.com)")

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
