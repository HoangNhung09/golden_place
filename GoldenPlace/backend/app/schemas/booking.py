from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List, Literal
from datetime import date, time, datetime
from app.models.booking import BookingStatus
from app.schemas.room import RoomResponse
from app.schemas.promotion import PromotionResponse
from app.schemas.service import ServiceResponse

class BookingServiceCreate(BaseModel):
    service_id: str
    quantity: int = Field(default=1, ge=1)

class BookingServiceResponse(BaseModel):
    id: str
    service_id: str
    quantity: int
    unit_price: float
    subtotal: float
    service: Optional[ServiceResponse] = None

    model_config = ConfigDict(from_attributes=True)

class BookingCreate(BaseModel):
    guest_name: str = Field(..., min_length=2, max_length=255)
    guest_email: EmailStr
    guest_phone: str = Field(..., max_length=20)
    guest_nationality: str = Field(..., max_length=100)
    guest_id_number: str = Field(..., max_length=100)
    special_requests: Optional[str] = Field(None, max_length=500)
    expected_checkin_time: Optional[time] = None
    payment_method: Literal["PAY_AT_HOTEL", "BANK_TRANSFER", "VISA", "MOMO"] = "PAY_AT_HOTEL"
    invoice_requested: bool = False
    invoice_company_name: Optional[str] = Field(None, max_length=255)
    invoice_tax_code: Optional[str] = Field(None, max_length=50)
    invoice_company_address: Optional[str] = Field(None, max_length=500)
    services: List[BookingServiceCreate] = Field(default_factory=list)

class BookingStatusUpdate(BaseModel):
    status: BookingStatus
    note: Optional[str] = None

class BookingCancelRequest(BaseModel):
    reason: str = Field(..., min_length=5, max_length=500)

class BookingStatusLogResponse(BaseModel):
    id: str
    changed_by: Optional[str] = None
    old_status: Optional[str] = None
    new_status: str
    note: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class BookingResponse(BaseModel):
    id: str
    booking_code: str
    user_id: str
    room_id: str
    promotion_id: Optional[str] = None
    check_in_date: date
    check_out_date: date
    adults: int
    children: int
    status: BookingStatus
    room_price_snapshot: float
    discount_amount: float
    services_amount: float
    total_amount: float
    payment_method: str = "PAY_AT_HOTEL"
    payment_status: str = "UNPAID"
    invoice_requested: bool = False
    invoice_company_name: Optional[str] = None
    invoice_tax_code: Optional[str] = None
    invoice_company_address: Optional[str] = None
    guest_name: str
    guest_email: str
    guest_phone: str
    guest_nationality: str
    guest_id_number: str
    special_requests: Optional[str] = None
    expected_checkin_time: Optional[time] = None
    cancellation_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    room: Optional[RoomResponse] = None
    promotion: Optional[PromotionResponse] = None
    booking_services: List[BookingServiceResponse] = Field(default_factory=list)
    status_logs: List[BookingStatusLogResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)

class BookingCalendarResponse(BaseModel):
    id: str
    booking_code: str
    guest_name: str
    room_number: str
    check_in_date: date
    check_out_date: date
    status: BookingStatus

    model_config = ConfigDict(from_attributes=True)
