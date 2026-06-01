from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from typing import List
from app.database import get_db
from app.models.promotion import Promotion, PromotionType, ApplicableTo, DiscountType
from app.schemas.promotion import PromotionResponse, CouponValidateRequest, CouponValidateResponse
from app.middleware.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/promotions", tags=["Promotions"])

@router.get("/active", response_model=List[PromotionResponse])
async def get_active_promotions(db: AsyncSession = Depends(get_db)):
    """Lấy danh sách tối đa 3 khuyến mãi đang chạy (để hiển thị lên trang chủ)."""
    now = datetime.utcnow()
    # Flash Sale, Early bird, last minute, coupon đang chạy
    result = await db.execute(
        select(Promotion)
        .where(
            and_(
                Promotion.is_active == True,
                Promotion.start_date <= now,
                Promotion.end_date >= now
            )
        )
        .order_by(Promotion.created_at.desc())
        .limit(3)
    )
    return result.scalars().all()

@router.post("/validate", response_model=CouponValidateResponse)
async def validate_coupon(
    req: CouponValidateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Kiểm tra mã giảm giá nhập tay xem có hợp lệ cho phòng và mức giá hiện tại không."""
    now = datetime.utcnow()
    result = await db.execute(
        select(Promotion).where(
            Promotion.code == req.code.upper(),
            Promotion.is_active == True,
            Promotion.start_date <= now,
            Promotion.end_date >= now
        )
    )
    promo = result.scalar_one_or_none()
    
    if not promo:
        return CouponValidateResponse(valid=False, discount_amount=0.0, message="Mã giảm giá không tồn tại hoặc đã hết hạn")
        
    # Check max uses
    if promo.max_uses is not None and promo.used_count >= promo.max_uses:
        return CouponValidateResponse(valid=False, discount_amount=0.0, message="Mã giảm giá đã hết lượt sử dụng")
        
    # Check minimum order amount
    if req.room_price < float(promo.min_order_amount):
        return CouponValidateResponse(
            valid=False,
            discount_amount=0.0,
            message=f"Đơn hàng chưa đạt giá trị tối thiểu {promo.min_order_amount:,.0f} VND để áp dụng"
        )
        
    # Check applicability
    if promo.applicable_to == ApplicableTo.ROOM:
        if not promo.applicable_ids or req.room_id not in promo.applicable_ids:
            return CouponValidateResponse(valid=False, discount_amount=0.0, message="Mã giảm giá không áp dụng cho phòng này")
            
    # Tính toán giảm giá
    discount = 0.0
    if promo.discount_type == DiscountType.PERCENT:
        discount = (req.room_price * float(promo.discount_value)) / 100.0
    else:
        discount = float(promo.discount_value)
        
    discount = min(discount, req.room_price)
    
    return CouponValidateResponse(
        valid=True,
        discount_amount=discount,
        message="Áp dụng mã giảm giá thành công",
        promotion=promo
    )
