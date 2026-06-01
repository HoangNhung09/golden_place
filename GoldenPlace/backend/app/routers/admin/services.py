from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.database import get_db
from app.models.service import Service
from app.schemas.service import ServiceResponse, ServiceCreate, ServiceUpdate
from app.middleware.auth import require_admin

router = APIRouter(prefix="/services", tags=["Admin Services"], dependencies=[Depends(require_admin)])

@router.get("", response_model=List[ServiceResponse])
async def admin_get_services(db: AsyncSession = Depends(get_db)):
    """Lấy danh sách tất cả các dịch vụ khách sạn."""
    result = await db.execute(select(Service).order_by(Service.created_at.desc()))
    return result.scalars().all()

@router.post("", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
async def admin_create_service(service_in: ServiceCreate, db: AsyncSession = Depends(get_db)):
    """Tạo dịch vụ mới."""
    # Check duplicate name
    dup = await db.execute(select(Service).where(Service.name == service_in.name, Service.is_active == True))
    if dup.scalars().first():
        raise HTTPException(status_code=400, detail="Tên dịch vụ này đã tồn tại")
        
    new_service = Service(
        name=service_in.name,
        description=service_in.description,
        price=service_in.price,
        unit=service_in.unit,
        image_url=service_in.image_url
    )
    db.add(new_service)
    await db.commit()
    return new_service

@router.put("/{id}", response_model=ServiceResponse)
async def admin_update_service(
    id: str,
    service_in: ServiceUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Cập nhật dịch vụ."""
    result = await db.execute(select(Service).where(Service.id == id))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Không tìm thấy dịch vụ")
        
    if service_in.name and service_in.name != service.name:
        dup = await db.execute(select(Service).where(Service.name == service_in.name, Service.is_active == True))
        if dup.scalars().first():
            raise HTTPException(status_code=400, detail="Tên dịch vụ đã tồn tại")
            
    update_data = service_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(service, field, value)
        
    await db.commit()
    return service

@router.patch("/{id}/toggle-active", response_model=ServiceResponse)
async def admin_toggle_service(id: str, db: AsyncSession = Depends(get_db)):
    """Bật / Tắt trạng thái hoạt động của dịch vụ."""
    result = await db.execute(select(Service).where(Service.id == id))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Không tìm thấy dịch vụ")
        
    service.is_active = not service.is_active
    await db.commit()
    return service

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_service(id: str, db: AsyncSession = Depends(get_db)):
    """Xóa dịch vụ (Soft Delete)."""
    result = await db.execute(select(Service).where(Service.id == id))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Không tìm thấy dịch vụ")
        
    service.is_active = False
    await db.commit()
    return None
