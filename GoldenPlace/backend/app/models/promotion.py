import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Unicode, Enum, Numeric, Integer, DateTime, JSON, Boolean, UnicodeText
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
from app.models.base import TimestampMixin

class PromotionType(str, enum.Enum):
    COUPON = "COUPON"
    FLASH_SALE = "FLASH_SALE"
    EARLY_BIRD = "EARLY_BIRD"
    LAST_MINUTE = "LAST_MINUTE"

class DiscountType(str, enum.Enum):
    PERCENT = "PERCENT"
    AMOUNT = "AMOUNT"

class ApplicableTo(str, enum.Enum):
    ALL = "ALL"
    ROOM_TYPE = "ROOM_TYPE"
    ROOM = "ROOM"

class Promotion(Base, TimestampMixin):
    __tablename__ = "promotions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(Unicode(255), nullable=False)
    description: Mapped[str] = mapped_column(UnicodeText, nullable=True)
    code: Mapped[str] = mapped_column(String(100), unique=True, nullable=True, index=True)
    type: Mapped[PromotionType] = mapped_column(Enum(PromotionType), nullable=False)
    discount_type: Mapped[DiscountType] = mapped_column(Enum(DiscountType), nullable=False)
    discount_value: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    min_order_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0, nullable=False)
    max_uses: Mapped[int] = mapped_column(Integer, nullable=True)
    used_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    start_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    applicable_to: Mapped[ApplicableTo] = mapped_column(Enum(ApplicableTo), default=ApplicableTo.ALL, nullable=False)
    applicable_ids: Mapped[list] = mapped_column(JSON, nullable=True)  # List of UUID strings
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
