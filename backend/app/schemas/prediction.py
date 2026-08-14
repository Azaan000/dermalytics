from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class ClassProbability(BaseModel):
    class_name: str = Field(..., alias="class")
    confidence: float
    description: Optional[str] = None
    risk: Optional[str] = None

    class Config:
        populate_by_name = True

class SkinPredictionResult(BaseModel):
    predicted_class: str = Field(..., alias="class")
    confidence: float
    top_classes: List[Dict[str, Any]]
    risk_level: str
    requires_consultation: bool
    diagnostic_rationale: Optional[str] = None
    model_version: str = "v2.1.0"
    model_name: str = "EfficientNetB3"

    class Config:
        populate_by_name = True

class HairMetrics(BaseModel):
    coverage_percentage: float
    follicle_density: float
    hair_diameter: float
    scalp_visibility: float
    sebum_level: Optional[str] = "Normal"
    inflammation_score: Optional[str] = "Low"

class HairPredictionResult(BaseModel):
    density_score: float
    thinning_stage: str
    hairline_type: str
    severity: str
    recommendation: str
    metrics: HairMetrics
    diagnostic_rationale: Optional[str] = None
    model_version: str = "v2.1.0"
    model_name: str = "MobileNetV3"

class PredictionOut(BaseModel):
    id: str
    assessment_id: str
    model_version: str
    model_name: str
    prediction_type: str
    result: Dict[str, Any]
    confidence: Optional[float] = None
    top_classes: Optional[List[Dict[str, Any]]] = None
    risk_level: Optional[str] = None
    grad_cam_image_url: Optional[str] = None
    processing_time_ms: int
    created_at: datetime
    metadata_json: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True
