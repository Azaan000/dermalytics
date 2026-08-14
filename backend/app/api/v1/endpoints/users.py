from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user
from app.schemas.user import UserOut, UserProfileUpdate
from app.schemas.response import StandardResponse
from app.schemas.assessment import FeedbackCreate
from app.services.user_service import user_service

router = APIRouter()

@router.get("/profile", response_model=StandardResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return StandardResponse(
        status="success",
        data={
            "id": current_user.id,
            "email": current_user.email,
            "username": current_user.username,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "phone_number": current_user.phone_number,
            "date_of_birth": current_user.date_of_birth,
            "gender": current_user.gender,
            "is_admin": current_user.is_admin,
            "is_verified": current_user.is_verified,
            "created_at": current_user.created_at.isoformat(),
            "preferences": current_user.preferences or {}
        }
    )

@router.put("/profile", response_model=StandardResponse)
def update_profile(
    data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = user_service.update_profile(db, current_user.id, data)
    return StandardResponse(
        status="success",
        message="Profile updated successfully",
        data={
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name
        }
    )

@router.get("/stats", response_model=StandardResponse)
def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    stats = user_service.get_user_stats(db, current_user.id)
    return StandardResponse(status="success", data=stats)

@router.get("/notifications", response_model=StandardResponse)
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifications = user_service.get_notifications(db, current_user.id)
    return StandardResponse(
        status="success",
        data=[
            {
                "id": n.id,
                "type": n.type,
                "title": n.title,
                "message": n.message,
                "is_read": n.is_read,
                "created_at": n.created_at.isoformat()
            }
            for n in notifications
        ]
    )

@router.put("/notifications/read-all", response_model=StandardResponse)
def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_service.mark_all_notifications_read(db, current_user.id)
    return StandardResponse(status="success", message="All notifications marked as read")

@router.post("/feedback", response_model=StandardResponse)
def submit_feedback(
    data: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    fb = user_service.submit_feedback(
        db=db,
        user_id=current_user.id,
        rating=data.rating,
        comment=data.comment or "",
        assessment_id=data.assessment_id,
        category=data.category or "general"
    )
    return StandardResponse(status="success", message="Thank you for your feedback!", data={"id": fb.id})

@router.get("/export-data", response_model=StandardResponse)
def export_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    data = user_service.export_user_data(db, current_user.id)
    return StandardResponse(status="success", data=data)
