from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from app.database import get_db
from app.models.review import Review, ReviewStatus
from app.models.room import Room
from app.schemas.review import ReviewResponse, AdminReplyRequest
from app.middleware.auth import require_admin

router = APIRouter(prefix="/reviews", tags=["Admin Reviews"], dependencies=[Depends(require_admin)])

review_detail_options = (
    selectinload(Review.user),
    selectinload(Review.room).selectinload(Room.room_type),
)

@router.get("", response_model=List[ReviewResponse])
async def admin_get_reviews(db: AsyncSession = Depends(get_db)):
    """Xem danh sách toàn bộ các đánh giá (bao gồm cả các đơn đang chờ duyệt)."""
    result = await db.execute(
        select(Review)
        .order_by(Review.created_at.desc())
        .options(*review_detail_options)
    )
    return result.scalars().all()

@router.patch("/{id}/status", response_model=ReviewResponse)
async def admin_update_review_status(
    id: str,
    status_in: ReviewStatus,
    db: AsyncSession = Depends(get_db)
):
    """Phê duyệt (APPROVED) hoặc Ẩn (HIDDEN) đánh giá của khách hàng."""
    result = await db.execute(select(Review).where(Review.id == id).options(*review_detail_options))
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="Không tìm thấy đánh giá")
        
    review.status = status_in
    await db.commit()
    return review

@router.post("/{id}/reply", response_model=ReviewResponse)
async def admin_reply_review(
    id: str,
    reply_req: AdminReplyRequest,
    db: AsyncSession = Depends(get_db)
):
    """Admin phản hồi lại đánh giá của khách hàng."""
    result = await db.execute(select(Review).where(Review.id == id).options(*review_detail_options))
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="Không tìm thấy đánh giá")
        
    review.admin_reply = reply_req.reply
    review.admin_reply_at = datetime.utcnow()
    # Tự động duyệt review khi admin đã phản hồi
    review.status = ReviewStatus.APPROVED
    
    await db.commit()
    return review
