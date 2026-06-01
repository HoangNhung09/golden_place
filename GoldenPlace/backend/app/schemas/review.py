from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.models.review import ReviewStatus
from app.schemas.user import UserResponse
from app.schemas.room import RoomResponse

class ReviewBase(BaseModel):
    rating_room: int = Field(..., ge=1, le=5)
    rating_service: int = Field(..., ge=1, le=5)
    rating_cleanliness: int = Field(..., ge=1, le=5)
    rating_location: int = Field(..., ge=1, le=5)
    rating_value: int = Field(..., ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=1000)
    images: List[str] = Field(default_factory=list)

class ReviewCreate(ReviewBase):
    booking_id: str

class AdminReplyRequest(BaseModel):
    reply: str = Field(..., min_length=2, max_length=1000)

class ReviewResponse(BaseModel):
    id: str
    booking_id: str
    user_id: str
    room_id: str
    rating_room: int
    rating_service: int
    rating_cleanliness: int
    rating_location: int
    rating_value: int
    rating_overall: float
    comment: Optional[str] = None
    images: List[str]
    status: ReviewStatus
    admin_reply: Optional[str] = None
    admin_reply_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    user: Optional[UserResponse] = None
    room: Optional[RoomResponse] = None

    model_config = ConfigDict(from_attributes=True)
