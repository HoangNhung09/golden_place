from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.database import close_database, create_tables
from app.routers import auth, rooms, cart, bookings, reviews, promotions
from app.routers.admin import dashboard as admin_dashboard
from app.routers.admin import bookings as admin_bookings_module
from app.routers.admin import customers as admin_customers
from app.routers.admin import promotions as admin_promotions_module
from app.routers.admin import services as admin_services
from app.routers.admin import reviews as admin_reviews_module
from app.routers.admin import reports as admin_reports
from app.routers.admin import rooms as admin_rooms_module
from app.routers.admin import users as admin_users

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting GoldenPlace Hotel API...")
    await create_tables()
    logger.info("Database ready.")
    yield
    logger.info("Shutting down GoldenPlace Hotel API...")
    await close_database()


app = FastAPI(
    title=settings.APP_NAME,
    description="GoldenPlace Hotel Booking System API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# Rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files directory
from fastapi.staticfiles import StaticFiles
import os

static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Routers
PREFIX = "/api/v1"

app.include_router(auth, prefix=PREFIX)
app.include_router(rooms, prefix=PREFIX)
app.include_router(cart, prefix=PREFIX)
app.include_router(bookings, prefix=PREFIX)
app.include_router(reviews, prefix=PREFIX)
app.include_router(promotions, prefix=PREFIX)

# Admin routers
ADMIN_PREFIX = f"{PREFIX}/admin"
app.include_router(admin_dashboard.router, prefix=ADMIN_PREFIX)
app.include_router(admin_rooms_module.router, prefix=ADMIN_PREFIX)
app.include_router(admin_bookings_module.router, prefix=ADMIN_PREFIX)
app.include_router(admin_customers.router, prefix=ADMIN_PREFIX)
app.include_router(admin_promotions_module.router, prefix=ADMIN_PREFIX)
app.include_router(admin_services.router, prefix=ADMIN_PREFIX)
app.include_router(admin_reviews_module.router, prefix=ADMIN_PREFIX)
app.include_router(admin_reports.router, prefix=ADMIN_PREFIX)
app.include_router(admin_users.router, prefix=ADMIN_PREFIX)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )


@app.get("/api/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME}
