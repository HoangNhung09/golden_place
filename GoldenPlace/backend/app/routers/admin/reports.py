from datetime import date, datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, cast, Date
from sqlalchemy.orm import selectinload
from typing import List, Dict, Any
from app.database import get_db
from app.models.booking import Booking, BookingStatus, BookingService
from app.models.service import Service
from app.models.room import Room
from app.middleware.auth import require_admin

router = APIRouter(prefix="/reports", tags=["Admin Reports"], dependencies=[Depends(require_admin)])

@router.get("/revenue", response_model=dict)
async def get_revenue_report(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db)
):
    """Báo cáo doanh thu hàng ngày trong vòng X ngày qua."""
    start_date = date.today() - timedelta(days=days)
    
    # Query tổng tiền hàng ngày (dựa trên created_at của booking CONFIRMED/CHECKED_IN/CHECKED_OUT)
    query = (
        select(
            cast(Booking.created_at, Date).label("date"),
            func.sum(Booking.total_amount).label("revenue"),
            func.sum(Booking.room_price_snapshot).label("room_revenue"),
            func.sum(Booking.services_amount).label("service_revenue"),
            func.count(Booking.id).label("booking_count")
        )
        .where(
            and_(
                cast(Booking.created_at, Date) >= start_date,
                Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT])
            )
        )
        .group_by(cast(Booking.created_at, Date))
        .order_by(cast(Booking.created_at, Date).asc())
    )
    
    result = await db.execute(query)
    rows = result.all()
    
    # Format thành danh sách ngày liên tục (bao gồm cả ngày có doanh thu = 0)
    data_dict = {row.date: row for row in rows}
    
    chart_data = []
    total_revenue = 0.0
    total_bookings = 0
    
    for i in range(days + 1):
        curr_date = start_date + timedelta(days=i)
        row = data_dict.get(curr_date)
        
        day_revenue = float(row.revenue) if row else 0.0
        day_room = float(row.room_revenue) if row else 0.0
        day_service = float(row.service_revenue) if row else 0.0
        day_count = int(row.booking_count) if row else 0
        
        total_revenue += day_revenue
        total_bookings += day_count
        
        chart_data.append({
            "date": curr_date.strftime("%Y-%m-%d"),
            "revenue": day_revenue,
            "room_revenue": day_room,
            "service_revenue": day_service,
            "bookings": day_count
        })
        
    return {
        "summary": {
            "total_revenue": total_revenue,
            "total_bookings": total_bookings,
            "avg_revenue_per_booking": total_revenue / total_bookings if total_bookings > 0 else 0.0
        },
        "chart_data": chart_data
    }

@router.get("/occupancy", response_model=dict)
async def get_occupancy_report(
    days: int = Query(30, ge=1, le=90),
    db: AsyncSession = Depends(get_db)
):
    """Báo cáo tỷ lệ công suất phòng hàng ngày (occupancy rate)."""
    start_date = date.today() - timedelta(days=days)
    end_date = date.today()
    
    # Lấy tổng số phòng active
    total_rooms_res = await db.execute(select(func.count(Room.id)).where(Room.is_active == True))
    total_rooms = total_rooms_res.scalar() or 1
    
    # Lấy toàn bộ các booking đang diễn ra (CONFIRMED/CHECKED_IN) giao với thời gian báo cáo
    booking_query = select(Booking.check_in_date, Booking.check_out_date).where(
        and_(
            Booking.check_out_date >= start_date,
            Booking.check_in_date <= end_date,
            Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT])
        )
    )
    booking_result = await db.execute(booking_query)
    bookings = booking_result.all()
    
    # Tính số lượng phòng bận mỗi ngày
    occupancy_data = []
    for i in range(days + 1):
        curr_date = start_date + timedelta(days=i)
        
        # Đếm số phòng bận ngày hôm đó
        busy_count = 0
        for b in bookings:
            # Booking phủ qua ngày curr_date (check_in <= curr_date < check_out)
            if b.check_in_date <= curr_date < b.check_out_date:
                busy_count += 1
                
        rate = (busy_count / total_rooms) * 100.0
        occupancy_data.append({
            "date": curr_date.strftime("%Y-%m-%d"),
            "occupied_rooms": busy_count,
            "total_rooms": total_rooms,
            "occupancy_rate": round(rate, 1)
        })
        
    return {
        "chart_data": occupancy_data
    }

@router.get("/services", response_model=dict)
async def get_services_report(db: AsyncSession = Depends(get_db)):
    """Báo cáo số lượt dùng và doanh thu của từng dịch vụ."""
    # Query thống kê từ booking_services
    query = (
        select(
            Service.name,
            func.sum(BookingService.quantity).label("total_quantity"),
            func.sum(BookingService.subtotal).label("total_revenue")
        )
        .join(BookingService, Service.id == BookingService.service_id)
        .join(Booking, Booking.id == BookingService.booking_id)
        .where(Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT]))
        .group_by(Service.name)
        .order_by(func.sum(BookingService.subtotal).desc())
    )
    
    result = await db.execute(query)
    rows = result.all()
    
    data = []
    total_service_revenue = 0.0
    for r in rows:
        rev = float(r.total_revenue)
        total_service_revenue += rev
        data.append({
            "service_name": r.name,
            "total_quantity": int(r.total_quantity),
            "total_revenue": rev
        })
        
    return {
        "total_revenue": total_service_revenue,
        "services": data
    }
