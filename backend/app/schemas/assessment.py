from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel
from app.schemas.prediction import PredictionOut

class AssessmentCreate(BaseModel):
    assessment_type: str # 'skin' or 'hair'
    crop_region: Optional[str] = "auto"
    return_gradcam: Optional[bool] = True

class AssessmentOut(BaseModel):
    id: str
    user_id: str
    image_url: str
    thumbnail_url: Optional[str] = None
    assessment_type: str
    status: str
    image_quality_score: Optional[float] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    processing_time_ms: int
    prediction: Optional[PredictionOut] = None

    class Config:
        from_attributes = True

class AssessmentHistoryItem(BaseModel):
    id: str
    type: str
    thumbnail: Optional[str] = None
    image_url: str
    prediction: Dict[str, Any]
    created_at: datetime
    status: str

class AssessmentHistoryResponse(BaseModel):
    assessments: List[AssessmentHistoryItem]
    pagination: Dict[str, Any]

class AssessmentCompareRequest(BaseModel):
    assessment_ids: List[str]

class FeedbackCreate(BaseModel):
    assessment_id: Optional[str] = None
    rating: int
    comment: Optional[str] = None
    category: Optional[str] = "general"
