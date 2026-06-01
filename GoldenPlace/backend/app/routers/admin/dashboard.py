from datetime import date, datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from typing import Dict, Any, List
from app.database import get_db
from app.models.booking import Booking, BookingStatus, BookingService
from app.models.room import Room, RoomStatus
from app.models.user import User, UserRole
from app.schemas.booking import BookingResponse
from app.middleware.auth import require_admin

router = APIRouter(prefix="/dashboard", tags=["Admin Dashboard"], dependencies=[Depends(require_admin)])

@router.get("/summary", response_model=dict)
async def get_dashboard_summary(db: AsyncSession = Depends(get_db)):
    """Trả về các số liệu KPI quan trọng cho Admin Dashboard."""
    today = date.today()
    
    # 1. Tổng booking hôm nay (được tạo trong ngày)
    today_start = datetime.combine(today, datetime.min.time())
    today_end = datetime.combine(today, datetime.max.time())
    
    booking_today_query = select(func.count(Booking.id)).where(
        Booking.created_at.between(today_start, today_end)
    )
    booking_today_result = await db.execute(booking_today_query)
    bookings_today_count = booking_today_result.scalar() or 0
    
    # 2. Doanh thu hôm nay (CONFIRMED, CHECKED_IN, CHECKED_OUT có check_in/out/ngày lưu trú giao với hôm nay)
    # PRD: Doanh thu của booking CONFIRMED/CHECKED_IN/CHECKED_OUT trong ngày
    revenue_today_query = select(func.sum(Booking.total_amount)).where(
        and_(
            Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT]),
            # Có thể tính đơn giản là booking tạo trong ngày hôm nay hoặc hoàn thành hôm nay
            Booking.created_at.between(today_start, today_end)
        )
    )
    revenue_today_result = await db.execute(revenue_today_query)
    revenue_today = float(revenue_today_result.scalar() or 0.0)
    
    # 3. Khách đang lưu trú (status = CHECKED_IN)
    guests_in_house_query = select(func.count(Booking.id)).where(
        Booking.status == BookingStatus.CHECKED_IN
    )
    guests_in_house_result = await db.execute(guests_in_house_query)
    guests_in_house = guests_in_house_result.scalar() or 0
    
    # 4. Tỷ lệ lấp đầy phòng (%) = Số phòng CHECKED_IN / Tổng phòng active * 100
    total_active_rooms_query = select(func.count(Room.id)).where(Room.is_active == True)
    total_active_rooms_result = await db.execute(total_active_rooms_query)
    total_rooms = total_active_rooms_result.scalar() or 1 # Tránh chia cho 0

    total_customers_result = await db.execute(
        select(func.count(User.id)).where(User.role == UserRole.CUSTOMER)
    )
    total_customers = total_customers_result.scalar() or 0

    room_status_result = await db.execute(
        select(Room.status, func.count(Room.id))
        .where(Room.is_active == True)
        .group_by(Room.status)
    )
    room_status_counts = {str(status.value if hasattr(status, "value") else status): count for status, count in room_status_result.all()}

    confirmed_bookings_result = await db.execute(
        select(func.count(Booking.id)).where(
            Booking.status.in_([BookingStatus.PENDING, BookingStatus.CONFIRMED])
        )
    )
    reserved_rooms = confirmed_bookings_result.scalar() or 0
    
    occupancy_rate = (guests_in_house / total_rooms) * 100.0
    
    return {
        "bookings_today": bookings_today_count,
        "revenue_today": revenue_today,
        "guests_in_house": guests_in_house,
        "occupancy_rate": round(occupancy_rate, 1),
        "total_rooms": total_rooms,
        "total_customers": total_customers,
        "available_rooms": room_status_counts.get("AVAILABLE", 0),
        "maintenance_rooms": room_status_counts.get("MAINTENANCE", 0),
        "blocked_rooms": room_status_counts.get("BLOCKED", 0),
        "reserved_rooms": reserved_rooms,
    }

@router.get("/checkin-today", response_model=List[BookingResponse])
async def get_checkins_today(db: AsyncSession = Depends(get_db)):
    """Danh sách các đơn đặt phòng cần check-in hôm nay (status = CONFIRMED, check_in_date = today)."""
    today = date.today()
    result = await db.execute(
        select(Booking)
        .where(
            and_(
                Booking.check_in_date == today,
                Booking.status == BookingStatus.CONFIRMED
            )
        )
        .options(
            selectinload(Booking.room).selectinload(Room.room_type),
            selectinload(Booking.booking_services).selectinload(BookingService.service)
        )
    )
    return result.scalars().all()

@router.get("/checkout-today", response_model=List[BookingResponse])
async def get_checkouts_today(db: AsyncSession = Depends(get_db)):
    """Danh sách các đơn đặt phòng cần check-out hôm nay (status = CHECKED_IN, check_out_date = today)."""
    today = date.today()
    result = await db.execute(
        select(Booking)
        .where(
            and_(
                Booking.check_out_date == today,
                Booking.status == BookingStatus.CHECKED_IN
            )
        )
        .options(
            selectinload(Booking.room).selectinload(Room.room_type),
            selectinload(Booking.booking_services).selectinload(BookingService.service)
        )
    )
    return result.scalars().all()
