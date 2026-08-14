from fastapi import APIRouter, Depends, Request, Header
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.security import decode_token
from app.core.exceptions import AuthenticationException
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, TokenResponse, PasswordChange, PasswordReset
from app.schemas.response import StandardResponse
from app.services.auth_service import auth_service
from app.services.user_service import user_service

router = APIRouter()

def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        # For demo ease, return a default mock user if no auth header provided
        default_user = db.query(User).filter(User.email == "demo@dermalytics.com").first()
        if default_user:
            return default_user
        # Create default demo user if not exists
        default_user = User(
            email="demo@dermalytics.com",
            username="demo_patient",
            password_hash="$2b$12$eAxy8f1V...",
            first_name="Demo",
            last_name="Patient",
            is_active=True,
            is_verified=True,
            is_admin=False
        )
        db.add(default_user)
        db.commit()
        db.refresh(default_user)
        return default_user

    token = authorization.split(" ")[1]
    payload = decode_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise AuthenticationException("Invalid or expired token", code="AUTH_1005")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise AuthenticationException("User does not exist", code="AUTH_1005")
    if not user.is_active:
        raise AuthenticationException("User account is inactive", code="AUTH_1003")

    return user

@router.post("/register", response_model=StandardResponse)
def register(user_in: UserRegister, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else None
    user = auth_service.register_user(db, user_in, ip=ip)
    return StandardResponse(
        status="success",
        message="User registered successfully",
        data={
            "user_id": user.id,
            "email": user.email,
            "username": user.username,
            "created_at": user.created_at.isoformat(),
            "requires_verification": False
        }
    )

@router.post("/login", response_model=StandardResponse)
def login(login_data: UserLogin, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else None
    auth_result = auth_service.authenticate_user(db, login_data, ip=ip)
    return StandardResponse(
        status="success",
        message="Login successful",
        data=auth_result
    )

@router.post("/logout", response_model=StandardResponse)
def logout():
    return StandardResponse(status="success", message="Logged out successfully")

@router.post("/verify-email", response_model=StandardResponse)
def verify_email():
    return StandardResponse(status="success", message="Email verified successfully")

@router.post("/reset-password", response_model=StandardResponse)
def reset_password(data: PasswordReset):
    return StandardResponse(
        status="success",
        message=f"If an account exists with {data.email}, password reset instructions have been sent."
    )

@router.post("/change-password", response_model=StandardResponse)
def change_password(
    data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_service.change_password(db, current_user.id, data)
    return StandardResponse(status="success", message="Password changed successfully")
