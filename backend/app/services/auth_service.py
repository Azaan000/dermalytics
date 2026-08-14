from datetime import datetime
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.audit_log import AuditLog
from app.models.notification import Notification
from app.schemas.user import UserRegister, UserLogin
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from app.core.exceptions import AuthenticationException, ValidationException
from app.utils.validators import validate_password_strength

class AuthService:
    def register_user(self, db: Session, user_in: UserRegister, ip: str = None) -> User:
        # Check existing email
        if db.query(User).filter(User.email == user_in.email.lower()).first():
            raise ValidationException("Email is already registered", code="AUTH_1007")
        
        # Check existing username
        if db.query(User).filter(User.username == user_in.username).first():
            raise ValidationException("Username is already taken", code="AUTH_1008")

        validate_password_strength(user_in.password)

        new_user = User(
            email=user_in.email.lower(),
            username=user_in.username,
            password_hash=get_password_hash(user_in.password),
            first_name=user_in.first_name,
            last_name=user_in.last_name,
            phone_number=user_in.phone_number,
            date_of_birth=user_in.date_of_birth,
            gender=user_in.gender,
            is_active=True,
            is_verified=True,
            is_admin=False
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Create welcome notification
        welcome_notif = Notification(
            user_id=new_user.id,
            type="welcome",
            title="Welcome to Dermalytics!",
            message="Your account has been created. You can now perform skin lesion classifications and hair health assessments."
        )
        db.add(welcome_notif)

        # Audit log
        audit = AuditLog(
            user_id=new_user.id,
            action="USER_REGISTER",
            resource_type="USER",
            resource_id=new_user.id,
            details={"email": new_user.email},
            ip_address=ip
        )
        db.add(audit)
        db.commit()

        return new_user

    def authenticate_user(self, db: Session, login_data: UserLogin, ip: str = None) -> dict:
        user = db.query(User).filter(User.email == login_data.email.lower()).first()
        if not user:
            raise AuthenticationException("Invalid email or password", code="AUTH_1001")

        if not user.is_active:
            raise AuthenticationException("Your account is currently disabled.", code="AUTH_1003")

        if not verify_password(login_data.password, user.password_hash):
            user.login_attempts += 1
            db.commit()
            raise AuthenticationException("Invalid email or password", code="AUTH_1001")

        user.login_attempts = 0
        user.last_login = datetime.utcnow()
        db.commit()

        # Generate tokens
        access_token = create_access_token(user.id, is_admin=user.is_admin)
        refresh_token = create_refresh_token(user.id)

        # Audit log
        audit = AuditLog(
            user_id=user.id,
            action="USER_LOGIN",
            resource_type="AUTH",
            resource_id=user.id,
            ip_address=ip
        )
        db.add(audit)
        db.commit()

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": 86400,
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_admin": user.is_admin,
                "is_verified": user.is_verified,
                "created_at": user.created_at.isoformat()
            }
        }

auth_service = AuthService()
