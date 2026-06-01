import uuid
import enum
from sqlalchemy import String, Unicode, Integer, Numeric, UnicodeText, Boolean, ForeignKey, Enum, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.base import TimestampMixin

class RoomStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    MAINTENANCE = "MAINTENANCE"
    BLOCKED = "BLOCKED"

class RoomType(Base, TimestampMixin):
    __tablename__ = "room_types"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(Unicode(100), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(UnicodeText, nullable=True)
    amenities: Mapped[list] = mapped_column(JSON, default=list, nullable=False)  # e.g., ["WiFi", "TV", "Air Conditioning"]

    rooms: Mapped[list["Room"]] = relationship("Room", back_populates="room_type", cascade="all, delete-orphan")


class Room(Base, TimestampMixin):
    __tablename__ = "rooms"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    room_number: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    room_type_id: Mapped[str] = mapped_column(String(36), ForeignKey("room_types.id"), nullable=False)
    floor: Mapped[int] = mapped_column(Integer, nullable=False)
    max_adults: Mapped[int] = mapped_column(Integer, default=2, nullable=False)
    max_children: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    area_sqm: Mapped[float] = mapped_column(Numeric(6, 2), nullable=True)
    base_price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    weekend_price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=True)
    description: Mapped[str] = mapped_column(UnicodeText, nullable=True)
    images: Mapped[list] = mapped_column(JSON, default=list, nullable=False)  # List of URLs
    status: Mapped[RoomStatus] = mapped_column(Enum(RoomStatus), default=RoomStatus.AVAILABLE, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    room_type: Mapped[RoomType] = relationship("RoomType", back_populates="rooms")
    bookings: Mapped[list["Booking"]] = relationship("Booking", back_populates="room")
