import string
import random
from datetime import datetime, date, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, not_, exists
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.booking import Booking, BookingStatus, BookingService, BookingStatusLog
from app.models.cart import Cart
from app.models.room import Room, RoomStatus
from app.models.service import Service
from app.models.promotion import Promotion, DiscountType
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingResponse
from app.middleware.auth import get_current_user
from app.utils.email import send_html_email, get_booking_confirmation_email_body, get_cancellation_email_body

router = APIRouter(prefix="/bookings", tags=["Bookings"])

def generate_booking_code() -> str:
    """Sinh mã booking ngẫu nhiên duy nhất dạng HBS-YYYYMMDD-XXXXX."""
    date_str = datetime.utcnow().strftime("%Y%m%d")
    random_str = "".join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"HBS-{date_str}-{random_str}"

@router.post("", response_model=BookingResponse)
async def create_booking(
    booking_in: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Tạo booking từ giỏ hàng của user và gửi email xác nhận."""
    # Lấy giỏ hàng của user
    result = await db.execute(
        select(Cart)
        .where(Cart.user_id == current_user.id)
        .options(
            selectinload(Cart.room).selectinload(Room.room_type),
            selectinload(Cart.promotion)
        )
    )
    cart = result.scalar_one_or_none()
    
    if not cart or not cart.room_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Giỏ hàng của bạn đang trống"
        )
        
    check_in = cart.check_in_date
    check_out = cart.check_out_date
    
    # BẮT ĐẦU TRANSACTIONS để kiểm tra phòng trống (tránh booking trùng lặp)
    # Check overlapping bookings
    overlap_query = select(Booking).where(
        and_(
            Booking.room_id == cart.room_id,
            Booking.check_out_date > check_in,
            Booking.check_in_date < check_out,
            Booking.status.in_([BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN])
        )
    )
    overlap_result = await db.execute(overlap_query)
    if overlap_result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phòng đã bị đặt bởi người khác trong khoảng thời gian này. Vui lòng chọn phòng khác."
        )
        
    # Tính số đêm lưu trú
    nights = (check_out - check_in).days
    
    # Tính tiền phòng cơ bản (snapshot)
    # Weekend price logic: check if check-in or days are weekends (Fri/Sat nights)
    room_price = float(cart.room.base_price)
    # Đơn giản hóa: tính theo base_price
    # Nếu weekend_price có và ngày là T6/T7 thì có thể nhân thêm. Để đơn giản ta dùng base_price làm snapshot.
    room_total = room_price * nights
    
    # Tính giảm giá
    discount = 0.0
    if cart.promotion:
        promo = cart.promotion
        if promo.discount_type == DiscountType.PERCENT:
            discount = (room_total * float(promo.discount_value)) / 100.0
        else:
            discount = float(promo.discount_value)
        # Giới hạn discount ko vượt quá tiền phòng
        discount = min(discount, room_total)
        # Tăng count của promotion
        promo.used_count += 1
        
    # Tính tiền dịch vụ
    services_total = 0.0
    booking_services_to_add = []
    
    for s_in in booking_in.services:
        # Lấy thông tin dịch vụ
        s_result = await db.execute(select(Service).where(Service.id == s_in.service_id, Service.is_active == True))
        service = s_result.scalar_one_or_none()
        if not service:
            raise HTTPException(status_code=400, detail=f"Không tìm thấy dịch vụ {s_in.service_id}")
            
        unit_price = float(service.price)
        subtotal = unit_price * s_in.quantity
        services_total += subtotal
        
        booking_services_to_add.append(
            BookingService(
                service_id=service.id,
                quantity=s_in.quantity,
                unit_price=unit_price,
                subtotal=subtotal
            )
        )
        
    total_amount = room_total - discount + services_total
    
    # Tạo booking
    booking_code = generate_booking_code()
    new_booking = Booking(
        booking_code=booking_code,
        user_id=current_user.id,
        room_id=cart.room_id,
        promotion_id=cart.promotion_id,
        check_in_date=check_in,
        check_out_date=check_out,
        adults=cart.adults,
        children=cart.children,
        status=BookingStatus.PENDING,
        room_price_snapshot=room_price,
        discount_amount=discount,
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
    await db.flush() # Lấy new_booking.id
    
    # Gán quan hệ booking_services
    for bs in booking_services_to_add:
        bs.booking_id = new_booking.id
        db.add(bs)
        
    # Tạo log trạng thái đầu tiên
    status_log = BookingStatusLog(
        booking_id=new_booking.id,
        changed_by=current_user.id,
        old_status=None,
        new_status=BookingStatus.PENDING.value,
        note="Khách đặt phòng trực tuyến"
    )
    db.add(status_log)
    
    # Xóa giỏ hàng
    cart.room_id = None
    cart.promotion_id = None
    cart.check_in_date = None
    cart.check_out_date = None
    cart.expires_at = None
    cart.is_expired = False
    
    await db.commit()
    
    # Eager load data for returning
    result = await db.execute(
        select(Booking)
        .where(Booking.id == new_booking.id)
        .options(
            selectinload(Booking.room).selectinload(Room.room_type),
            selectinload(Booking.promotion),
            selectinload(Booking.booking_services).selectinload(BookingService.service),
            selectinload(Booking.status_logs)
        )
    )
    booking_ret = result.scalar_one()
    
    # Gửi email thông báo đặt phòng thành công
    email_data = {
        "booking_code": booking_ret.booking_code,
        "guest_name": booking_ret.guest_name,
        "room_number": booking_ret.room.room_number,
        "room_type": booking_ret.room.room_type.name,
        "check_in_date": booking_ret.check_in_date.strftime("%d/%m/%Y"),
        "check_out_date": booking_ret.check_out_date.strftime("%d/%m/%Y"),
        "adults": booking_ret.adults,
        "children": booking_ret.children,
        "total_amount": float(booking_ret.total_amount),
        "services": [{"name": bs.service.name, "quantity": bs.quantity, "subtotal": float(bs.subtotal)} for bs in booking_ret.booking_services]
    }
    await send_html_email(
        subject=f"Xác nhận đặt phòng thành công #{booking_ret.booking_code} - GoldenPlace Hotel",
        recipient=booking_ret.guest_email,
        body=get_booking_confirmation_email_body(email_data)
    )
    
    return booking_ret

@router.get("/me", response_model=List[BookingResponse])
async def get_my_bookings(
    status: Optional[BookingStatus] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Lấy danh sách các booking của tôi."""
    query = select(Booking).where(Booking.user_id == current_user.id)
    if status:
        query = query.where(Booking.status == status)
    query = query.order_by(Booking.created_at.desc()).options(
        selectinload(Booking.room).selectinload(Room.room_type),
        selectinload(Booking.promotion),
        selectinload(Booking.booking_services).selectinload(BookingService.service),
        selectinload(Booking.status_logs)
    )
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{booking_code}", response_model=BookingResponse)
async def get_booking_by_code(
    booking_code: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Lấy chi tiết booking theo code."""
    query = select(Booking).where(Booking.booking_code == booking_code)
    # Khách hàng chỉ được xem booking của chính họ, ngoại trừ Admin
    if current_user.role != "admin":
        query = query.where(Booking.user_id == current_user.id)
        
    query = query.options(
        selectinload(Booking.room).selectinload(Room.room_type),
        selectinload(Booking.promotion),
        selectinload(Booking.booking_services).selectinload(BookingService.service),
        selectinload(Booking.status_logs)
    )
    result = await db.execute(query)
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy đặt phòng này"
        )
    return booking

@router.patch("/{booking_code}/cancel", response_model=BookingResponse)
async def cancel_booking(
    booking_code: str,
    reason: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Khách hàng tự hủy booking (chỉ cho phép khi trạng thái là PENDING/CONFIRMED)."""
    result = await db.execute(
        select(Booking)
        .where(Booking.booking_code == booking_code)
        .options(selectinload(Booking.room).selectinload(Room.room_type))
    )
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Không tìm thấy đặt phòng")
        
    if current_user.role != "admin" and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bạn không có quyền thực hiện hành động này")
        
    if booking.status not in [BookingStatus.PENDING, BookingStatus.CONFIRMED]:
        raise HTTPException(
            status_code=400,
            detail=f"Không thể hủy phòng khi ở trạng thái {booking.status.value}"
        )
        
    # Kiểm tra thời gian hủy: tối thiểu trước check-in 24 tiếng đối với CONFIRMED
    # (Nếu ở PENDING thì cho hủy thoải mái)
    if booking.status == BookingStatus.CONFIRMED:
        checkin_datetime = datetime.combine(booking.check_in_date, datetime.min.time())
        if datetime.utcnow() + timedelta(hours=24) > checkin_datetime:
            raise HTTPException(
                status_code=400,
                detail="Chỉ có thể hủy phòng trước ngày check-in tối thiểu 24 giờ"
            )
            
    old_status = booking.status.value
    booking.status = BookingStatus.CANCELLED
    booking.cancellation_reason = reason
    
    # Tạo status log
    log = BookingStatusLog(
        booking_id=booking.id,
        changed_by=current_user.id,
        old_status=old_status,
        new_status=BookingStatus.CANCELLED.value,
        note=f"Hủy đặt phòng. Lý do: {reason}"
    )
    db.add(log)
    await db.commit()
    
    # Reload relation for email
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
    booking_ret = result.scalar_one()
    
    # Gửi email hủy phòng
    email_data = {
        "booking_code": booking_ret.booking_code,
        "guest_name": booking_ret.guest_name,
        "room_number": booking_ret.room.room_number,
        "room_type": booking_ret.room.room_type.name,
        "check_in_date": booking_ret.check_in_date.strftime("%d/%m/%Y"),
        "cancellation_reason": reason
    }
    await send_html_email(
        subject=f"Xác nhận hủy phòng thành công #{booking_ret.booking_code} - GoldenPlace Hotel",
        recipient=booking_ret.guest_email,
        body=get_cancellation_email_body(email_data)
    )
    
    return booking_ret
