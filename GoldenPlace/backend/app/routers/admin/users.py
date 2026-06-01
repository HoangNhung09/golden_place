from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from pydantic import Field
from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserResponse, UserCreate, UserUpdate
from app.middleware.auth import require_admin
from app.utils.security import get_password_hash

router = APIRouter(prefix="/users", tags=["Admin Accounts"], dependencies=[Depends(require_admin)])

INTERNAL_ROLES = [UserRole.ADMIN, UserRole.STAFF]


class SystemUserCreate(UserCreate):
    role: UserRole = UserRole.STAFF
    is_active: bool = True


class SystemUserUpdate(UserUpdate):
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=8)


@router.get("", response_model=List[UserResponse])
async def list_system_users(db: AsyncSession = Depends(get_db)):
    """List internal accounts that can be assigned admin/staff permissions."""
    result = await db.execute(
        select(User)
        .where(User.role.in_(INTERNAL_ROLES))
        .order_by(User.role.asc(), User.created_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_system_user(user_in: SystemUserCreate, db: AsyncSession = Depends(get_db)):
    """Create an internal admin or staff account."""
    if user_in.role == UserRole.CUSTOMER:
        raise HTTPException(status_code=400, detail="Khong the tao khach hang trong man hinh phan quyen")

    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email da ton tai tren he thong")

    new_user = User(
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
        role=user_in.role,
        is_active=user_in.is_active,
        is_email_verified=True,
    )
    db.add(new_user)
    await db.commit()
    return new_user


@router.put("/{id}", response_model=UserResponse)
async def update_system_user(
    id: str,
    user_in: SystemUserUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update an internal admin or staff account."""
    result = await db.execute(select(User).where(User.id == id, User.role.in_(INTERNAL_ROLES)))
    system_user = result.scalar_one_or_none()
    if not system_user:
        raise HTTPException(status_code=404, detail="Khong tim thay tai khoan noi bo")

    update_data = user_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "role" and value == UserRole.CUSTOMER:
            raise HTTPException(status_code=400, detail="Khong the doi tai khoan noi bo thanh khach hang")
        if field == "password":
            system_user.password_hash = get_password_hash(value)
        else:
            setattr(system_user, field, value)

    await db.commit()
    return system_user


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_system_user(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Soft-delete an internal account by locking it."""
    if id == current_user.id:
        raise HTTPException(status_code=400, detail="Ban khong the tu khoa tai khoan cua chinh minh")

    result = await db.execute(select(User).where(User.id == id, User.role.in_(INTERNAL_ROLES)))
    system_user = result.scalar_one_or_none()
    if not system_user:
        raise HTTPException(status_code=404, detail="Khong tim thay tai khoan noi bo")

    system_user.is_active = False
    await db.commit()
    return None
