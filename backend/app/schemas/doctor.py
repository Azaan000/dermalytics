from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class DoctorBase(BaseModel):
    full_name: str
    title: str
    pmdc_number: str
    qualification: str
    experience_years: int
    specialty: str
    hospital_name: str
    city: str
    area: str
    address: str
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    visiting_hours: Optional[str] = None
    consultation_fee: int = 2000
    rating: float = 4.9
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_available_online: bool = True
    is_verified: bool = True
    reviews_count: int = 0

class DoctorOut(DoctorBase):
    id: str
    distance_km: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True

class RequestReviewCreate(BaseModel):
    assessment_id: str
    doctor_id: Optional[str] = None
    patient_notes: Optional[str] = None

class SubmitReviewUpdate(BaseModel):
    doctor_agreement: str = Field(..., description="agree | partial | disagree")
    clinical_impression: str = Field(..., description="Confirmed assessment / clinical impression")
    urgency_tier: str = Field("routine", description="routine | semi_urgent | immediate")
    doctor_notes: Optional[str] = Field(None, description="Doctor's clinical findings and advice")
    recommended_action: Optional[str] = None
    prescription_advice: Optional[str] = None

class ScanReviewOut(BaseModel):
    id: str
    assessment_id: str
    patient_id: str
    doctor_id: Optional[str] = None
    patient_notes: Optional[str] = None
    status: str
    doctor_agreement: Optional[str] = None
    clinical_impression: Optional[str] = None
    urgency_tier: Optional[str] = None
    doctor_notes: Optional[str] = None
    recommended_action: Optional[str] = None
    prescription_advice: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime
    
    # Nested info
    doctor: Optional[DoctorOut] = None
    patient_name: Optional[str] = None
    assessment_type: Optional[str] = None
    image_url: Optional[str] = None
    grad_cam_url: Optional[str] = None
    ai_predicted_class: Optional[str] = None
    ai_confidence: Optional[float] = None

    class Config:
        from_attributes = True
