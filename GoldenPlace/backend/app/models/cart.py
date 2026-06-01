import uuid
from datetime import datetime, date
from sqlalchemy import String, ForeignKey, Date, Integer, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.base import TimestampMixin

class Cart(Base, TimestampMixin):
    __tablename__ = "carts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    room_id: Mapped[str] = mapped_column(String(36), ForeignKey("rooms.id"), nullable=True)
    promotion_id: Mapped[str] = mapped_column(String(36), ForeignKey("promotions.id"), nullable=True)
    check_in_date: Mapped[date] = mapped_column(Date, nullable=True)
    check_out_date: Mapped[date] = mapped_column(Date, nullable=True)
    adults: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    children: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_expired: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    user: Mapped["User"] = relationship("User")
    room: Mapped["Room"] = relationship("Room")
    promotion: Mapped["Promotion"] = relationship("Promotion")
