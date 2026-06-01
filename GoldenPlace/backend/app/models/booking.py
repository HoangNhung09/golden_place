import uuid
import enum
from datetime import date, time, datetime
from sqlalchemy import String, Unicode, ForeignKey, Date, Integer, Enum, Numeric, UnicodeText, Time, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.base import TimestampMixin

class BookingStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    CHECKED_IN = "CHECKED_IN"
    CHECKED_OUT = "CHECKED_OUT"
    CANCELLED = "CANCELLED"
    NO_SHOW = "NO_SHOW"

class Booking(Base, TimestampMixin):
    __tablename__ = "bookings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_code: Mapped[str] = mapped_column(String(30), unique=True, nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    room_id: Mapped[str] = mapped_column(String(36), ForeignKey("rooms.id"), nullable=False)
    promotion_id: Mapped[str] = mapped_column(String(36), ForeignKey("promotions.id"), nullable=True)
    check_in_date: Mapped[date] = mapped_column(Date, nullable=False)
    check_out_date: Mapped[date] = mapped_column(Date, nullable=False)
    adults: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    children: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[BookingStatus] = mapped_column(Enum(BookingStatus), default=BookingStatus.PENDING, nullable=False)
    room_price_snapshot: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    discount_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0, nullable=False)
    services_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0, nullable=False)
    total_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    payment_method: Mapped[str] = mapped_column(Unicode(50), default="PAY_AT_HOTEL", nullable=False)
    payment_status: Mapped[str] = mapped_column(String(50), default="UNPAID", nullable=False)
    invoice_requested: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    invoice_company_name: Mapped[str] = mapped_column(Unicode(255), nullable=True)
    invoice_tax_code: Mapped[str] = mapped_column(Unicode(50), nullable=True)
    invoice_company_address: Mapped[str] = mapped_column(Unicode(500), nullable=True)
    guest_name: Mapped[str] = mapped_column(Unicode(255), nullable=False)
    guest_email: Mapped[str] = mapped_column(String(255), nullable=False)
    guest_phone: Mapped[str] = mapped_column(String(20), nullable=False)
    guest_nationality: Mapped[str] = mapped_column(Unicode(100), nullable=False)
    guest_id_number: Mapped[str] = mapped_column(Unicode(100), nullable=False)
    special_requests: Mapped[str] = mapped_column(UnicodeText, nullable=True)
    expected_checkin_time: Mapped[time] = mapped_column(Time, nullable=True)
    cancellation_reason: Mapped[str] = mapped_column(UnicodeText, nullable=True)

    user: Mapped["User"] = relationship("User")
    room: Mapped["Room"] = relationship("Room", back_populates="bookings")
    promotion: Mapped["Promotion"] = relationship("Promotion")
    booking_services: Mapped[list["BookingService"]] = relationship("BookingService", back_populates="booking", cascade="all, delete-orphan")
    status_logs: Mapped[list["BookingStatusLog"]] = relationship("BookingStatusLog", back_populates="booking", cascade="all, delete-orphan")


class BookingService(Base):
    __tablename__ = "booking_services"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id: Mapped[str] = mapped_column(String(36), ForeignKey("bookings.id"), nullable=False)
    service_id: Mapped[str] = mapped_column(String(36), ForeignKey("services.id"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    unit_price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    subtotal: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)

    booking: Mapped[Booking] = relationship("Booking", back_populates="booking_services")
    service: Mapped["Service"] = relationship("Service")


class BookingStatusLog(Base):
    __tablename__ = "booking_status_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id: Mapped[str] = mapped_column(String(36), ForeignKey("bookings.id"), nullable=False)
    changed_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    old_status: Mapped[str] = mapped_column(String(50), nullable=True)
    new_status: Mapped[str] = mapped_column(String(50), nullable=False)
    note: Mapped[str] = mapped_column(UnicodeText, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    booking: Mapped[Booking] = relationship("Booking", back_populates="status_logs")
    user: Mapped["User"] = relationship("User")
