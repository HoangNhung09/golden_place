from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date, datetime
from app.schemas.room import RoomResponse
from app.schemas.promotion import PromotionResponse

class CartUpdate(BaseModel):
    room_id: str
    check_in_date: date
    check_out_date: date
    adults: int = 1
    children: int = 0

class CartResponse(BaseModel):
    id: str
    user_id: str
    room_id: Optional[str] = None
    promotion_id: Optional[str] = None
    check_in_date: Optional[date] = None
    check_out_date: Optional[date] = None
    adults: int
    children: int
    is_expired: bool
    expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    room: Optional[RoomResponse] = None
    promotion: Optional[PromotionResponse] = None

    model_config = ConfigDict(from_attributes=True)
