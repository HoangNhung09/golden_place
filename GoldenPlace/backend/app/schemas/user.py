from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import date, datetime
from app.models.user import UserRole

class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    nationality: Optional[str] = None
    id_number: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    nationality: Optional[str] = None
    id_number: Optional[str] = None

class UserPasswordUpdate(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=8)

class UserResetPasswordRequest(BaseModel):
    email: EmailStr

class UserResetPassword(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)

class UserResponse(UserBase):
    id: str
    role: UserRole
    is_active: bool
    is_email_verified: bool
    membership_tier: str = "Gold"
    reward_points: int = 0
    total_points: int = 0
    used_points: int = 0
    booking_count: int = 0
    total_spent: float = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
