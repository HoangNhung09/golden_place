from datetime import date, datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
import string
import random
from app.database import get_db
from app.models.booking import Booking, BookingStatus, BookingService, BookingStatusLog
from app.models.room import Room, RoomStatus
from app.models.service import Service
from app.models.promotion import Promotion, DiscountType
from app.models.user import User
from app.schemas.booking import (
    BookingResponse,
    BookingStatusUpdate,
    BookingCalendarResponse,
    BookingCreate
)
from app.middleware.auth import require_admin
from app.utils.email import send_html_email, get_booking_confirmation_email_body, get_review_invitation_email_body

router = APIRouter(prefix="/bookings", tags=["Admin Bookings"], dependencies=[Depends(require_admin)])

def generate_booking_code() -> str:
    date_str = datetime.utcnow().strftime("%Y%m%d")
    random_str = "".join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"HBS-{date_str}-{random_str}"

def serialize_booking(booking: Booking) -> dict:
    return BookingResponse.model_validate(booking).model_dump(mode="json")

@router.get("", response_model=dict)
async def admin_get_bookings(
    status: Optional[BookingStatus] = Query(None),
    guest_name: Optional[str] = Query(None),
    booking_code: Optional[str] = Query(None),
    check_in_start: Optional[date] = Query(None),
    check_in_end: Optional[date] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(15, ge=1),
    db: AsyncSession = Depends(get_db)
):
    """Danh sách các đơn đặt phòng kèm bộ lọc và phân trang."""
    query = select(Booking).options(
        selectinload(Booking.room).selectinload(Room.room_type),
        selectinload(Booking.promotion),
        selectinload(Booking.booking_services).selectinload(BookingService.service),
        selectinload(Booking.status_logs).selectinload(BookingStatusLog.user)
    )
    
    if status:
        query = query.where(Booking.status == status)
    if guest_name:
        query = query.where(Booking.guest_name.icontains(guest_name))
    if booking_code:
        query = query.where(Booking.booking_code.icontains(booking_code))
    if check_in_start:
        query = query.where(Booking.check_in_date >= check_in_start)
    if check_in_end:
        query = query.where(Booking.check_in_date <= check_in_end)
        
    query = query.order_by(Booking.created_at.desc())
    
    # Count total
    total_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = total_result.scalar() or 0
    
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)
    
    result = await db.execute(query)
    bookings = result.scalars().all()
    
    items = [serialize_booking(booking) for booking in bookings]

    return {
        "items": items,
        "bookings": items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }

@router.get("/history", response_model=dict)
async def admin_get_booking_history(
    guest_name: Optional[str] = Query(None),
    booking_code: Optional[str] = Query(None),
    check_in_start: Optional[date] = Query(None),
    check_in_end: Optional[date] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1),
    db: AsyncSession = Depends(get_db)
):
    """Lich su luu tru duoc lay tu cac don da ket thuc hoac khong con hieu luc."""
    history_statuses = [
        BookingStatus.CHECKED_OUT,
        BookingStatus.CANCELLED,
        BookingStatus.NO_SHOW,
    ]

    query = (
        select(Booking)
        .where(Booking.status.in_(history_statuses))
        .options(
            selectinload(Booking.room).selectinload(Room.room_type),
            selectinload(Booking.promotion),
            selectinload(Booking.booking_services).selectinload(BookingService.service),
            selectinload(Booking.status_logs).selectinload(BookingStatusLog.user)
        )
    )

    if guest_name:
        query = query.where(Booking.guest_name.icontains(guest_name))
    if booking_code:
        query = query.where(Booking.booking_code.icontains(booking_code))
    if check_in_start:
        query = query.where(Booking.check_in_date >= check_in_start)
    if check_in_end:
        query = query.where(Booking.check_in_date <= check_in_end)

    query = query.order_by(Booking.check_out_date.desc(), Booking.updated_at.desc())

    total_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = total_result.scalar() or 0

    offset = (page - 1) * limit
    result = await db.execute(query.offset(offset).limit(limit))
    bookings = result.scalars().all()

    completed_total = sum(1 for booking in bookings if booking.status == BookingStatus.CHECKED_OUT)
    revenue_total = sum(float(booking.total_amount or 0) for booking in bookings if booking.status == BookingStatus.CHECKED_OUT)
    inactive_total = sum(1 for booking in bookings if booking.status in [BookingStatus.CANCELLED, BookingStatus.NO_SHOW])

    items = [serialize_booking(booking) for booking in bookings]

    return {
        "items": items,
        "bookings": items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit,
        "summary": {
            "completed": completed_total,
            "revenue": revenue_total,
            "inactive": inactive_total,
        },
    }

@router.get("/calendar", response_model=List[BookingCalendarResponse])
async def admin_get_calendar_data(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """Lấy dữ liệu đặt phòng dạng Gantt chart / Lịch tuần/tháng (phục vụ giao diện Admin)."""
    # Lấy các booking giao với khoảng thời gian [start_date, end_date]
    query = select(Booking).where(
        and_(
            Booking.check_out_date >= start_date,
            Booking.check_in_date <= end_date,
            Booking.status != BookingStatus.CANCELLED
        )
    ).options(selectinload(Booking.room))
    
    result = await db.execute(query)
    bookings = result.scalars().all()
    
    calendar_data = []
    for b in bookings:
        calendar_data.append(
            BookingCalendarResponse(
                id=b.id,
                booking_code=b.booking_code,
                guest_name=b.guest_name,
                room_number=b.room.room_number,
                check_in_date=b.check_in_date,
                check_out_date=b.check_out_date,
                status=b.status
            )
        )
    return calendar_data

@router.get("/{id}", response_model=BookingResponse)
async def admin_get_booking(id: str, db: AsyncSession = Depends(get_db)):
    """Xem chi tiết đơn đặt phòng."""
    result = await db.execute(
        select(Booking)
        .where(Booking.id == id)
        .options(
            selectinload(Booking.room).selectinload(Room.room_type),
            selectinload(Booking.promotion),
            selectinload(Booking.booking_services).selectinload(BookingService.service),
            selectinload(Booking.status_logs).selectinload(BookingStatusLog.user)
        )
    )
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn đặt phòng")
    return booking

@router.post("", response_model=BookingResponse)
async def admin_create_booking_manual(
    user_id: str,
    room_id: str,
    check_in_date: date,
    check_out_date: date,
    adults: int,
    children: int,
    booking_in: BookingCreate,
    discount_amount: float = 0.0,
    db: AsyncSession = Depends(get_db)
):
    """Admin tạo đơn đặt phòng thủ công tại quầy (hoặc qua điện thoại)."""
    # Check overlap
    overlap_query = select(Booking).where(
        and_(
            Booking.room_id == room_id,
            Booking.check_out_date > check_in_date,
            Booking.check_in_date < check_out_date,
            Booking.status.in_([BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN])
        )
    )
    overlap_res = await db.execute(overlap_query)
    if overlap_res.scalars().first():
        raise HTTPException(status_code=400, detail="Phòng đã có lịch đặt trong thời gian này")
        
    result_room = await db.execute(select(Room).where(Room.id == room_id).options(selectinload(Room.room_type)))
    room = result_room.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Không tìm thấy phòng")
        
    # Tính toán tiền phòng
    nights = (check_out_date - check_in_date).days
    room_total = float(room.base_price) * nights
    
    # Tính tiền dịch vụ
    services_total = 0.0
    booking_services_to_add = []
    
    for s_in in booking_in.services:
        s_res = await db.execute(select(Service).where(Service.id == s_in.service_id))
        service = s_res.scalar_one_or_none()
        if not service:
            raise HTTPException(status_code=400, detail=f"Không thấy dịch vụ {s_in.service_id}")
        price = float(service.price)
        subtotal = price * s_in.quantity
        services_total += subtotal
        booking_services_to_add.append(
            BookingService(
                service_id=service.id,
                quantity=s_in.quantity,
                unit_price=price,
                subtotal=subtotal
            )
        )
        
    total_amount = room_total - discount_amount + services_total
    
    new_booking = Booking(
        booking_code=generate_booking_code(),
        user_id=user_id,
        room_id=room_id,
        check_in_date=check_in_date,
        check_out_date=check_out_date,
        adults=adults,
        children=children,
        status=BookingStatus.CONFIRMED, # Mặc định admin tạo là CONFIRMED
        room_price_snapshot=float(room.base_price),
        discount_amount=discount_amount,
        services_amount=services_total,
        total_amount=total_amount,
        payment_method=booking_in.payment_method,
        payment_status="UNPAID",
        invoice_requested=booking_in.invoice_requested,
        invoice_company_name=booking_in.invoice_company_name,
        invoice_tax_code=booking_in.invoice_tax_code,
        invoice_company_address=booking_in.invoice_company_address,
        guest_name=booking_in.guest_name,
        guest_email=booking_in.guest_email,
        guest_phone=booking_in.guest_phone,
        guest_nationality=booking_in.guest_nationality,
        guest_id_number=booking_in.guest_id_number,
        special_requests=booking_in.special_requests,
        expected_checkin_time=booking_in.expected_checkin_time
    )
    db.add(new_booking)
    await db.flush()
    
    for bs in booking_services_to_add:
        bs.booking_id = new_booking.id
        db.add(bs)
        
    # Tạo log
    log = BookingStatusLog(
        booking_id=new_booking.id,
        changed_by=None, # System/Admin
        old_status=None,
        new_status=BookingStatus.CONFIRMED.value,
        note="Admin tạo đơn đặt phòng trực tiếp tại quầy"
    )
    db.add(log)
    await db.commit()
    
    # Reload & return
    result = await db.execute(
        select(Booking)
        .where(Booking.id == new_booking.id)
        .options(
            selectinload(Booking.room).selectinload(Room.room_type),
            selectinload(Booking.booking_services).selectinload(BookingService.service),
            selectinload(Booking.status_logs)
        )
    )
    return result.scalar_one()

@router.patch("/{id}/status", response_model=BookingResponse)
async def admin_update_booking_status(
    id: str,
    status_in: BookingStatusUpdate,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """Cập nhật trạng thái Booking (PENDING -> CONFIRMED -> CHECKED_IN -> CHECKED_OUT)."""
    result = await db.execute(
        select(Booking)
        .where(Booking.id == id)
        .options(selectinload(Booking.room).selectinload(Room.room_type))
    )
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn đặt phòng")
        
    old_status = booking.status.value
    new_status = status_in.status
    
    if old_status == new_status:
        return booking
        
    # Cập nhật trạng thái
    booking.status = new_status
    
    # Tạo status log
    log = BookingStatusLog(
        booking_id=booking.id,
        changed_by=admin_user.id,
        old_status=old_status,
        new_status=new_status.value,
        note=status_in.note or f"Admin thay đổi trạng thái thành {new_status.value}"
    )
    db.add(log)
    await db.commit()
    
    # Gửi email mời đánh giá sau khi Check-out thành công
    if new_status == BookingStatus.CHECKED_OUT:
        email_data = {
            "booking_code": booking.booking_code,
            "guest_name": booking.guest_name,
            "room_number": booking.room.room_number,
            "guest_email": booking.guest_email
        }
        await send_html_email(
            subject=f"Cảm ơn quý khách đã lưu trú tại GoldenPlace Hotel #{booking.booking_code}",
            recipient=booking.guest_email,
            body=get_review_invitation_email_body(email_data)
        )
        
    # Reload relation to return
    result = await db.execute(
        select(Booking)
        .where(Booking.id == booking.id)
        .options(
            selectinload(Booking.room).selectinload(Room.room_type),
            selectinload(Booking.promotion),
            selectinload(Booking.booking_services).selectinload(BookingService.service),
            selectinload(Booking.status_logs)
        )
    )
    return result.scalar_one()
