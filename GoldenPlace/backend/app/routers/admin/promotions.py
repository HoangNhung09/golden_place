from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.database import get_db
from app.models.promotion import Promotion
from app.schemas.promotion import PromotionResponse, PromotionCreate, PromotionUpdate
from app.middleware.auth import require_admin

router = APIRouter(prefix="/promotions", tags=["Admin Promotions"], dependencies=[Depends(require_admin)])

@router.get("", response_model=List[PromotionResponse])
async def admin_get_promotions(db: AsyncSession = Depends(get_db)):
    """Xem toàn bộ danh sách mã giảm giá và chương trình khuyến mãi."""
    result = await db.execute(select(Promotion).order_by(Promotion.created_at.desc()))
    return result.scalars().all()

@router.post("", response_model=PromotionResponse, status_code=status.HTTP_201_CREATED)
async def admin_create_promotion(promo_in: PromotionCreate, db: AsyncSession = Depends(get_db)):
    """Tạo chương trình khuyến mãi hoặc mã giảm giá mới."""
    if promo_in.code:
        dup = await db.execute(select(Promotion).where(Promotion.code == promo_in.code.upper()))
        if dup.scalars().first():
            raise HTTPException(status_code=400, detail="Mã giảm giá (code) này đã tồn tại")
            
    new_promo = Promotion(
        name=promo_in.name,
        description=promo_in.description,
        code=promo_in.code.upper() if promo_in.code else None,
        type=promo_in.type,
        discount_type=promo_in.discount_type,
        discount_value=promo_in.discount_value,
        min_order_amount=promo_in.min_order_amount,
        max_uses=promo_in.max_uses,
        start_date=promo_in.start_date,
        end_date=promo_in.end_date,
        applicable_to=promo_in.applicable_to,
        applicable_ids=promo_in.applicable_ids
    )
    db.add(new_promo)
    await db.commit()
    return new_promo

@router.put("/{id}", response_model=PromotionResponse)
async def admin_update_promotion(
    id: str,
    promo_in: PromotionUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Cập nhật chương trình khuyến mãi."""
    result = await db.execute(select(Promotion).where(Promotion.id == id))
    promo = result.scalar_one_or_none()
    if not promo:
        raise HTTPException(status_code=404, detail="Không tìm thấy chương trình khuyến mãi")
        
    if promo_in.code and promo_in.code.upper() != promo.code:
        dup = await db.execute(select(Promotion).where(Promotion.code == promo_in.code.upper()))
        if dup.scalars().first():
            raise HTTPException(status_code=400, detail="Mã giảm giá (code) này đã tồn tại")
            
    update_data = promo_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "code" and value:
            setattr(promo, field, value.upper())
        else:
            setattr(promo, field, value)
            
    await db.commit()
    return promo

@router.patch("/{id}/toggle-active", response_model=PromotionResponse)
async def admin_toggle_promotion(id: str, db: AsyncSession = Depends(get_db)):
    """Bật / Tắt trạng thái hoạt động của khuyến mãi."""
    result = await db.execute(select(Promotion).where(Promotion.id == id))
    promo = result.scalar_one_or_none()
    if not promo:
        raise HTTPException(status_code=404, detail="Không tìm thấy chương trình khuyến mãi")
        
    promo.is_active = not promo.is_active
    await db.commit()
    return promo

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_promotion(id: str, db: AsyncSession = Depends(get_db)):
    """Xóa khuyến mãi khỏi hệ thống."""
    result = await db.execute(select(Promotion).where(Promotion.id == id))
    promo = result.scalar_one_or_none()
    if not promo:
        raise HTTPException(status_code=404, detail="Không tìm thấy chương trình khuyến mãi")
        
    await db.delete(promo)
    await db.commit()
    return None
