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
from app.models.doctor import Doctor, ScanReview
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
    allow_origin_regex=r"https://.*\.vercel\.app|https://.*\.railway\.app|http://localhost:\d+",
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
                is_doctor=False,
                role="admin",
                is_verified=True
            )
            db.add(admin_user)
            logger.info("Admin user seeded (admin@dermalytics.com)")

        # Seed demo doctor user
        doctor_user = db.query(User).filter(User.email == "doctor@dermalytics.com").first()
        if not doctor_user:
            doctor_user = User(
                email="doctor@dermalytics.com",
                username="drfatima",
                password_hash=get_password_hash("Doctor@123"),
                first_name="Dr. Fatima",
                last_name="Tariq",
                phone_number="+92 321 8899001",
                gender="Female",
                is_active=True,
                is_admin=False,
                is_doctor=True,
                role="doctor",
                is_verified=True
            )
            db.add(doctor_user)
            db.flush()
            logger.info("Demo doctor user seeded (doctor@dermalytics.com)")

        # Seed Verified Doctors Directory (Karachi, Lahore, Islamabad)
        if db.query(Doctor).count() == 0:
            seed_doctors = [
                Doctor(
                    user_id=doctor_user.id if doctor_user else None,
                    full_name="Dr. Fatima Tariq",
                    title="Consultant Dermatologist & Aesthetic Specialist",
                    pmdc_number="PMDC-48921-S",
                    qualification="MBBS, FCPS (Dermatology), Dip. Derm (Glasgow)",
                    experience_years=12,
                    specialty="Dermatology & Skin Lesions",
                    hospital_name="South City Hospital & Skin Care Clinic",
                    city="Karachi",
                    area="Clifton Block 3",
                    address="Street 1, Block 3, Clifton, Karachi",
                    phone="+92 21 35862301",
                    whatsapp="+92 321 8899001",
                    email="doctor@dermalytics.com",
                    visiting_hours="Mon - Fri: 4:00 PM - 8:00 PM",
                    consultation_fee=2500,
                    rating=4.9,
                    latitude=24.8238,
                    longitude=67.0315,
                    is_available_online=True,
                    is_verified=True,
                    reviews_count=128
                ),
                Doctor(
                    full_name="Prof. Dr. Kamran Bilgrami",
                    title="Head of Dermatology & Skin Oncology",
                    pmdc_number="PMDC-31205-S",
                    qualification="MBBS, FCPS (Derm), FRCP (Edin)",
                    experience_years=22,
                    specialty="Skin Oncology & Complex Lesions",
                    hospital_name="Aga Khan University Hospital (AKUH)",
                    city="Karachi",
                    area="Stadium Road",
                    address="National Stadium Rd, Aga Khan Hospital Complex, Karachi",
                    phone="+92 21 111 911 911",
                    whatsapp="+92 300 9221100",
                    email="dr.bilgrami@akuh.edu.pk",
                    visiting_hours="Tue & Thu: 2:00 PM - 6:00 PM",
                    consultation_fee=3500,
                    rating=5.0,
                    latitude=24.8934,
                    longitude=67.0743,
                    is_available_online=True,
                    is_verified=True,
                    reviews_count=215
                ),
                Doctor(
                    full_name="Dr. Rabia Farooq",
                    title="Consultant Trichologist & Hair Restoration Specialist",
                    pmdc_number="PMDC-55410-S",
                    qualification="MBBS, Dip. Trichology (UK), ISHRS Fellow",
                    experience_years=9,
                    specialty="Trichology & Scalp Health",
                    hospital_name="Liaquat National Hospital & Trichology Wing",
                    city="Karachi",
                    area="Gulshan-e-Iqbal",
                    address="National Stadium Road, Liaquat Hospital, Karachi",
                    phone="+92 21 111 456 456",
                    whatsapp="+92 333 4455667",
                    email="rabia.farooq@lnh.edu.pk",
                    visiting_hours="Mon - Sat: 11:00 AM - 3:00 PM",
                    consultation_fee=2000,
                    rating=4.8,
                    latitude=24.8950,
                    longitude=67.0800,
                    is_available_online=True,
                    is_verified=True,
                    reviews_count=94
                ),
                Doctor(
                    full_name="Dr. Shehzad Akram",
                    title="Laser Surgeon & General Dermatologist",
                    pmdc_number="PMDC-41882-S",
                    qualification="MBBS, MCPS, Clinical Dermatology Fellow (Singapore)",
                    experience_years=14,
                    specialty="General Dermatology & Rash Assessment",
                    hospital_name="Patel Hospital Skin Clinic",
                    city="Karachi",
                    area="Gulshan-e-Iqbal Block 4",
                    address="ST-18, Block 4, Gulshan-e-Iqbal, Karachi",
                    phone="+92 21 111 174 174",
                    whatsapp="+92 345 8899221",
                    email="shehzad.akram@patel-hospital.org.pk",
                    visiting_hours="Daily: 5:00 PM - 9:00 PM",
                    consultation_fee=1800,
                    rating=4.7,
                    latitude=24.9312,
                    longitude=67.1120,
                    is_available_online=True,
                    is_verified=True,
                    reviews_count=76
                ),
                Doctor(
                    full_name="Dr. Sadia Zulfiqar",
                    title="Pediatric & General Dermatologist",
                    pmdc_number="PMDC-62911-S",
                    qualification="MBBS, FCPS (Derm)",
                    experience_years=11,
                    specialty="Dermatology & Skin Lesions",
                    hospital_name="Medicare Heart & Skin Institute",
                    city="Karachi",
                    area="PECHS Block 3",
                    address="Shaheed-e-Millat Road, PECHS, Karachi",
                    phone="+92 21 34551001",
                    whatsapp="+92 301 2233445",
                    email="sadia.zulfiqar@medicare.pk",
                    visiting_hours="Mon - Thu: 3:00 PM - 7:00 PM",
                    consultation_fee=2200,
                    rating=4.9,
                    latitude=24.8722,
                    longitude=67.0650,
                    is_available_online=True,
                    is_verified=True,
                    reviews_count=112
                ),
                Doctor(
                    full_name="Dr. Asadullah Niazi",
                    title="Consultant Dermatologist",
                    pmdc_number="PMDC-38440-S",
                    qualification="MBBS, FCPS (Dermatology)",
                    experience_years=16,
                    specialty="Dermatology & Skin Lesions",
                    hospital_name="North Nazimabad Skin & Laser Centre",
                    city="Karachi",
                    area="North Nazimabad Block H",
                    address="Hyderi Market, Block H, North Nazimabad, Karachi",
                    phone="+92 21 36645520",
                    whatsapp="+92 312 9988771",
                    email="dr.asadullah@nazimabadskin.pk",
                    visiting_hours="Mon - Fri: 6:00 PM - 10:00 PM",
                    consultation_fee=1500,
                    rating=4.6,
                    latitude=24.9421,
                    longitude=67.0350,
                    is_available_online=True,
                    is_verified=True,
                    reviews_count=88
                ),
                Doctor(
                    full_name="Dr. Zainab Hashmi",
                    title="Consultant Dermatologist & Trichology Specialist",
                    pmdc_number="PMDC-51209-P",
                    qualification="MBBS, FCPS (Dermatology), Board Certified Trichologist",
                    experience_years=13,
                    specialty="Trichology & Scalp Health",
                    hospital_name="Hameed Latif Hospital",
                    city="Lahore",
                    area="Garden Town",
                    address="14 New Garden Town, Lahore",
                    phone="+92 42 111 000 042",
                    whatsapp="+92 322 5566778",
                    email="zainab.hashmi@hlh.com.pk",
                    visiting_hours="Mon - Fri: 3:00 PM - 7:00 PM",
                    consultation_fee=2500,
                    rating=4.9,
                    latitude=31.5050,
                    longitude=74.3280,
                    is_available_online=True,
                    is_verified=True,
                    reviews_count=140
                ),
                Doctor(
                    full_name="Dr. Tariq Mahmood",
                    title="Senior Consultant Dermatologist",
                    pmdc_number="PMDC-29841-F",
                    qualification="MBBS, MRCP (UK), FRCP (Dermatology)",
                    experience_years=25,
                    specialty="Dermatology & Skin Lesions",
                    hospital_name="Shifa International Hospital",
                    city="Islamabad",
                    area="Sector H-8/4",
                    address="Pitras Bukhari Road, H-8/4, Islamabad",
                    phone="+92 51 8463000",
                    whatsapp="+92 300 5544332",
                    email="tariq.mahmood@shifa.com.pk",
                    visiting_hours="Mon - Thu: 10:00 AM - 2:00 PM",
                    consultation_fee=3000,
                    rating=4.9,
                    latitude=33.6780,
                    longitude=73.0760,
                    is_available_online=True,
                    is_verified=True,
                    reviews_count=190
                )
            ]
            db.add_all(seed_doctors)
            logger.info("Seeded 8 verified Pakistani dermatologists/trichologists across Karachi, Lahore & Islamabad")

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
