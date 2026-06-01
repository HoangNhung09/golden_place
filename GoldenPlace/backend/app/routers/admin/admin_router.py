from fastapi import APIRouter
from app.routers.admin.dashboard import router as dashboard_router
from app.routers.admin.rooms import router as rooms_router
from app.routers.admin.bookings import router as bookings_router
from app.routers.admin.customers import router as customers_router
from app.routers.admin.promotions import router as promotions_router
from app.routers.admin.services import router as services_router
from app.routers.admin.reviews import router as reviews_router
from app.routers.admin.reports import router as reports_router
from app.routers.admin.users import router as users_router

admin_router = APIRouter(prefix="/admin")

admin_router.include_router(dashboard_router)
admin_router.include_router(rooms_router)
admin_router.include_router(bookings_router)
admin_router.include_router(customers_router)
admin_router.include_router(promotions_router)
admin_router.include_router(services_router)
admin_router.include_router(reviews_router)
admin_router.include_router(reports_router)
admin_router.include_router(users_router)
