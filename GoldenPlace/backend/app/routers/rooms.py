from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, not_, exists, or_, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models.room import Room, RoomType, RoomStatus
from app.models.service import Service
from app.models.booking import Booking, BookingStatus
from app.models.review import Review, ReviewStatus
from app.schemas.room import RoomResponse, RoomTypeResponse, RoomListResponse
from app.schemas.service import ServiceResponse
from app.schemas.review import ReviewResponse

router = APIRouter(prefix="", tags=["Rooms"])

@router.get("/rooms", response_model=RoomListResponse)
async def get_rooms(
    room_type_id: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    amenities: Optional[List[str]] = Query(None),
    check_in: Optional[date] = Query(None),
    check_out: Optional[date] = Query(None),
    adults: Optional[int] = Query(None, ge=1),
    children: Optional[int] = Query(None, ge=0),
    sort_by: Optional[str] = Query(None, description="price_asc, price_desc, rating_desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1),
    db: AsyncSession = Depends(get_db)
):
    """Lấy danh sách phòng với các bộ lọc và phân trang."""
    query = select(Room).where(Room.is_active == True, Room.status == RoomStatus.AVAILABLE).options(selectinload(Room.room_type))
    
    # Lọc theo Room Type
    if room_type_id:
        query = query.where(Room.room_type_id == room_type_id)
        
    # Lọc theo Giá
    if min_price is not None:
        query = query.where(Room.base_price >= min_price)
    if max_price is not None:
        query = query.where(Room.base_price <= max_price)
        
    # Lọc theo Tiện nghi
    if amenities:
        # Lọc các phòng thuộc RoomType chứa tất cả amenities được truyền
        for amenity in amenities:
            query = query.join(RoomType).where(RoomType.amenities.contains(amenity))
            
    # Lọc theo ngày và sức chứa
    if check_in is not None or check_out is not None:
        if check_in is None or check_out is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cần cung cấp cả ngày check-in và check-out để tìm phòng theo ngày"
            )
        if check_in >= check_out:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ngày check-in phải nhỏ hơn ngày check-out"
            )
        if adults is not None:
            query = query.where(Room.max_adults >= adults)
        if children is not None:
            query = query.where(Room.max_children >= children)

        busy_rooms_subquery = select(Booking.room_id).where(
            and_(
                Booking.check_out_date > check_in,
                Booking.check_in_date < check_out,
                Booking.status.in_([BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN])
            )
        )
        query = query.where(not_(Room.id.in_(busy_rooms_subquery)))
    else:
        if adults is not None:
            query = query.where(Room.max_adults >= adults)
        if children is not None:
            query = query.where(Room.max_children >= children)

    # Sắp xếp
    if sort_by == "price_asc":
        query = query.order_by(Room.base_price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Room.base_price.desc())
    # Sắp xếp theo rating sẽ cần join với review, ta có thể bổ sung hoặc để client sort.
    # Trong DB, ta chỉ sort đơn giản
    else:
        query = query.order_by(Room.room_number.asc())
        
    # Tính tổng số bản ghi
    total_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = total_result.scalar() or 0
    
    # Phân trang
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)
    
    result = await db.execute(query)
    rooms = result.scalars().all()
    
    return {
        "rooms": rooms,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }

@router.get("/rooms/search", response_model=List[RoomResponse])
async def search_available_rooms(
    check_in: date = Query(...),
    check_out: date = Query(...),
    adults: int = Query(1, ge=1),
    children: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """Tìm phòng trống theo khoảng ngày và số lượng khách."""
    if check_in >= check_out:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ngày check-in phải nhỏ hơn ngày check-out"
        )
        
    # Query các phòng bị bận trong thời gian này
    busy_rooms_subquery = select(Booking.room_id).where(
        and_(
            Booking.check_out_date > check_in,
            Booking.check_in_date < check_out,
            Booking.status.in_([BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN])
        )
    )
    
    # Tìm phòng AVAILABLE, is_active, thỏa mãn sức chứa và không nằm trong danh sách phòng bận
    query = select(Room).where(
        and_(
            Room.is_active == True,
            Room.status == RoomStatus.AVAILABLE,
            Room.max_adults >= adults,
            Room.max_children >= children,
            not_(Room.id.in_(busy_rooms_subquery))
        )
    ).options(selectinload(Room.room_type))
    
    result = await db.execute(query)
    rooms = result.scalars().all()
    
    return rooms

@router.get("/rooms/{id}", response_model=RoomResponse)
async def get_room(id: str, db: AsyncSession = Depends(get_db)):
    """Lấy chi tiết phòng."""
    result = await db.execute(
        select(Room)
        .where(Room.id == id, Room.is_active == True)
        .options(selectinload(Room.room_type))
    )
    room = result.scalar_one_or_none()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy thông tin phòng"
        )
    return room

@router.get("/room-types", response_model=List[RoomTypeResponse])
async def get_room_types(db: AsyncSession = Depends(get_db)):
    """Lấy danh sách các loại phòng."""
    result = await db.execute(select(RoomType).order_by(RoomType.name.asc()))
    return result.scalars().all()

@router.get("/services", response_model=List[ServiceResponse])
async def get_public_services(db: AsyncSession = Depends(get_db)):
    """Lấy danh sách dịch vụ khách sạn đang hoạt động (public)."""
    result = await db.execute(select(Service).where(Service.is_active == True).order_by(Service.price.asc()))
    return result.scalars().all()
