import uuid
import enum
from datetime import datetime
from sqlalchemy import String, ForeignKey, Integer, Numeric, UnicodeText, JSON, Enum, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.base import TimestampMixin

class ReviewStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    HIDDEN = "HIDDEN"

class Review(Base, TimestampMixin):
    __tablename__ = "reviews"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id: Mapped[str] = mapped_column(String(36), ForeignKey("bookings.id"), unique=True, nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    room_id: Mapped[str] = mapped_column(String(36), ForeignKey("rooms.id"), nullable=False)
    
    rating_room: Mapped[int] = mapped_column(Integer, nullable=False)
    rating_service: Mapped[int] = mapped_column(Integer, nullable=False)
    rating_cleanliness: Mapped[int] = mapped_column(Integer, nullable=False)
    rating_location: Mapped[int] = mapped_column(Integer, nullable=False)
    rating_value: Mapped[int] = mapped_column(Integer, nullable=False)
    rating_overall: Mapped[float] = mapped_column(Numeric(3, 1), nullable=False)
    
    comment: Mapped[str] = mapped_column(UnicodeText, nullable=True)
    images: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    status: Mapped[ReviewStatus] = mapped_column(Enum(ReviewStatus), default=ReviewStatus.PENDING, nullable=False)
    
    admin_reply: Mapped[str] = mapped_column(UnicodeText, nullable=True)
    admin_reply_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    booking: Mapped["Booking"] = relationship("Booking")
    user: Mapped["User"] = relationship("User")
    room: Mapped["Room"] = relationship("Room")
