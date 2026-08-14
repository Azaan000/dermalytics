from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class UserRegister(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: Dict[str, Any]

class UserProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None

class PasswordChange(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=8)

class PasswordReset(BaseModel):
    email: EmailStr

class UserOut(BaseModel):
    id: str
    email: str
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    is_active: bool
    is_admin: bool
    is_verified: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    profile_picture_url: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = {}

    class Config:
        from_attributes = True
