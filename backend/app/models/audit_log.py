import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, JSON, Text
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=True, index=True)
    action = Column(String(50), nullable=False)
    resource_type = Column(String(50), nullable=True)
    resource_id = Column(String(36), nullable=True)
    details = Column(JSON, default=dict)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(Text, nullable=True)
    status_code = Column(Integer, default=200)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
