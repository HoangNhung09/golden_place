from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, or_
from sqlalchemy.orm import selectinload
from typing import List, Optional
import json
from app.database import get_db
from app.models.room import Room, RoomType, RoomStatus
from app.models.booking import Booking, BookingStatus
from app.schemas.room import RoomResponse, RoomCreate, RoomUpdate, RoomTypeResponse, RoomTypeCreate
from app.middleware.auth import require_admin
from app.utils.cloudinary_helper import upload_image, delete_image

router = APIRouter(prefix="", tags=["Admin Rooms"], dependencies=[Depends(require_admin)])

@router.get("/rooms", response_model=List[RoomResponse])
async def admin_get_rooms(db: AsyncSession = Depends(get_db)):
    """Xem danh sách tất cả các phòng (bao gồm cả phòng đang bảo trì/khóa)."""
    result = await db.execute(
        select(Room)
        .where(Room.is_active == True)
        .options(selectinload(Room.room_type))
        .order_by(Room.room_number.asc())
    )
    return result.scalars().all()

@router.post("/rooms", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
async def admin_create_room(
    room_in: RoomCreate,
    db: AsyncSession = Depends(get_db)
):
    """Tạo phòng mới. Yêu cầu có ít nhất 1 ảnh."""
    if not room_in.images or len(room_in.images) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cần cung cấp ít nhất 1 hình ảnh khi tạo phòng"
        )
        
    # Check duplicate room number
    dup_result = await db.execute(select(Room).where(Room.room_number == room_in.room_number, Room.is_active == True))
    if dup_result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Số phòng {room_in.room_number} đã tồn tại"
        )
        
    new_room = Room(
        room_number=room_in.room_number,
        room_type_id=room_in.room_type_id,
        floor=room_in.floor,
        max_adults=room_in.max_adults,
        max_children=room_in.max_children,
        area_sqm=room_in.area_sqm,
        base_price=room_in.base_price,
        weekend_price=room_in.weekend_price or room_in.base_price,
        description=room_in.description,
        images=room_in.images,
        status=room_in.status
    )
    db.add(new_room)
    await db.commit()
    
    # Reload relation
    result = await db.execute(
        select(Room).where(Room.id == new_room.id).options(selectinload(Room.room_type))
    )
    return result.scalar_one()

@router.get("/rooms/{id}", response_model=RoomResponse)
async def admin_get_room_detail(id: str, db: AsyncSession = Depends(get_db)):
    """Xem chi tiết một phòng."""
    result = await db.execute(
        select(Room).where(Room.id == id, Room.is_active == True).options(selectinload(Room.room_type))
    )
    room = result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Không tìm thấy phòng")
    return room

@router.put("/rooms/{id}", response_model=RoomResponse)
async def admin_update_room(
    id: str,
    room_in: RoomUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Cập nhật thông tin phòng."""
    result = await db.execute(select(Room).where(Room.id == id, Room.is_active == True))
    room = result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Không tìm thấy phòng")
        
    # Check duplicate room number if changed
    if room_in.room_number and room_in.room_number != room.room_number:
        dup_result = await db.execute(select(Room).where(Room.room_number == room_in.room_number, Room.is_active == True))
        if dup_result.scalars().first():
            raise HTTPException(status_code=400, detail=f"Số phòng {room_in.room_number} đã tồn tại")
            
    # Update fields
    update_data = room_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(room, field, value)
        
    await db.commit()
    
    # Reload
    result = await db.execute(
        select(Room).where(Room.id == room.id).options(selectinload(Room.room_type))
    )
    return result.scalar_one()

@router.patch("/rooms/{id}/status", response_model=RoomResponse)
async def admin_update_room_status(
    id: str,
    status_in: RoomStatus,
    db: AsyncSession = Depends(get_db)
):
    """Cập nhật trạng thái bảo trì/sử dụng của phòng."""
    result = await db.execute(select(Room).where(Room.id == id, Room.is_active == True))
    room = result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Không tìm thấy phòng")
        
    room.status = status_in
    await db.commit()
    
    result = await db.execute(
        select(Room).where(Room.id == room.id).options(selectinload(Room.room_type))
    )
    return result.scalar_one()

@router.delete("/rooms/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_room(id: str, db: AsyncSession = Depends(get_db)):
    """Xóa phòng (Soft Delete). Không cho phép xóa nếu phòng đang có booking chưa hoàn thành."""
    result = await db.execute(select(Room).where(Room.id == id, Room.is_active == True))
    room = result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Không tìm thấy phòng")
        
    # Check active bookings
    active_bookings_query = select(Booking).where(
        and_(
            Booking.room_id == id,
            Booking.status.in_([BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN])
        )
    )
    active_result = await db.execute(active_bookings_query)
    if active_result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể xóa phòng do phòng này đang có lịch đặt phòng chưa hoàn thành"
        )
        
    room.is_active = False
    await db.commit()
    return None

@router.post("/rooms/upload-image", response_model=dict)
async def admin_upload_room_image(file: UploadFile = File(...)):
    """Upload ảnh phòng lên Cloudinary / Local storage."""
    url = await upload_image(file, folder="rooms")
    return {"url": url}

# ROOM TYPES CRUD
@router.get("/room-types", response_model=List[RoomTypeResponse])
async def admin_get_room_types(db: AsyncSession = Depends(get_db)):
    """Xem danh sách toàn bộ loại phòng."""
    result = await db.execute(select(RoomType).order_by(RoomType.name.asc()))
    return result.scalars().all()

@router.post("/room-types", response_model=RoomTypeResponse, status_code=201)
async def admin_create_room_type(type_in: RoomTypeCreate, db: AsyncSession = Depends(get_db)):
    """Tạo loại phòng mới."""
    dup_result = await db.execute(select(RoomType).where(RoomType.name == type_in.name))
    if dup_result.scalars().first():
        raise HTTPException(status_code=400, detail="Tên loại phòng đã tồn tại")
        
    new_type = RoomType(
        name=type_in.name,
        description=type_in.description,
        amenities=type_in.amenities
    )
    db.add(new_type)
    await db.commit()
    return new_type

@router.put("/room-types/{id}", response_model=RoomTypeResponse)
async def admin_update_room_type(id: str, type_in: RoomTypeCreate, db: AsyncSession = Depends(get_db)):
    """Cập nhật loại phòng."""
    result = await db.execute(select(RoomType).where(RoomType.id == id))
    room_type = result.scalar_one_or_none()
    if not room_type:
        raise HTTPException(status_code=404, detail="Không tìm thấy loại phòng")
        
    if type_in.name != room_type.name:
        dup = await db.execute(select(RoomType).where(RoomType.name == type_in.name))
        if dup.scalars().first():
            raise HTTPException(status_code=400, detail="Tên loại phòng đã tồn tại")
            
    room_type.name = type_in.name
    room_type.description = type_in.description
    room_type.amenities = type_in.amenities
    
    await db.commit()
    return room_type

@router.delete("/room-types/{id}", status_code=204)
async def admin_delete_room_type(id: str, db: AsyncSession = Depends(get_db)):
    """Xóa loại phòng. Không cho phép xóa nếu có phòng đang thuộc loại này."""
    # Check if any room is using this type
    result = await db.execute(select(Room).where(Room.room_type_id == id, Room.is_active == True))
    if result.scalars().first():
        raise HTTPException(
            status_code=400,
            detail="Không thể xóa loại phòng do đang có phòng thuộc loại này"
        )
        
    result_type = await db.execute(select(RoomType).where(RoomType.id == id))
    room_type = result_type.scalar_one_or_none()
    if not room_type:
        raise HTTPException(status_code=404, detail="Không tìm thấy loại phòng")
        
    await db.delete(room_type)
    await db.commit()
    return None
