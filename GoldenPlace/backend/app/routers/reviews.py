from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from sqlalchemy.orm import selectinload
from typing import List
from app.database import get_db
from app.models.review import Review, ReviewStatus
from app.models.booking import Booking, BookingStatus
from app.models.room import Room
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewResponse
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/reviews", tags=["Reviews"])

review_response_options = (
    selectinload(Review.user),
    selectinload(Review.room).selectinload(Room.room_type),
)

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Khách hàng gửi đánh giá cho phòng đã lưu trú."""
    # Lấy thông tin booking để kiểm tra điều kiện
    result = await db.execute(
        select(Booking)
        .where(Booking.id == review_in.booking_id)
    )
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Không tìm thấy đặt phòng liên quan")
        
    if booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bạn không có quyền đánh giá đơn phòng của người khác")
        
    # Điều kiện 1: Trạng thái phải là CHECKED_OUT
    if booking.status != BookingStatus.CHECKED_OUT:
        raise HTTPException(
            status_code=400,
            detail="Bạn chỉ có thể đánh giá sau khi hoàn tất kỳ nghỉ (đã Check-out)"
        )
        
    # Điều kiện 2: Trong vòng 30 ngày từ ngày check-out
    checkout_datetime = datetime.combine(booking.check_out_date, datetime.min.time())
    if datetime.utcnow() > checkout_datetime + timedelta(days=30):
        raise HTTPException(
            status_code=400,
            detail="Thời gian gửi đánh giá đã quá hạn (tối đa 30 ngày sau Check-out)"
        )
        
    # Điều kiện 3: Chưa được đánh giá trước đó
    exists_result = await db.execute(select(Review).where(Review.booking_id == booking.id))
    if exists_result.scalars().first():
        raise HTTPException(
            status_code=400,
            detail="Bạn đã gửi đánh giá cho kỳ nghỉ này rồi"
        )
        
    # Tính overall rating = trung bình cộng 5 tiêu chí
    overall = (
        review_in.rating_room +
        review_in.rating_service +
        review_in.rating_cleanliness +
        review_in.rating_location +
        review_in.rating_value
    ) / 5.0
    
    # Tạo review mới
    new_review = Review(
        booking_id=booking.id,
        user_id=current_user.id,
        room_id=booking.room_id,
        rating_room=review_in.rating_room,
        rating_service=review_in.rating_service,
        rating_cleanliness=review_in.rating_cleanliness,
        rating_location=review_in.rating_location,
        rating_value=review_in.rating_value,
        rating_overall=round(overall, 1),
        comment=review_in.comment,
        images=review_in.images,
        status=ReviewStatus.PENDING # Chờ admin duyệt
    )
    db.add(new_review)
    await db.commit()
    
    # Load user relation to return
    result = await db.execute(
        select(Review)
        .where(Review.id == new_review.id)
        .options(*review_response_options)
    )
    return result.scalar_one()

@router.get("/me", response_model=List[ReviewResponse])
async def get_my_reviews(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Lấy danh sách đánh giá của chính tôi."""
    result = await db.execute(
        select(Review)
        .where(Review.user_id == current_user.id)
        .order_by(Review.created_at.desc())
        .options(*review_response_options)
    )
    return result.scalars().all()

@router.get("/room/{room_id}", response_model=List[ReviewResponse])
async def get_room_reviews(room_id: str, db: AsyncSession = Depends(get_db)):
    """Lấy toàn bộ đánh giá ĐÃ ĐƯỢC DUYỆT (APPROVED) của một phòng."""
    result = await db.execute(
        select(Review)
        .where(Review.room_id == room_id, Review.status == ReviewStatus.APPROVED)
        .order_by(Review.created_at.desc())
        .options(*review_response_options)
    )
    return result.scalars().all()
