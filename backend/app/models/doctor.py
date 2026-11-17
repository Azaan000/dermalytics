import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, unique=True)
    full_name = Column(String(100), nullable=False, index=True)
    title = Column(String(100), nullable=False)                         # e.g., "Consultant Dermatologist & Cosmetologist"
    pmdc_number = Column(String(50), unique=True, nullable=False)       # Medical registration (PMDC / PMC)
    qualification = Column(String(150), nullable=False)                 # e.g., "MBBS, FCPS (Dermatology), MCPS"
    experience_years = Column(Integer, default=10)
    specialty = Column(String(100), nullable=False, index=True)         # Dermatology, Trichology, Skin Oncology
    hospital_name = Column(String(150), nullable=False, index=True)
    city = Column(String(50), nullable=False, default="Karachi", index=True)
    area = Column(String(100), nullable=False, index=True)              # e.g., Clifton, Gulshan-e-Iqbal, DHA
    address = Column(Text, nullable=False)
    phone = Column(String(30), nullable=True)
    whatsapp = Column(String(30), nullable=True)
    email = Column(String(100), nullable=True)
    visiting_hours = Column(String(100), nullable=True)                 # e.g., "Mon-Fri: 4:00 PM - 8:00 PM"
    consultation_fee = Column(Integer, default=2000)                    # In PKR
    rating = Column(Float, default=4.9)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    is_available_online = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=True)
    reviews_count = Column(Integer, default=45)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="doctor_profile")
    reviews = relationship("ScanReview", back_populates="doctor")


class ScanReview(Base):
    __tablename__ = "scan_reviews"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    patient_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_id = Column(String(36), ForeignKey("doctors.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Patient submission
    patient_notes = Column(Text, nullable=True)                         # Patient's reported symptoms or duration
    status = Column(String(20), default="pending", index=True)          # 'pending', 'reviewed', 'completed'
    
    # Doctor's clinical review
    doctor_agreement = Column(String(30), nullable=True)                # 'agree', 'partial', 'disagree'
    clinical_impression = Column(String(150), nullable=True)            # Doctor's diagnosis
    urgency_tier = Column(String(30), default="routine")                # 'routine', 'semi_urgent', 'immediate'
    doctor_notes = Column(Text, nullable=True)                          # Detailed clinical analysis & notes
    recommended_action = Column(Text, nullable=True)                    # Recommended clinical plan
    prescription_advice = Column(Text, nullable=True)                   # Topical care / medications
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    assessment = relationship("Assessment", backref="clinical_reviews")
    patient = relationship("User", foreign_keys=[patient_id])
    doctor = relationship("Doctor", back_populates="reviews")
