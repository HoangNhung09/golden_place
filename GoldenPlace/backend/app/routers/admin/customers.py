from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
from app.database import get_db
from app.models.user import User, UserRole
from app.models.booking import Booking
from app.schemas.user import UserResponse, UserCreate, UserUpdate
from app.middleware.auth import require_admin
from app.utils.security import get_password_hash

router = APIRouter(prefix="/customers", tags=["Admin Customers"], dependencies=[Depends(require_admin)])

@router.get("", response_model=dict)
async def admin_get_customers(
    search: Optional[str] = Query(None, description="Tìm theo tên, email hoặc số điện thoại"),
    page: int = Query(1, ge=1),
    limit: int = Query(15, ge=1),
    db: AsyncSession = Depends(get_db)
):
    """Xem danh sách toàn bộ khách hàng, hỗ trợ tìm kiếm và phân trang."""
    query = select(User).where(User.role == UserRole.CUSTOMER)
    
    if search:
        query = query.where(
            or_(
                User.full_name.icontains(search),
                User.email.icontains(search),
                User.phone.icontains(search)
            )
        )
        
    query = query.order_by(User.created_at.desc())
    
    # Count total
    total_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = total_result.scalar() or 0
    
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)
    
    result = await db.execute(query)
    customers = result.scalars().all()
    
    return {
        "customers": [UserResponse.model_validate(customer) for customer in customers],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def admin_create_customer(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """Tạo tài khoản khách hàng từ trang Admin."""
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalar_one_or_none():
      raise HTTPException(status_code=400, detail="Email đã tồn tại trên hệ thống")

    customer = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        phone=user_in.phone,
        avatar_url=user_in.avatar_url,
        date_of_birth=user_in.date_of_birth,
        gender=user_in.gender,
        address=user_in.address,
        nationality=user_in.nationality,
        id_number=user_in.id_number,
        role=UserRole.CUSTOMER,
        is_active=True,
        is_email_verified=True,
    )
    db.add(customer)
    await db.commit()
    return customer

@router.get("/{id}", response_model=dict)
async def admin_get_customer_detail(id: str, db: AsyncSession = Depends(get_db)):
    """Xem chi tiết khách hàng và lịch sử đơn đặt phòng của họ."""
    result = await db.execute(select(User).where(User.id == id, User.role == UserRole.CUSTOMER))
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Không tìm thấy khách hàng")
        
    # Lấy lịch sử booking
    booking_result = await db.execute(
        select(Booking)
        .where(Booking.user_id == id)
        .order_by(Booking.created_at.desc())
        .options(selectinload(Booking.room))
    )
    bookings = booking_result.scalars().all()
    
    return {
        "customer": UserResponse.model_validate(customer),
        "internal_note": customer.internal_note,
        "bookings": bookings
    }

@router.put("/{id}", response_model=UserResponse)
async def admin_update_customer(id: str, user_in: UserUpdate, db: AsyncSession = Depends(get_db)):
    """Cập nhật thông tin khách hàng từ trang Admin."""
    result = await db.execute(select(User).where(User.id == id, User.role == UserRole.CUSTOMER))
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Không tìm thấy khách hàng")

    update_data = user_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(customer, field, value)

    await db.commit()
    return customer

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_customer(id: str, db: AsyncSession = Depends(get_db)):
    """Khóa tài khoản khách hàng thay cho xóa cứng."""
    result = await db.execute(select(User).where(User.id == id, User.role == UserRole.CUSTOMER))
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Không tìm thấy khách hàng")

    customer.is_active = False
    await db.commit()
    return None

@router.patch("/{id}/toggle-active", response_model=UserResponse)
async def admin_toggle_customer_status(id: str, db: AsyncSession = Depends(get_db)):
    """Khóa hoặc kích hoạt lại tài khoản khách hàng."""
    result = await db.execute(select(User).where(User.id == id, User.role == UserRole.CUSTOMER))
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Không tìm thấy khách hàng")
        
    customer.is_active = not customer.is_active
    await db.commit()
    return customer

@router.patch("/{id}/note", response_model=UserResponse)
async def admin_update_customer_note(id: str, note: str, db: AsyncSession = Depends(get_db)):
    """Cập nhật ghi chú nội bộ của khách hàng (chỉ Admin xem được)."""
    result = await db.execute(select(User).where(User.id == id, User.role == UserRole.CUSTOMER))
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Không tìm thấy khách hàng")
        
    customer.internal_note = note
    await db.commit()
    return customer
