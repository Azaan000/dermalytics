from fastapi import APIRouter, Depends, UploadFile, File, Form, Request, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from app.core.database import get_db
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user
from app.schemas.response import StandardResponse
from app.schemas.assessment import AssessmentCompareRequest
from app.services.analysis_service import analysis_service
from app.core.exceptions import ValidationException

router = APIRouter()

@router.post("/skin", response_model=StandardResponse)
async def analyze_skin(
    request: Request,
    image: UploadFile = File(...),
    crop_region: Optional[str] = Form("auto"),
    return_gradcam: Optional[bool] = Form(True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not image.content_type.startswith("image/"):
        raise ValidationException("Please upload a valid JPEG, PNG, or WebP image", code="VAL_2002")

    file_bytes = await image.read()
    ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    result = analysis_service.analyze_skin(
        db=db,
        user_id=current_user.id,
        file_bytes=file_bytes,
        ip=ip,
        user_agent=user_agent
    )
    return StandardResponse(
        status="success",
        message="Skin analysis completed successfully",
        data=result
    )

@router.post("/hair", response_model=StandardResponse)
async def analyze_hair(
    request: Request,
    image: UploadFile = File(...),
    hairline_detection: Optional[bool] = Form(True),
    density_estimation: Optional[bool] = Form(True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not image.content_type.startswith("image/"):
        raise ValidationException("Please upload a valid JPEG, PNG, or WebP image", code="VAL_2002")

    file_bytes = await image.read()
    ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    result = analysis_service.analyze_hair(
        db=db,
        user_id=current_user.id,
        file_bytes=file_bytes,
        ip=ip,
        user_agent=user_agent
    )
    return StandardResponse(
        status="success",
        message="Hair and scalp analysis completed successfully",
        data=result
    )

@router.get("/history", response_model=StandardResponse)
def get_history(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    type: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    history_data = analysis_service.get_history(
        db=db,
        user_id=current_user.id,
        page=page,
        limit=limit,
        assessment_type=type
    )
    return StandardResponse(
        status="success",
        data=history_data
    )

@router.get("/{assessment_id}", response_model=StandardResponse)
def get_assessment(
    assessment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    data = analysis_service.get_assessment(db, assessment_id, current_user.id)
    return StandardResponse(status="success", data=data)

@router.post("/compare", response_model=StandardResponse)
def compare_assessments(
    body: AssessmentCompareRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    data = analysis_service.compare_assessments(db, body.assessment_ids, current_user.id)
    return StandardResponse(status="success", data=data)

@router.delete("/{assessment_id}", response_model=StandardResponse)
def delete_assessment(
    assessment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis_service.delete_assessment(db, assessment_id, current_user.id)
    return StandardResponse(status="success", message="Assessment deleted successfully")
