import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    assessment_id = Column(String(36), nullable=True)
    rating = Column(Integer, nullable=False) # 1 to 5
    comment = Column(Text, nullable=True)
    category = Column(String(50), default="general")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="feedback")

class TrainingDataLog(Base):
    __tablename__ = "training_data"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    image_url = Column(String(500), nullable=False)
    label = Column(String(100), nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    validated_by = Column(String(36), nullable=True)
