from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.user import User
from app.models.assessment import Assessment
from app.models.notification import Notification
from app.models.feedback import Feedback
from app.schemas.user import UserProfileUpdate, PasswordChange
from app.core.security import verify_password, get_password_hash
from app.core.exceptions import NotFoundException, ValidationException, AuthenticationException
from app.utils.validators import validate_password_strength

class UserService:
    def get_profile(self, db: Session, user_id: str) -> User:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise NotFoundException("User")
        return user

    def update_profile(self, db: Session, user_id: str, data: UserProfileUpdate) -> User:
        user = self.get_profile(db, user_id)
        update_data = data.model_dump(exclude_unset=True)
        for key, val in update_data.items():
            setattr(user, key, val)
        user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(user)
        return user

    def change_password(self, db: Session, user_id: str, data: PasswordChange) -> bool:
        user = self.get_profile(db, user_id)
        if not verify_password(data.old_password, user.password_hash):
            raise AuthenticationException("Current password does not match", code="AUTH_1001")
        validate_password_strength(data.new_password)
        user.password_hash = get_password_hash(data.new_password)
        db.commit()
        return True

    def get_user_stats(self, db: Session, user_id: str) -> Dict[str, Any]:
        total_assessments = db.query(Assessment).filter(Assessment.user_id == user_id, Assessment.is_deleted == False).count()
        skin_assessments = db.query(Assessment).filter(Assessment.user_id == user_id, Assessment.assessment_type == "skin", Assessment.is_deleted == False).count()
        hair_assessments = db.query(Assessment).filter(Assessment.user_id == user_id, Assessment.assessment_type == "hair", Assessment.is_deleted == False).count()
        unread_notifications = db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read == False).count()

        return {
            "total_assessments": total_assessments,
            "skin_assessments": skin_assessments,
            "hair_assessments": hair_assessments,
            "unread_notifications": unread_notifications
        }

    def get_notifications(self, db: Session, user_id: str) -> List[Notification]:
        return db.query(Notification).filter(Notification.user_id == user_id).order_by(desc(Notification.created_at)).all()

    def mark_all_notifications_read(self, db: Session, user_id: str) -> bool:
        db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read == False).update({
            "is_read": True,
            "read_at": datetime.utcnow()
        })
        db.commit()
        return True

    def submit_feedback(self, db: Session, user_id: str, rating: int, comment: str, assessment_id: str = None, category: str = "general") -> Feedback:
        feedback = Feedback(
            user_id=user_id,
            assessment_id=assessment_id,
            rating=rating,
            comment=comment,
            category=category
        )
        db.add(feedback)
        db.commit()
        db.refresh(feedback)
        return feedback

    def export_user_data(self, db: Session, user_id: str) -> Dict[str, Any]:
        user = self.get_profile(db, user_id)
        assessments = db.query(Assessment).filter(Assessment.user_id == user_id, Assessment.is_deleted == False).all()
        
        assessment_records = []
        for a in assessments:
            assessment_records.append({
                "id": a.id,
                "type": a.assessment_type,
                "created_at": a.created_at.isoformat(),
                "prediction": a.prediction.result if a.prediction else None
            })

        return {
            "user_profile": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "created_at": user.created_at.isoformat()
            },
            "assessments": assessment_records,
            "exported_at": datetime.utcnow().isoformat() + "Z"
        }

user_service = UserService()
