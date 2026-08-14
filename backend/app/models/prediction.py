import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    model_version = Column(String(50), default="v2.1.0")
    model_name = Column(String(50), nullable=False) # 'EfficientNetB3' or 'MobileNetV3'
    prediction_type = Column(String(20), nullable=False) # 'skin_class' or 'hair_density'
    result = Column(JSON, nullable=False)
    confidence = Column(Float, nullable=True)
    top_classes = Column(JSON, nullable=True)
    risk_level = Column(String(20), default="low") # 'low', 'medium', 'high'
    grad_cam_image_url = Column(String(500), nullable=True)
    processing_time_ms = Column(Integer, default=1200)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    metadata_json = Column(JSON, default=dict)

    # Relationships
    assessment = relationship("Assessment", back_populates="prediction")
