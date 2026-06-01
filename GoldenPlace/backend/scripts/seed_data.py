import asyncio
import logging
import os
import sys
from datetime import date, datetime, time, timedelta

from sqlalchemy import delete

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import AsyncSessionLocal, Base, engine, ensure_booking_payment_columns
from app.models.booking import Booking, BookingService, BookingStatus, BookingStatusLog
from app.models.cart import Cart
from app.models.promotion import ApplicableTo, DiscountType, Promotion, PromotionType
from app.models.review import Review, ReviewStatus
from app.models.room import Room, RoomStatus, RoomType
from app.models.service import Service
from app.models.user import User, UserRole
from app.utils.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


ROOM_IMAGES = {
    "Standard": ["/static/uploads/room_standard.png", "/static/uploads/room_demo.png"],
    "Deluxe": ["/static/uploads/room_deluxe.png", "/static/uploads/phong_cao_cap_huong_dong.png"],
    "Suite": ["/static/uploads/room_suite.png", "/static/uploads/phong_cao_cap_huong_dong.png"],
    "Family": ["/static/uploads/room_family.png", "/static/uploads/room_demo.png"],
}


def nights(check_in: date, check_out: date) -> int:
    return max(1, (check_out - check_in).days)


async def seed():
    logger.info("Starting database seeding...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await ensure_booking_payment_columns(conn)

    async with AsyncSessionLocal() as db:
        logger.info("Cleaning existing data...")
        for model in [
            Review,
            BookingStatusLog,
            BookingService,
            Booking,
            Cart,
            Room,
            RoomType,
            Service,
            Promotion,
            User,
        ]:
            await db.execute(delete(model))
        await db.commit()

        password_hash = get_password_hash("password123")

        logger.info("Creating users...")
        admin = User(
            email="admin@goldenplace.com",
            password_hash=password_hash,
            full_name="Quản trị viên Golden Place",
            phone="0901234567",
            date_of_birth=date(1992, 5, 12),
            gender="Nam",
            address="123 Trần Hưng Đạo, Quận 1, TP.HCM",
            nationality="Việt Nam",
            id_number="079092000001",
            membership_tier="Diamond",
            reward_points=1500,
            total_points=3500,
            used_points=2000,
            role=UserRole.ADMIN,
            is_active=True,
            is_email_verified=True,
            internal_note="Tài khoản quản trị mặc định của hệ thống.",
        )
        staff = User(
            email="staff@goldenplace.com",
            password_hash=password_hash,
            full_name="Nhân viên lễ tân",
            phone="0902345678",
            date_of_birth=date(1996, 9, 20),
            gender="Nữ",
            address="45 Nguyễn Huệ, Quận 1, TP.HCM",
            nationality="Việt Nam",
            id_number="079096000002",
            membership_tier="Staff",
            role=UserRole.STAFF,
            is_active=True,
            is_email_verified=True,
            internal_note="Phụ trách kiểm tra đặt phòng và phản hồi khách hàng.",
        )

        customers = [
            User(
                email="customer1@gmail.com",
                password_hash=password_hash,
                full_name="Nguyễn Thị Hoa",
                phone="0123456789",
                date_of_birth=date(1998, 3, 14),
                gender="Nữ",
                address="12 Lê Lợi, Đà Nẵng",
                nationality="Việt Nam",
                id_number="048198000123",
                membership_tier="Gold",
                reward_points=420,
                total_points=720,
                used_points=300,
                role=UserRole.CUSTOMER,
                is_active=True,
                is_email_verified=True,
                internal_note="Khách hàng thân thiết, thường đặt phòng hướng biển.",
            ),
            User(
                email="customer2@gmail.com",
                password_hash=password_hash,
                full_name="Trần Minh Quân",
                phone="0987654321",
                date_of_birth=date(1990, 11, 2),
                gender="Nam",
                address="88 Pasteur, Quận 3, TP.HCM",
                nationality="Việt Nam",
                id_number="079090000456",
                membership_tier="Silver",
                reward_points=180,
                total_points=280,
                used_points=100,
                role=UserRole.CUSTOMER,
                is_active=True,
                is_email_verified=True,
            ),
            User(
                email="customer3@gmail.com",
                password_hash=password_hash,
                full_name="Lê Gia Hân",
                phone="0911222333",
                date_of_birth=date(1995, 7, 25),
                gender="Nữ",
                address="20 Bạch Đằng, Nha Trang",
                nationality="Việt Nam",
                id_number="056195000789",
                membership_tier="Platinum",
                reward_points=850,
                total_points=1250,
                used_points=400,
                role=UserRole.CUSTOMER,
                is_active=True,
                is_email_verified=True,
            ),
            User(
                email="customer4@gmail.com",
                password_hash=password_hash,
                full_name="Phạm Hoàng Nam",
                phone="0933444555",
                date_of_birth=date(1988, 1, 18),
                gender="Nam",
                address="9 Nguyễn Văn Linh, Hải Phòng",
                nationality="Việt Nam",
                id_number="031188000321",
                membership_tier="Bronze",
                reward_points=60,
                total_points=60,
                used_points=0,
                role=UserRole.CUSTOMER,
                is_active=True,
                is_email_verified=True,
            ),
        ]
        db.add_all([admin, staff, *customers])
        await db.flush()

        logger.info("Creating room types...")
        room_types = {
            "Standard": RoomType(
                name="Standard",
                description="Phòng tiêu chuẩn ấm cúng, đầy đủ tiện nghi cơ bản, phù hợp cho chuyến công tác hoặc kỳ nghỉ ngắn ngày.",
                amenities=["WiFi miễn phí", "Điều hòa", "Tivi", "Máy sấy tóc", "Ấm đun nước", "Bàn làm việc"],
            ),
            "Deluxe": RoomType(
                name="Deluxe",
                description="Phòng Deluxe rộng rãi với ban công thoáng, nội thất hiện đại và tầm nhìn hướng vườn hoặc thành phố.",
                amenities=["WiFi miễn phí", "Điều hòa", "Tivi thông minh", "Tủ lạnh mini", "Ban công", "Bồn tắm", "Máy sấy tóc"],
            ),
            "Suite": RoomType(
                name="Suite",
                description="Suite cao cấp có khu tiếp khách riêng, không gian nghỉ dưỡng sang trọng và nhiều quyền lợi dịch vụ đi kèm.",
                amenities=["WiFi miễn phí", "Điều hòa", "Tivi 45 inch", "Bồn tắm", "Ban công hướng biển", "Khu tiếp khách", "Máy pha cà phê", "Miễn phí spa"],
            ),
            "Family": RoomType(
                name="Family",
                description="Phòng gia đình tiện nghi với 2 giường đôi lớn, không gian sinh hoạt chung và ban công rộng.",
                amenities=["WiFi miễn phí", "Điều hòa", "Tivi", "Tủ lạnh", "2 giường đôi", "Bàn ăn nhỏ", "Sân chơi trẻ em mini"],
            ),
        }
        db.add_all(room_types.values())
        await db.flush()

        logger.info("Creating rooms...")
        room_specs = [
            ("101", "Standard", 1, 2, 1, 25, 600000, 750000, RoomStatus.AVAILABLE),
            ("102", "Standard", 1, 2, 1, 25, 600000, 750000, RoomStatus.AVAILABLE),
            ("103", "Standard", 1, 2, 1, 26, 650000, 800000, RoomStatus.MAINTENANCE),
            ("104", "Standard", 1, 2, 1, 26, 650000, 800000, RoomStatus.AVAILABLE),
            ("105", "Standard", 1, 2, 1, 28, 700000, 850000, RoomStatus.AVAILABLE),
            ("201", "Deluxe", 2, 2, 2, 35, 1000000, 1200000, RoomStatus.AVAILABLE),
            ("202", "Deluxe", 2, 2, 2, 36, 1050000, 1250000, RoomStatus.AVAILABLE),
            ("203", "Deluxe", 2, 2, 2, 35, 1000000, 1200000, RoomStatus.BLOCKED),
            ("204", "Deluxe", 2, 2, 2, 38, 1150000, 1350000, RoomStatus.AVAILABLE),
            ("205", "Deluxe", 2, 2, 2, 40, 1250000, 1450000, RoomStatus.AVAILABLE),
            ("301", "Suite", 3, 2, 2, 55, 2200000, 2500000, RoomStatus.AVAILABLE),
            ("302", "Suite", 3, 2, 2, 58, 2400000, 2700000, RoomStatus.AVAILABLE),
            ("303", "Suite", 3, 2, 2, 60, 2600000, 2900000, RoomStatus.AVAILABLE),
            ("304", "Suite", 3, 2, 2, 62, 2800000, 3100000, RoomStatus.AVAILABLE),
            ("401", "Family", 4, 4, 2, 50, 1600000, 1900000, RoomStatus.AVAILABLE),
            ("402", "Family", 4, 4, 2, 52, 1700000, 2000000, RoomStatus.AVAILABLE),
            ("403", "Family", 4, 4, 2, 54, 1800000, 2100000, RoomStatus.AVAILABLE),
            ("404", "Family", 4, 4, 2, 56, 1900000, 2200000, RoomStatus.AVAILABLE),
            ("501", "Suite", 5, 2, 2, 70, 3200000, 3600000, RoomStatus.AVAILABLE),
            ("502", "Family", 5, 4, 3, 65, 2300000, 2600000, RoomStatus.AVAILABLE),
        ]

        room_descriptions = {
            "Standard": "Phòng Standard đầy đủ tiện nghi, giường đệm êm ái, cửa sổ lớn đón sáng tự nhiên, thích hợp cho chuyến đi ngắn ngày hoặc công tác.",
            "Deluxe": "Phòng cao cấp hướng đông với ban công đón gió, không gian rộng rãi, nội thất tinh tế và bồn tắm thư giãn.",
            "Suite": "Phòng Suite hướng biển với khu tiếp khách riêng, tiện nghi cao cấp, miễn phí ăn sáng và ưu đãi spa cho khách lưu trú.",
            "Family": "Phòng Family rộng rãi với 2 giường đôi lớn, bàn ăn gia đình và khu ban công sinh hoạt chung ấm cúng.",
        }

        rooms = []
        for room_number, type_name, floor, adults, children, area, base_price, weekend_price, status in room_specs:
            room = Room(
                room_number=room_number,
                room_type_id=room_types[type_name].id,
                floor=floor,
                max_adults=adults,
                max_children=children,
                area_sqm=area,
                base_price=base_price,
                weekend_price=weekend_price,
                description=room_descriptions[type_name],
                images=ROOM_IMAGES[type_name],
                status=status,
                is_active=True,
            )
            rooms.append(room)
            db.add(room)
        await db.flush()

        room_by_number = {room.room_number: room for room in rooms}

        logger.info("Creating services...")
        services = [
            Service(
                name="Buffet sáng cao cấp",
                description="Buffet sáng hơn 50 món Á - Âu phục vụ tại nhà hàng Golden Place.",
                price=150000,
                unit="/khách/ngày",
                image_url="/images/anh-noi-that-khach-san-dep-01.jpg",
                is_active=True,
            ),
            Service(
                name="Spa thư giãn toàn thân",
                description="Liệu trình massage body và chăm sóc da bằng thảo mộc tự nhiên trong 60 phút.",
                price=450000,
                unit="/lượt",
                image_url="/images/ks-canvas.jpg",
                is_active=True,
            ),
            Service(
                name="Đưa đón sân bay",
                description="Xe riêng 4 chỗ hoặc 7 chỗ đưa đón từ sân bay đến khách sạn.",
                price=300000,
                unit="/lượt",
                image_url="/images/khach-san-chup-anh-dep-19.jpg",
                is_active=True,
            ),
            Service(
                name="Giặt ủi lấy nhanh",
                description="Giặt, sấy và là ủi quần áo trong ngày, phù hợp cho khách công tác.",
                price=50000,
                unit="/kg",
                image_url="/images/phong-khach-san-tt-studio.jpg",
                is_active=True,
            ),
            Service(
                name="Trang trí phòng kỷ niệm",
                description="Trang trí hoa, bóng bay và bánh ngọt cho sinh nhật, cầu hôn hoặc ngày kỷ niệm.",
                price=600000,
                unit="/gói",
                image_url="/images/4-tieu-chuan-phong-ngu-khach-san-5-sao.webp",
                is_active=True,
            ),
        ]
        db.add_all(services)
        await db.flush()

        logger.info("Creating promotions...")
        now = datetime.now()
        promotions = [
            Promotion(
                name="Chào hè rực rỡ",
                description="Giảm ngay 15% tổng tiền phòng cho mọi đơn đặt phòng trong mùa hè.",
                code="HE15",
                type=PromotionType.FLASH_SALE,
                discount_type=DiscountType.PERCENT,
                discount_value=15,
                min_order_amount=0,
                max_uses=100,
                used_count=12,
                start_date=now - timedelta(days=5),
                end_date=now + timedelta(days=60),
                applicable_to=ApplicableTo.ALL,
                is_active=True,
            ),
            Promotion(
                name="Ưu đãi đặt sớm",
                description="Giảm 200.000 đ cho đơn đặt phòng từ 2.000.000 đ trở lên.",
                code="EARLY200",
                type=PromotionType.EARLY_BIRD,
                discount_type=DiscountType.AMOUNT,
                discount_value=200000,
                min_order_amount=2000000,
                max_uses=50,
                used_count=7,
                start_date=now - timedelta(days=2),
                end_date=now + timedelta(days=30),
                applicable_to=ApplicableTo.ALL,
                is_active=True,
            ),
            Promotion(
                name="Tri ân khách hàng Suite",
                description="Giảm 10% khi đặt phòng Suite cao cấp hướng biển.",
                code="SUITE10",
                type=PromotionType.COUPON,
                discount_type=DiscountType.PERCENT,
                discount_value=10,
                min_order_amount=0,
                max_uses=30,
                used_count=4,
                start_date=now - timedelta(days=1),
                end_date=now + timedelta(days=45),
                applicable_to=ApplicableTo.ROOM_TYPE,
                applicable_ids=[room_types["Suite"].id],
                is_active=True,
            ),
            Promotion(
                name="Gia đình cuối tuần",
                description="Giảm 300.000 đ cho phòng Family vào dịp cuối tuần.",
                code="FAMILY300",
                type=PromotionType.COUPON,
                discount_type=DiscountType.AMOUNT,
                discount_value=300000,
                min_order_amount=1500000,
                max_uses=40,
                used_count=9,
                start_date=now - timedelta(days=10),
                end_date=now + timedelta(days=90),
                applicable_to=ApplicableTo.ROOM_TYPE,
                applicable_ids=[room_types["Family"].id],
                is_active=True,
            ),
        ]
        db.add_all(promotions)
        await db.flush()

        logger.info("Creating bookings, carts and reviews...")
        today = date.today()
        bookings = [
            Booking(
                booking_code="GP2026052101",
                user_id=customers[0].id,
                room_id=room_by_number["301"].id,
                promotion_id=promotions[2].id,
                check_in_date=today + timedelta(days=3),
                check_out_date=today + timedelta(days=6),
                adults=2,
                children=0,
                status=BookingStatus.CONFIRMED,
                room_price_snapshot=2200000,
                discount_amount=660000,
                services_amount=300000,
                total_amount=6240000,
                payment_method="BANK_TRANSFER",
                payment_status="UNPAID",
                invoice_requested=True,
                invoice_company_name="Công ty TNHH Hoa Biển",
                invoice_tax_code="0312345678",
                invoice_company_address="12 Lê Lợi, Đà Nẵng",
                guest_name="Nguyễn Thị Hoa",
                guest_email="customer1@gmail.com",
                guest_phone="0123456789",
                guest_nationality="Việt Nam",
                guest_id_number="048198000123",
                special_requests="Tầng cao, giường đôi, không hút thuốc.",
                expected_checkin_time=time(14, 0),
            ),
            Booking(
                booking_code="GP2026052102",
                user_id=customers[1].id,
                room_id=room_by_number["201"].id,
                promotion_id=promotions[0].id,
                check_in_date=today - timedelta(days=8),
                check_out_date=today - timedelta(days=5),
                adults=2,
                children=1,
                status=BookingStatus.CHECKED_OUT,
                room_price_snapshot=1000000,
                discount_amount=450000,
                services_amount=150000,
                total_amount=2700000,
                payment_method="PAY_AT_HOTEL",
                payment_status="PAID",
                invoice_requested=False,
                guest_name="Trần Minh Quân",
                guest_email="customer2@gmail.com",
                guest_phone="0987654321",
                guest_nationality="Việt Nam",
                guest_id_number="079090000456",
                special_requests="Chuẩn bị thêm gối cho trẻ em.",
                expected_checkin_time=time(15, 30),
            ),
            Booking(
                booking_code="GP2026052103",
                user_id=customers[2].id,
                room_id=room_by_number["401"].id,
                promotion_id=promotions[3].id,
                check_in_date=today - timedelta(days=20),
                check_out_date=today - timedelta(days=17),
                adults=4,
                children=2,
                status=BookingStatus.CHECKED_OUT,
                room_price_snapshot=1600000,
                discount_amount=300000,
                services_amount=600000,
                total_amount=5100000,
                payment_method="VISA",
                payment_status="PAID",
                invoice_requested=True,
                invoice_company_name="Công ty Gia Hân Travel",
                invoice_tax_code="0409876543",
                invoice_company_address="20 Bạch Đằng, Nha Trang",
                guest_name="Lê Gia Hân",
                guest_email="customer3@gmail.com",
                guest_phone="0911222333",
                guest_nationality="Việt Nam",
                guest_id_number="056195000789",
                special_requests="Cần nôi trẻ em và phòng gần thang máy.",
                expected_checkin_time=time(13, 0),
            ),
            Booking(
                booking_code="GP2026052104",
                user_id=customers[3].id,
                room_id=room_by_number["102"].id,
                promotion_id=None,
                check_in_date=today + timedelta(days=10),
                check_out_date=today + timedelta(days=12),
                adults=1,
                children=0,
                status=BookingStatus.PENDING,
                room_price_snapshot=600000,
                discount_amount=0,
                services_amount=0,
                total_amount=1200000,
                payment_method="MOMO",
                payment_status="UNPAID",
                invoice_requested=True,
                invoice_company_name="Công ty TNHH Hoàng Nam",
                invoice_tax_code="0101112223",
                invoice_company_address="9 Nguyễn Văn Linh, Hải Phòng",
                guest_name="Phạm Hoàng Nam",
                guest_email="customer4@gmail.com",
                guest_phone="0933444555",
                guest_nationality="Việt Nam",
                guest_id_number="031188000321",
                special_requests="Xuất hóa đơn công ty.",
                expected_checkin_time=time(18, 0),
            ),
        ]
        db.add_all(bookings)
        await db.flush()

        booking_services = [
            BookingService(booking_id=bookings[0].id, service_id=services[2].id, quantity=1, unit_price=300000, subtotal=300000),
            BookingService(booking_id=bookings[1].id, service_id=services[0].id, quantity=1, unit_price=150000, subtotal=150000),
            BookingService(booking_id=bookings[2].id, service_id=services[4].id, quantity=1, unit_price=600000, subtotal=600000),
        ]
        db.add_all(booking_services)

        status_logs = [
            BookingStatusLog(booking_id=bookings[0].id, changed_by=admin.id, old_status=None, new_status=BookingStatus.CONFIRMED.value, note="Admin xác nhận đặt phòng từ website."),
            BookingStatusLog(booking_id=bookings[1].id, changed_by=staff.id, old_status=BookingStatus.CONFIRMED.value, new_status=BookingStatus.CHECKED_OUT.value, note="Khách đã trả phòng và hoàn tất thanh toán."),
            BookingStatusLog(booking_id=bookings[2].id, changed_by=staff.id, old_status=BookingStatus.CONFIRMED.value, new_status=BookingStatus.CHECKED_OUT.value, note="Gia đình khách đã hoàn tất lưu trú."),
            BookingStatusLog(booking_id=bookings[3].id, changed_by=None, old_status=None, new_status=BookingStatus.PENDING.value, note="Đơn mới tạo, chờ xác nhận."),
        ]
        db.add_all(status_logs)

        carts = [
            Cart(
                user_id=customers[0].id,
                room_id=room_by_number["302"].id,
                promotion_id=promotions[2].id,
                check_in_date=today + timedelta(days=14),
                check_out_date=today + timedelta(days=17),
                adults=2,
                children=0,
                is_expired=False,
                expires_at=datetime.now() + timedelta(hours=2),
            ),
            Cart(
                user_id=customers[1].id,
                room_id=room_by_number["202"].id,
                promotion_id=promotions[0].id,
                check_in_date=today + timedelta(days=7),
                check_out_date=today + timedelta(days=9),
                adults=2,
                children=1,
                is_expired=False,
                expires_at=datetime.now() + timedelta(hours=2),
            ),
        ]
        db.add_all(carts)

        reviews = [
            Review(
                booking_id=bookings[1].id,
                user_id=customers[1].id,
                room_id=room_by_number["201"].id,
                rating_room=5,
                rating_service=5,
                rating_cleanliness=5,
                rating_location=4,
                rating_value=5,
                rating_overall=4.8,
                comment="Phòng sạch sẽ, dịch vụ tuyệt vời, nhân viên rất có tâm. Gia đình mình sẽ quay lại.",
                images=["/static/uploads/room_deluxe.png"],
                status=ReviewStatus.APPROVED,
                admin_reply="Golden Place cảm ơn anh Quân đã tin tưởng lựa chọn khách sạn. Rất mong được đón gia đình mình trong kỳ nghỉ tiếp theo.",
                admin_reply_at=datetime.now() - timedelta(days=4),
            ),
            Review(
                booking_id=bookings[2].id,
                user_id=customers[2].id,
                room_id=room_by_number["401"].id,
                rating_room=4,
                rating_service=5,
                rating_cleanliness=4,
                rating_location=5,
                rating_value=4,
                rating_overall=4.4,
                comment="Phòng Family rộng, tiện cho trẻ nhỏ. Bữa sáng ngon, khu vực hồ bơi đẹp.",
                images=["/static/uploads/room_family.png"],
                status=ReviewStatus.PENDING,
                admin_reply=None,
                admin_reply_at=None,
            ),
        ]
        db.add_all(reviews)

        await db.commit()
        logger.info("Database seeding successfully completed!")


async def main():
    try:
        await seed()
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
