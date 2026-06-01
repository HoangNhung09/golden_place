import uuid
from datetime import date, datetime
from sqlalchemy import String, Unicode, Boolean, Integer, Date, DateTime, UnicodeText, Enum
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
from app.models.base import TimestampMixin
import enum

class UserRole(str, enum.Enum):
    CUSTOMER = "customer"
    ADMIN = "admin"
    STAFF = "staff"

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(Unicode(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=True)
    avatar_url: Mapped[str] = mapped_column(String(500), nullable=True)
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=True)
    gender: Mapped[str] = mapped_column(Unicode(20), nullable=True)
    address: Mapped[str] = mapped_column(Unicode(500), nullable=True)
    nationality: Mapped[str] = mapped_column(Unicode(100), nullable=True)
    id_number: Mapped[str] = mapped_column(Unicode(100), nullable=True)
    membership_tier: Mapped[str] = mapped_column(Unicode(50), default="Gold", nullable=False)
    reward_points: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_points: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    used_points: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.CUSTOMER, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    email_verification_token: Mapped[str] = mapped_column(String(255), nullable=True)
    email_verification_expires: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    reset_password_token: Mapped[str] = mapped_column(String(255), nullable=True)
    reset_password_expires: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    failed_login_attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    locked_until: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    internal_note: Mapped[str] = mapped_column(UnicodeText, nullable=True)
