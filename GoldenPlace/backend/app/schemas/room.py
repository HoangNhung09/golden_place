from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.models.room import RoomStatus

class RoomTypeBase(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    amenities: List[str] = Field(default_factory=list)

class RoomTypeCreate(RoomTypeBase):
    pass

class RoomTypeResponse(RoomTypeBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RoomBase(BaseModel):
    room_number: str = Field(..., max_length=20)
    room_type_id: str
    floor: int
    max_adults: int = Field(default=2, ge=1)
    max_children: int = Field(default=0, ge=0)
    area_sqm: Optional[float] = None
    base_price: float = Field(..., gt=0)
    weekend_price: Optional[float] = Field(None, gt=0)
    description: Optional[str] = None
    images: List[str] = Field(default_factory=list)
    status: RoomStatus = RoomStatus.AVAILABLE

class RoomCreate(RoomBase):
    pass

class RoomUpdate(BaseModel):
    room_number: Optional[str] = Field(None, max_length=20)
    room_type_id: Optional[str] = None
    floor: Optional[int] = None
    max_adults: Optional[int] = Field(None, ge=1)
    max_children: Optional[int] = Field(None, ge=0)
    area_sqm: Optional[float] = None
    base_price: Optional[float] = Field(None, gt=0)
    weekend_price: Optional[float] = Field(None, gt=0)
    description: Optional[str] = None
    images: Optional[List[str]] = None
    status: Optional[RoomStatus] = None
    is_active: Optional[bool] = None

class RoomStatusUpdate(BaseModel):
    status: RoomStatus

class RoomResponse(RoomBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    room_type: Optional[RoomTypeResponse] = None

    model_config = ConfigDict(from_attributes=True)


class RoomListResponse(BaseModel):
    rooms: List[RoomResponse]
    total: int
    page: int
    limit: int
    pages: int
