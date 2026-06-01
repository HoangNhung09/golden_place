from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.cart import Cart
from app.models.room import Room
from app.models.promotion import Promotion, PromotionType, DiscountType, ApplicableTo
from app.models.user import User
from app.schemas.cart import CartUpdate, CartResponse
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/cart", tags=["Cart"])

async def get_or_create_cart(user_id: str, db: AsyncSession) -> Cart:
    """Helper lấy giỏ hàng hoặc tạo mới nếu chưa tồn tại."""
    result = await db.execute(
        select(Cart)
        .where(Cart.user_id == user_id)
        .options(
            selectinload(Cart.room).selectinload(Room.room_type),
            selectinload(Cart.promotion)
        )
    )
    cart = result.scalar_one_or_none()
    
    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        await db.commit()
        # Reload cart with relations
        result = await db.execute(
            select(Cart)
            .where(Cart.user_id == user_id)
            .options(
                selectinload(Cart.room).selectinload(Room.room_type),
                selectinload(Cart.promotion)
            )
        )
        cart = result.scalar_one_or_none()
        
    # Check expiry
    if cart.expires_at and cart.expires_at < datetime.utcnow():
        cart.room_id = None
        cart.promotion_id = None
        cart.check_in_date = None
        cart.check_out_date = None
        cart.is_expired = True
        cart.expires_at = None
        await db.commit()
        
    return cart

@router.get("", response_model=CartResponse)
async def get_cart(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Xem giỏ hàng hiện tại."""
    return await get_or_create_cart(current_user.id, db)

@router.post("", response_model=CartResponse)
async def update_cart(
    cart_in: CartUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Thêm/cập nhật phòng vào giỏ hàng."""
    # Kiểm tra phòng tồn tại
    result = await db.execute(select(Room).where(Room.id == cart_in.room_id, Room.is_active == True))
    room = result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Không tìm thấy thông tin phòng")
        
    if cart_in.check_in_date >= cart_in.check_out_date:
        raise HTTPException(status_code=400, detail="Ngày check-in phải trước ngày check-out")
        
    cart = await get_or_create_cart(current_user.id, db)
    
    # Cập nhật thông tin giỏ hàng
    cart.room_id = cart_in.room_id
    cart.check_in_date = cart_in.check_in_date
    cart.check_out_date = cart_in.check_out_date
    cart.adults = cart_in.adults
    cart.children = cart_in.children
    cart.is_expired = False
    cart.expires_at = datetime.utcnow() + timedelta(minutes=30) # Hết hạn sau 30 phút
    
    await db.commit()
    
    # Refresh to return
    result = await db.execute(
        select(Cart)
        .where(Cart.id == cart.id)
        .options(
            selectinload(Cart.room).selectinload(Room.room_type),
            selectinload(Cart.promotion)
        )
    )
    return result.scalar_one()

@router.delete("", response_model=CartResponse)
async def clear_cart(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Xóa toàn bộ phòng và coupon khỏi giỏ hàng."""
    cart = await get_or_create_cart(current_user.id, db)
    cart.room_id = None
    cart.promotion_id = None
    cart.check_in_date = None
    cart.check_out_date = None
    cart.expires_at = None
    cart.is_expired = False
    
    await db.commit()
    return cart

@router.post("/apply-promotion", response_model=CartResponse)
async def apply_promotion(
    code: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Áp dụng mã giảm giá vào giỏ hàng."""
    cart = await get_or_create_cart(current_user.id, db)
    if not cart.room_id:
        raise HTTPException(status_code=400, detail="Vui lòng thêm phòng vào giỏ hàng trước khi áp dụng mã")
        
    # Tìm mã khuyến mãi
    result = await db.execute(
        select(Promotion).where(
            Promotion.code == code.upper(),
            Promotion.is_active == True,
            Promotion.start_date <= datetime.utcnow(),
            Promotion.end_date >= datetime.utcnow()
        )
    )
    promo = result.scalar_one_or_none()
    if not promo:
        raise HTTPException(status_code=400, detail="Mã giảm giá không hợp lệ hoặc đã hết hạn")
        
    # Kiểm tra giới hạn sử dụng
    if promo.max_uses is not None and promo.used_count >= promo.max_uses:
        raise HTTPException(status_code=400, detail="Mã giảm giá đã hết lượt sử dụng")
        
    # Kiểm tra điều kiện áp dụng cho phòng / loại phòng
    if promo.applicable_to == ApplicableTo.ROOM:
        if promo.applicable_ids and cart.room_id not in promo.applicable_ids:
            raise HTTPException(status_code=400, detail="Mã giảm giá không áp dụng cho phòng này")
    elif promo.applicable_to == ApplicableTo.ROOM_TYPE:
        if promo.applicable_ids and cart.room.room_type_id not in promo.applicable_ids:
            raise HTTPException(status_code=400, detail="Mã giảm giá không áp dụng cho loại phòng này")
            
    cart.promotion_id = promo.id
    await db.commit()
    
    result = await db.execute(
        select(Cart)
        .where(Cart.id == cart.id)
        .options(
            selectinload(Cart.room).selectinload(Room.room_type),
            selectinload(Cart.promotion)
        )
    )
    return result.scalar_one()

@router.delete("/remove-promotion", response_model=CartResponse)
async def remove_promotion(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Xóa mã giảm giá khỏi giỏ hàng."""
    cart = await get_or_create_cart(current_user.id, db)
    cart.promotion_id = None
    await db.commit()
    return cart
