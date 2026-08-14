import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500), nullable=True)
    assessment_type = Column(String(20), nullable=False, index=True)  # 'skin' or 'hair'
    status = Column(String(20), default="completed", index=True)      # 'pending', 'processing', 'completed', 'failed'
    image_quality_score = Column(Float, default=0.95)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, default=datetime.utcnow)
    processing_time_ms = Column(Integer, default=1500)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(Text, nullable=True)
    device_type = Column(String(50), default="Desktop")
    is_deleted = Column(Boolean, default=False, index=True)

    # Relationships
    user = relationship("User", back_populates="assessments")
    prediction = relationship("Prediction", uselist=False, back_populates="assessment", cascade="all, delete-orphan")
