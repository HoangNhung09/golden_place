from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy import text
from sqlalchemy.orm import DeclarativeBase
from app.config import settings
import logging

logger = logging.getLogger(__name__)

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=False,
    pool_recycle=3600,
    pool_size=10,
    max_overflow=20,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    pass


async def ensure_booking_payment_columns(conn):
    await conn.execute(
        text(
            """
            IF OBJECT_ID(N'dbo.bookings', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.bookings', N'payment_method') IS NULL
            BEGIN
                ALTER TABLE dbo.bookings ADD payment_method NVARCHAR(50) NOT NULL CONSTRAINT DF_bookings_payment_method DEFAULT N'PAY_AT_HOTEL';
                ALTER TABLE dbo.bookings ADD payment_status VARCHAR(50) NOT NULL CONSTRAINT DF_bookings_payment_status DEFAULT 'UNPAID';
                ALTER TABLE dbo.bookings ADD invoice_requested BIT NOT NULL CONSTRAINT DF_bookings_invoice_requested DEFAULT 0;
                ALTER TABLE dbo.bookings ADD invoice_company_name NVARCHAR(255) NULL;
                ALTER TABLE dbo.bookings ADD invoice_tax_code NVARCHAR(50) NULL;
                ALTER TABLE dbo.bookings ADD invoice_company_address NVARCHAR(500) NULL;
            END;
            """
        )
    )


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def create_tables():
    async with engine.begin() as conn:
        from app.models import base  # noqa: F401
        from app.models import user, room, booking, review, promotion, service, cart  # noqa: F401
        await conn.run_sync(Base.metadata.create_all)
        await ensure_booking_payment_columns(conn)
    logger.info("Database tables created/verified.")


async def close_database():
    await engine.dispose()
