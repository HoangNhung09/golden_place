-- GoldenPlace SQL Server seed data
-- Chạy file này trong SSMS sau khi đã tạo bảng bằng:
--   python scripts/create_db.py
--
-- Lưu ý:
-- - Toàn bộ chuỗi tiếng Việt đều dùng N'...' để SQL Server insert Unicode.
-- - Nếu DB cũ từng tạo cột VARCHAR thì vẫn lỗi dấu; cần drop DB, tạo lại bằng model mới NVARCHAR.

USE [GoldenPlace];
GO

IF OBJECT_ID(N'dbo.users', N'U') IS NULL
BEGIN
    THROW 50001, N'Chưa có bảng. Hãy chạy python scripts/create_db.py trước.', 1;
END;
GO

IF OBJECT_ID(N'dbo.bookings', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.bookings', N'payment_method') IS NULL
BEGIN
    ALTER TABLE dbo.bookings ADD payment_method NVARCHAR(50) NOT NULL CONSTRAINT DF_bookings_payment_method DEFAULT N'PAY_AT_HOTEL';
    ALTER TABLE dbo.bookings ADD payment_status VARCHAR(50) NOT NULL CONSTRAINT DF_bookings_payment_status DEFAULT 'UNPAID';
    ALTER TABLE dbo.bookings ADD invoice_requested BIT NOT NULL CONSTRAINT DF_bookings_invoice_requested DEFAULT 0;
    ALTER TABLE dbo.bookings ADD invoice_company_name NVARCHAR(255) NULL;
    ALTER TABLE dbo.bookings ADD invoice_tax_code NVARCHAR(50) NULL;
    ALTER TABLE dbo.bookings ADD invoice_company_address NVARCHAR(500) NULL;
END;
GO

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @now DATETIME2 = SYSDATETIME();
    DECLARE @password_hash NVARCHAR(255) = N'$2b$12$UN7VNja7t.nCBqmaLa8xXekIdy0Xy.o4T2EmiCQIlUH1C9a1609A.';

    DECLARE @admin_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000000001';
    DECLARE @staff_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000000002';
    DECLARE @customer1_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000000011';
    DECLARE @customer2_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000000012';
    DECLARE @customer3_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000000013';
    DECLARE @customer4_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000000014';

    DECLARE @standard_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000000101';
    DECLARE @deluxe_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000000102';
    DECLARE @suite_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000000103';
    DECLARE @family_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000000104';

    DECLARE @room101_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000001101';
    DECLARE @room102_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000001102';
    DECLARE @room103_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000001103';
    DECLARE @room104_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000001104';
    DECLARE @room105_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000001105';
    DECLARE @room201_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000001201';
    DECLARE @room202_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000001202';
    DECLARE @room203_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000001203';
    DECLARE @room204_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000001204';
    DECLARE @room205_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000001205';
    DECLARE @room301_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000001301';
    DECLARE @room302_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000001302';
    DECLARE @room303_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000001303';
    DECLARE @room304_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000001304';
    DECLARE @room401_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000001401';
    DECLARE @room402_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000001402';
    DECLARE @room403_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000001403';
    DECLARE @room404_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000001404';
    DECLARE @room501_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000001501';
    DECLARE @room502_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000001502';

    DECLARE @service1_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000000201';
    DECLARE @service2_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000000202';
    DECLARE @service3_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000000203';
    DECLARE @service4_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000000204';
    DECLARE @service5_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000000205';

    DECLARE @promo1_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000000301';
    DECLARE @promo2_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000000302';
    DECLARE @promo3_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000000303';
    DECLARE @promo4_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000000304';

    DECLARE @booking1_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000000401';
    DECLARE @booking2_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000000402';
    DECLARE @booking3_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000000403';
    DECLARE @booking4_id NVARCHAR(36) = N'00000000-0000-0000-0000-000000000404';

    DELETE FROM reviews;
    DELETE FROM booking_status_logs;
    DELETE FROM booking_services;
    DELETE FROM bookings;
    DELETE FROM carts;
    DELETE FROM rooms;
    DELETE FROM room_types;
    DELETE FROM services;
    DELETE FROM promotions;
    DELETE FROM users;

    INSERT INTO users (
        id, email, password_hash, full_name, phone, avatar_url, date_of_birth, gender, address,
        nationality, id_number, membership_tier, reward_points, total_points, used_points, role,
        is_active, is_email_verified, email_verification_token, email_verification_expires,
        reset_password_token, reset_password_expires, failed_login_attempts, locked_until,
        internal_note, created_at, updated_at
    )
    VALUES
    (@admin_id, N'admin@goldenplace.com', @password_hash, N'Quản trị viên Golden Place', N'0901234567', NULL, '1992-05-12', N'Nam', N'123 Trần Hưng Đạo, Quận 1, TP.HCM', N'Việt Nam', N'079092000001', N'Diamond', 1500, 3500, 2000, N'ADMIN', 1, 1, NULL, NULL, NULL, NULL, 0, NULL, N'Tài khoản quản trị mặc định của hệ thống.', @now, @now),
    (@staff_id, N'staff@goldenplace.com', @password_hash, N'Nhân viên lễ tân', N'0902345678', NULL, '1996-09-20', N'Nữ', N'45 Nguyễn Huệ, Quận 1, TP.HCM', N'Việt Nam', N'079096000002', N'Staff', 0, 0, 0, N'STAFF', 1, 1, NULL, NULL, NULL, NULL, 0, NULL, N'Phụ trách kiểm tra đặt phòng và phản hồi khách hàng.', @now, @now),
    (@customer1_id, N'customer1@gmail.com', @password_hash, N'Nguyễn Thị Hoa', N'0123456789', NULL, '1998-03-14', N'Nữ', N'12 Lê Lợi, Đà Nẵng', N'Việt Nam', N'048198000123', N'Gold', 420, 720, 300, N'CUSTOMER', 1, 1, NULL, NULL, NULL, NULL, 0, NULL, N'Khách hàng thân thiết, thường đặt phòng hướng biển.', @now, @now),
    (@customer2_id, N'customer2@gmail.com', @password_hash, N'Trần Minh Quân', N'0987654321', NULL, '1990-11-02', N'Nam', N'88 Pasteur, Quận 3, TP.HCM', N'Việt Nam', N'079090000456', N'Silver', 180, 280, 100, N'CUSTOMER', 1, 1, NULL, NULL, NULL, NULL, 0, NULL, NULL, @now, @now),
    (@customer3_id, N'customer3@gmail.com', @password_hash, N'Lê Gia Hân', N'0911222333', NULL, '1995-07-25', N'Nữ', N'20 Bạch Đằng, Nha Trang', N'Việt Nam', N'056195000789', N'Platinum', 850, 1250, 400, N'CUSTOMER', 1, 1, NULL, NULL, NULL, NULL, 0, NULL, NULL, @now, @now),
    (@customer4_id, N'customer4@gmail.com', @password_hash, N'Phạm Hoàng Nam', N'0933444555', NULL, '1988-01-18', N'Nam', N'9 Nguyễn Văn Linh, Hải Phòng', N'Việt Nam', N'031188000321', N'Bronze', 60, 60, 0, N'CUSTOMER', 1, 1, NULL, NULL, NULL, NULL, 0, NULL, NULL, @now, @now);

    INSERT INTO room_types (id, name, description, amenities, created_at, updated_at)
    VALUES
    (@standard_id, N'Standard', N'Phòng tiêu chuẩn ấm cúng, đầy đủ tiện nghi cơ bản, phù hợp cho chuyến công tác hoặc kỳ nghỉ ngắn ngày.', N'["WiFi miễn phí","Điều hòa","Tivi","Máy sấy tóc","Ấm đun nước","Bàn làm việc"]', @now, @now),
    (@deluxe_id, N'Deluxe', N'Phòng Deluxe rộng rãi với ban công thoáng, nội thất hiện đại và tầm nhìn hướng vườn hoặc thành phố.', N'["WiFi miễn phí","Điều hòa","Tivi thông minh","Tủ lạnh mini","Ban công","Bồn tắm","Máy sấy tóc"]', @now, @now),
    (@suite_id, N'Suite', N'Suite cao cấp có khu tiếp khách riêng, không gian nghỉ dưỡng sang trọng và nhiều quyền lợi dịch vụ đi kèm.', N'["WiFi miễn phí","Điều hòa","Tivi 45 inch","Bồn tắm","Ban công hướng biển","Khu tiếp khách","Máy pha cà phê","Miễn phí spa"]', @now, @now),
    (@family_id, N'Family', N'Phòng gia đình tiện nghi với 2 giường đôi lớn, không gian sinh hoạt chung và ban công rộng.', N'["WiFi miễn phí","Điều hòa","Tivi","Tủ lạnh","2 giường đôi","Bàn ăn nhỏ","Sân chơi trẻ em mini"]', @now, @now);

    INSERT INTO rooms (
        id, room_number, room_type_id, floor, max_adults, max_children, area_sqm, base_price,
        weekend_price, description, images, status, is_active, created_at, updated_at
    )
    VALUES
    (@room101_id, N'101', @standard_id, 1, 2, 1, 25, 600000, 750000, N'Phòng Standard đầy đủ tiện nghi, giường đệm êm ái, cửa sổ lớn đón sáng tự nhiên, thích hợp cho chuyến đi ngắn ngày hoặc công tác.', N'["/static/uploads/room_standard.png","/static/uploads/room_demo.png"]', N'AVAILABLE', 1, @now, @now),
    (@room102_id, N'102', @standard_id, 1, 2, 1, 25, 600000, 750000, N'Phòng Standard đầy đủ tiện nghi, giường đệm êm ái, cửa sổ lớn đón sáng tự nhiên, thích hợp cho chuyến đi ngắn ngày hoặc công tác.', N'["/static/uploads/room_standard.png","/static/uploads/room_demo.png"]', N'AVAILABLE', 1, @now, @now),
    (@room103_id, N'103', @standard_id, 1, 2, 1, 26, 650000, 800000, N'Phòng Standard đầy đủ tiện nghi, giường đệm êm ái, cửa sổ lớn đón sáng tự nhiên, thích hợp cho chuyến đi ngắn ngày hoặc công tác.', N'["/static/uploads/room_standard.png","/static/uploads/room_demo.png"]', N'MAINTENANCE', 1, @now, @now),
    (@room104_id, N'104', @standard_id, 1, 2, 1, 26, 650000, 800000, N'Phòng Standard đầy đủ tiện nghi, giường đệm êm ái, cửa sổ lớn đón sáng tự nhiên, thích hợp cho chuyến đi ngắn ngày hoặc công tác.', N'["/static/uploads/room_standard.png","/static/uploads/room_demo.png"]', N'AVAILABLE', 1, @now, @now),
    (@room105_id, N'105', @standard_id, 1, 2, 1, 28, 700000, 850000, N'Phòng Standard đầy đủ tiện nghi, giường đệm êm ái, cửa sổ lớn đón sáng tự nhiên, thích hợp cho chuyến đi ngắn ngày hoặc công tác.', N'["/static/uploads/room_standard.png","/static/uploads/room_demo.png"]', N'AVAILABLE', 1, @now, @now),
    (@room201_id, N'201', @deluxe_id, 2, 2, 2, 35, 1000000, 1200000, N'Phòng cao cấp hướng đông với ban công đón gió, không gian rộng rãi, nội thất tinh tế và bồn tắm thư giãn.', N'["/static/uploads/room_deluxe.png","/static/uploads/phong_cao_cap_huong_dong.png"]', N'AVAILABLE', 1, @now, @now),
    (@room202_id, N'202', @deluxe_id, 2, 2, 2, 36, 1050000, 1250000, N'Phòng cao cấp hướng đông với ban công đón gió, không gian rộng rãi, nội thất tinh tế và bồn tắm thư giãn.', N'["/static/uploads/room_deluxe.png","/static/uploads/phong_cao_cap_huong_dong.png"]', N'AVAILABLE', 1, @now, @now),
    (@room203_id, N'203', @deluxe_id, 2, 2, 2, 35, 1000000, 1200000, N'Phòng cao cấp hướng đông với ban công đón gió, không gian rộng rãi, nội thất tinh tế và bồn tắm thư giãn.', N'["/static/uploads/room_deluxe.png","/static/uploads/phong_cao_cap_huong_dong.png"]', N'BLOCKED', 1, @now, @now),
    (@room204_id, N'204', @deluxe_id, 2, 2, 2, 38, 1150000, 1350000, N'Phòng cao cấp hướng đông với ban công đón gió, không gian rộng rãi, nội thất tinh tế và bồn tắm thư giãn.', N'["/static/uploads/room_deluxe.png","/static/uploads/phong_cao_cap_huong_dong.png"]', N'AVAILABLE', 1, @now, @now),
    (@room205_id, N'205', @deluxe_id, 2, 2, 2, 40, 1250000, 1450000, N'Phòng cao cấp hướng đông với ban công đón gió, không gian rộng rãi, nội thất tinh tế và bồn tắm thư giãn.', N'["/static/uploads/room_deluxe.png","/static/uploads/phong_cao_cap_huong_dong.png"]', N'AVAILABLE', 1, @now, @now),
    (@room301_id, N'301', @suite_id, 3, 2, 2, 55, 2200000, 2500000, N'Phòng Suite hướng biển với khu tiếp khách riêng, tiện nghi cao cấp, miễn phí ăn sáng và ưu đãi spa cho khách lưu trú.', N'["/static/uploads/room_suite.png","/static/uploads/phong_cao_cap_huong_dong.png"]', N'AVAILABLE', 1, @now, @now),
    (@room302_id, N'302', @suite_id, 3, 2, 2, 58, 2400000, 2700000, N'Phòng Suite hướng biển với khu tiếp khách riêng, tiện nghi cao cấp, miễn phí ăn sáng và ưu đãi spa cho khách lưu trú.', N'["/static/uploads/room_suite.png","/static/uploads/phong_cao_cap_huong_dong.png"]', N'AVAILABLE', 1, @now, @now),
    (@room303_id, N'303', @suite_id, 3, 2, 2, 60, 2600000, 2900000, N'Phòng Suite hướng biển với khu tiếp khách riêng, tiện nghi cao cấp, miễn phí ăn sáng và ưu đãi spa cho khách lưu trú.', N'["/static/uploads/room_suite.png","/static/uploads/phong_cao_cap_huong_dong.png"]', N'AVAILABLE', 1, @now, @now),
    (@room304_id, N'304', @suite_id, 3, 2, 2, 62, 2800000, 3100000, N'Phòng Suite hướng biển với khu tiếp khách riêng, tiện nghi cao cấp, miễn phí ăn sáng và ưu đãi spa cho khách lưu trú.', N'["/static/uploads/room_suite.png","/static/uploads/phong_cao_cap_huong_dong.png"]', N'AVAILABLE', 1, @now, @now),
    (@room401_id, N'401', @family_id, 4, 4, 2, 50, 1600000, 1900000, N'Phòng Family rộng rãi với 2 giường đôi lớn, bàn ăn gia đình và khu ban công sinh hoạt chung ấm cúng.', N'["/static/uploads/room_family.png","/static/uploads/room_demo.png"]', N'AVAILABLE', 1, @now, @now),
    (@room402_id, N'402', @family_id, 4, 4, 2, 52, 1700000, 2000000, N'Phòng Family rộng rãi với 2 giường đôi lớn, bàn ăn gia đình và khu ban công sinh hoạt chung ấm cúng.', N'["/static/uploads/room_family.png","/static/uploads/room_demo.png"]', N'AVAILABLE', 1, @now, @now),
    (@room403_id, N'403', @family_id, 4, 4, 2, 54, 1800000, 2100000, N'Phòng Family rộng rãi với 2 giường đôi lớn, bàn ăn gia đình và khu ban công sinh hoạt chung ấm cúng.', N'["/static/uploads/room_family.png","/static/uploads/room_demo.png"]', N'AVAILABLE', 1, @now, @now),
    (@room404_id, N'404', @family_id, 4, 4, 2, 56, 1900000, 2200000, N'Phòng Family rộng rãi với 2 giường đôi lớn, bàn ăn gia đình và khu ban công sinh hoạt chung ấm cúng.', N'["/static/uploads/room_family.png","/static/uploads/room_demo.png"]', N'AVAILABLE', 1, @now, @now),
    (@room501_id, N'501', @suite_id, 5, 2, 2, 70, 3200000, 3600000, N'Phòng Suite hướng biển với khu tiếp khách riêng, tiện nghi cao cấp, miễn phí ăn sáng và ưu đãi spa cho khách lưu trú.', N'["/static/uploads/room_suite.png","/static/uploads/phong_cao_cap_huong_dong.png"]', N'AVAILABLE', 1, @now, @now),
    (@room502_id, N'502', @family_id, 5, 4, 3, 65, 2300000, 2600000, N'Phòng Family rộng rãi với 2 giường đôi lớn, bàn ăn gia đình và khu ban công sinh hoạt chung ấm cúng.', N'["/static/uploads/room_family.png","/static/uploads/room_demo.png"]', N'AVAILABLE', 1, @now, @now);

    INSERT INTO services (id, name, description, price, unit, image_url, is_active, created_at, updated_at)
    VALUES
    (@service1_id, N'Buffet sáng cao cấp', N'Buffet sáng hơn 50 món Á - Âu phục vụ tại nhà hàng Golden Place.', 150000, N'/khách/ngày', N'/images/anh-noi-that-khach-san-dep-01.jpg', 1, @now, @now),
    (@service2_id, N'Spa thư giãn toàn thân', N'Liệu trình massage body và chăm sóc da bằng thảo mộc tự nhiên trong 60 phút.', 450000, N'/lượt', N'/images/ks-canvas.jpg', 1, @now, @now),
    (@service3_id, N'Đưa đón sân bay', N'Xe riêng 4 chỗ hoặc 7 chỗ đưa đón từ sân bay đến khách sạn.', 300000, N'/lượt', N'/images/khach-san-chup-anh-dep-19.jpg', 1, @now, @now),
    (@service4_id, N'Giặt ủi lấy nhanh', N'Giặt, sấy và là ủi quần áo trong ngày, phù hợp cho khách công tác.', 50000, N'/kg', N'/images/phong-khach-san-tt-studio.jpg', 1, @now, @now),
    (@service5_id, N'Trang trí phòng kỷ niệm', N'Trang trí hoa, bóng bay và bánh ngọt cho sinh nhật, cầu hôn hoặc ngày kỷ niệm.', 600000, N'/gói', N'/images/4-tieu-chuan-phong-ngu-khach-san-5-sao.webp', 1, @now, @now);

    INSERT INTO promotions (
        id, name, description, code, type, discount_type, discount_value, min_order_amount,
        max_uses, used_count, start_date, end_date, applicable_to, applicable_ids, is_active,
        created_at, updated_at
    )
    VALUES
    (@promo1_id, N'Chào hè rực rỡ', N'Giảm ngay 15% tổng tiền phòng cho mọi đơn đặt phòng trong mùa hè.', N'HE15', N'FLASH_SALE', N'PERCENT', 15, 0, 100, 12, DATEADD(DAY, -5, @now), DATEADD(DAY, 60, @now), N'ALL', NULL, 1, @now, @now),
    (@promo2_id, N'Ưu đãi đặt sớm', N'Giảm 200.000 đ cho đơn đặt phòng từ 2.000.000 đ trở lên.', N'EARLY200', N'EARLY_BIRD', N'AMOUNT', 200000, 2000000, 50, 7, DATEADD(DAY, -2, @now), DATEADD(DAY, 30, @now), N'ALL', NULL, 1, @now, @now),
    (@promo3_id, N'Tri ân khách hàng Suite', N'Giảm 10% khi đặt phòng Suite cao cấp hướng biển.', N'SUITE10', N'COUPON', N'PERCENT', 10, 0, 30, 4, DATEADD(DAY, -1, @now), DATEADD(DAY, 45, @now), N'ROOM_TYPE', N'["00000000-0000-0000-0000-000000000103"]', 1, @now, @now),
    (@promo4_id, N'Gia đình cuối tuần', N'Giảm 300.000 đ cho phòng Family vào dịp cuối tuần.', N'FAMILY300', N'COUPON', N'AMOUNT', 300000, 1500000, 40, 9, DATEADD(DAY, -10, @now), DATEADD(DAY, 90, @now), N'ROOM_TYPE', N'["00000000-0000-0000-0000-000000000104"]', 1, @now, @now);

    INSERT INTO bookings (
        id, booking_code, user_id, room_id, promotion_id, check_in_date, check_out_date,
        adults, children, status, room_price_snapshot, discount_amount, services_amount,
        total_amount, payment_method, payment_status, invoice_requested, invoice_company_name,
        invoice_tax_code, invoice_company_address, guest_name, guest_email, guest_phone,
        guest_nationality, guest_id_number, special_requests, expected_checkin_time,
        cancellation_reason, created_at, updated_at
    )
    VALUES
    (@booking1_id, N'GP2026052101', @customer1_id, @room301_id, @promo3_id, DATEADD(DAY, 3, CAST(GETDATE() AS DATE)), DATEADD(DAY, 6, CAST(GETDATE() AS DATE)), 2, 0, N'CONFIRMED', 2200000, 660000, 300000, 6240000, N'BANK_TRANSFER', N'UNPAID', 1, N'Công ty TNHH Hoa Biển', N'0312345678', N'12 Lê Lợi, Đà Nẵng', N'Nguyễn Thị Hoa', N'customer1@gmail.com', N'0123456789', N'Việt Nam', N'048198000123', N'Tầng cao, giường đôi, không hút thuốc.', '14:00:00', NULL, @now, @now),
    (@booking2_id, N'GP2026052102', @customer2_id, @room201_id, @promo1_id, DATEADD(DAY, -8, CAST(GETDATE() AS DATE)), DATEADD(DAY, -5, CAST(GETDATE() AS DATE)), 2, 1, N'CHECKED_OUT', 1000000, 450000, 150000, 2700000, N'PAY_AT_HOTEL', N'PAID', 0, NULL, NULL, NULL, N'Trần Minh Quân', N'customer2@gmail.com', N'0987654321', N'Việt Nam', N'079090000456', N'Chuẩn bị thêm gối cho trẻ em.', '15:30:00', NULL, @now, @now),
    (@booking3_id, N'GP2026052103', @customer3_id, @room401_id, @promo4_id, DATEADD(DAY, -20, CAST(GETDATE() AS DATE)), DATEADD(DAY, -17, CAST(GETDATE() AS DATE)), 4, 2, N'CHECKED_OUT', 1600000, 300000, 600000, 5100000, N'VISA', N'PAID', 1, N'Công ty Gia Hân Travel', N'0409876543', N'20 Bạch Đằng, Nha Trang', N'Lê Gia Hân', N'customer3@gmail.com', N'0911222333', N'Việt Nam', N'056195000789', N'Cần nôi trẻ em và phòng gần thang máy.', '13:00:00', NULL, @now, @now),
    (@booking4_id, N'GP2026052104', @customer4_id, @room102_id, NULL, DATEADD(DAY, 10, CAST(GETDATE() AS DATE)), DATEADD(DAY, 12, CAST(GETDATE() AS DATE)), 1, 0, N'PENDING', 600000, 0, 0, 1200000, N'MOMO', N'UNPAID', 1, N'Công ty TNHH Hoàng Nam', N'0101112223', N'9 Nguyễn Văn Linh, Hải Phòng', N'Phạm Hoàng Nam', N'customer4@gmail.com', N'0933444555', N'Việt Nam', N'031188000321', N'Xuất hóa đơn công ty.', '18:00:00', NULL, @now, @now);

    INSERT INTO booking_services (id, booking_id, service_id, quantity, unit_price, subtotal)
    VALUES
    (N'00000000-0000-0000-0000-000000000501', @booking1_id, @service3_id, 1, 300000, 300000),
    (N'00000000-0000-0000-0000-000000000502', @booking2_id, @service1_id, 1, 150000, 150000),
    (N'00000000-0000-0000-0000-000000000503', @booking3_id, @service5_id, 1, 600000, 600000);

    INSERT INTO booking_status_logs (id, booking_id, changed_by, old_status, new_status, note, created_at)
    VALUES
    (N'00000000-0000-0000-0000-000000000601', @booking1_id, @admin_id, NULL, N'CONFIRMED', N'Admin xác nhận đặt phòng từ website.', @now),
    (N'00000000-0000-0000-0000-000000000602', @booking2_id, @staff_id, N'CONFIRMED', N'CHECKED_OUT', N'Khách đã trả phòng và hoàn tất thanh toán.', @now),
    (N'00000000-0000-0000-0000-000000000603', @booking3_id, @staff_id, N'CONFIRMED', N'CHECKED_OUT', N'Gia đình khách đã hoàn tất lưu trú.', @now),
    (N'00000000-0000-0000-0000-000000000604', @booking4_id, NULL, NULL, N'PENDING', N'Đơn mới tạo, chờ xác nhận.', @now);

    INSERT INTO carts (
        id, user_id, room_id, promotion_id, check_in_date, check_out_date,
        adults, children, is_expired, expires_at, created_at, updated_at
    )
    VALUES
    (N'00000000-0000-0000-0000-000000000701', @customer1_id, @room302_id, @promo3_id, DATEADD(DAY, 14, CAST(GETDATE() AS DATE)), DATEADD(DAY, 17, CAST(GETDATE() AS DATE)), 2, 0, 0, DATEADD(HOUR, 2, @now), @now, @now),
    (N'00000000-0000-0000-0000-000000000702', @customer2_id, @room202_id, @promo1_id, DATEADD(DAY, 7, CAST(GETDATE() AS DATE)), DATEADD(DAY, 9, CAST(GETDATE() AS DATE)), 2, 1, 0, DATEADD(HOUR, 2, @now), @now, @now);

    INSERT INTO reviews (
        id, booking_id, user_id, room_id, rating_room, rating_service, rating_cleanliness,
        rating_location, rating_value, rating_overall, comment, images, status,
        admin_reply, admin_reply_at, created_at, updated_at
    )
    VALUES
    (N'00000000-0000-0000-0000-000000000801', @booking2_id, @customer2_id, @room201_id, 5, 5, 5, 4, 5, 4.8, N'Phòng sạch sẽ, dịch vụ tuyệt vời, nhân viên rất có tâm. Gia đình mình sẽ quay lại.', N'["/static/uploads/room_deluxe.png"]', N'APPROVED', N'Golden Place cảm ơn anh Quân đã tin tưởng lựa chọn khách sạn. Rất mong được đón gia đình mình trong kỳ nghỉ tiếp theo.', DATEADD(DAY, -4, @now), @now, @now),
    (N'00000000-0000-0000-0000-000000000802', @booking3_id, @customer3_id, @room401_id, 4, 5, 4, 5, 4, 4.4, N'Phòng Family rộng, tiện cho trẻ nhỏ. Bữa sáng ngon, khu vực hồ bơi đẹp.', N'["/static/uploads/room_family.png"]', N'PENDING', NULL, NULL, @now, @now);

    COMMIT TRANSACTION;
    PRINT N'Seed dữ liệu GoldenPlace thành công.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    DECLARE @message NVARCHAR(4000) = ERROR_MESSAGE();
    THROW 50002, @message, 1;
END CATCH;
GO
