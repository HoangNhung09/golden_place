from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional, List
from datetime import datetime
from app.models.promotion import PromotionType, DiscountType, ApplicableTo

class PromotionBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    code: Optional[str] = Field(None, max_length=100)
    type: PromotionType
    discount_type: DiscountType
    discount_value: float = Field(..., gt=0)
    min_order_amount: float = Field(default=0.0, ge=0)
    max_uses: Optional[int] = Field(None, ge=1)
    start_date: datetime
    end_date: datetime
    applicable_to: ApplicableTo = ApplicableTo.ALL
    applicable_ids: Optional[List[str]] = Field(default=None)

    @field_validator("discount_value")
    @classmethod
    def validate_discount_value(cls, v, info):
        discount_type = info.data.get("discount_type")
        if discount_type == DiscountType.PERCENT and v > 100.0:
            raise ValueError("Phần trăm giảm giá không được vượt quá 100%")
        return v

class PromotionCreate(PromotionBase):
    pass

class PromotionUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    code: Optional[str] = Field(None, max_length=100)
    type: Optional[PromotionType] = None
    discount_type: Optional[DiscountType] = None
    discount_value: Optional[float] = Field(None, gt=0)
    min_order_amount: Optional[float] = Field(None, ge=0)
    max_uses: Optional[int] = Field(None, ge=1)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    applicable_to: Optional[ApplicableTo] = None
    applicable_ids: Optional[List[str]] = None
    is_active: Optional[bool] = None

class PromotionResponse(PromotionBase):
    id: str
    used_count: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CouponValidateRequest(BaseModel):
    code: str
    room_id: str
    room_price: float

class CouponValidateResponse(BaseModel):
    valid: bool
    discount_amount: float
    message: Optional[str] = None
    promotion: Optional[PromotionResponse] = None
