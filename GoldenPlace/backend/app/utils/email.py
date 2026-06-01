import logging
from typing import Dict, Any
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from pydantic import EmailStr
from app.config import settings

logger = logging.getLogger(__name__)

# SMTP Connection Configuration
conf = ConnectionConfig(
    MAIL_USERNAME=settings.SMTP_USERNAME,
    MAIL_PASSWORD=settings.SMTP_PASSWORD,
    MAIL_FROM=settings.SMTP_FROM_EMAIL,
    MAIL_PORT=settings.SMTP_PORT,
    MAIL_SERVER=settings.SMTP_HOST,
    MAIL_FROM_NAME=settings.SMTP_FROM_NAME,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=bool(settings.SMTP_USERNAME and settings.SMTP_PASSWORD),
    VALIDATE_CERTS=True
)

async def send_html_email(subject: str, recipient: EmailStr, body: str):
    """Gửi email HTML qua SMTP, nếu không có config thì in ra log."""
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        logger.info("=== [MOCK EMAIL SENT] ===")
        logger.info(f"To: {recipient}")
        logger.info(f"Subject: {subject}")
        logger.info("Content (truncated):")
        logger.info(body[:300] + "...")
        logger.info("=========================")
        return True
        
    try:
        message = MessageSchema(
            subject=subject,
            recipients=[recipient],
            body=body,
            subtype=MessageType.html
        )
        fm = FastMail(conf)
        await fm.send_message(message)
        logger.info(f"Email successfully sent to {recipient}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {recipient}: {e}")
        return False

# Templates HTML
def get_verification_email_body(full_name: str, verification_link: str) -> str:
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <h2 style="color: #c9a84c; text-align: center; border-bottom: 2px solid #f5f0e8; padding-bottom: 15px;">GoldenPlace Hotel</h2>
            <p>Xin chào <strong>{full_name}</strong>,</p>
            <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>GoldenPlace Hotel</strong>. Vui lòng bấm vào nút dưới đây để xác thực địa chỉ email của bạn:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{verification_link}" style="background-color: #1a1f36; color: #f5f0e8; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; border: 1px solid #c9a84c;">Xác thực tài khoản</a>
            </div>
            <p>Nếu nút trên không hoạt động, bạn có thể copy link sau và dán vào trình duyệt:</p>
            <p style="word-break: break-all; color: #666;"><a href="{verification_link}">{verification_link}</a></p>
            <p>Link này sẽ hết hạn sau 24 giờ.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">Đây là email tự động, vui lòng không phản hồi email này.</p>
        </div>
    </body>
    </html>
    """

def get_booking_confirmation_email_body(booking_data: Dict[str, Any]) -> str:
    services_list = ""
    for s in booking_data.get("services", []):
        services_list += f"<li>{s['name']} (x{s['quantity']}): {s['subtotal']:,.0f} VND</li>"
    if not services_list:
        services_list = "<li>Không kèm dịch vụ</li>"

    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <h2 style="color: #c9a84c; text-align: center; border-bottom: 2px solid #f5f0e8; padding-bottom: 15px;">GoldenPlace Hotel</h2>
            <h3 style="color: #1a1f36; text-align: center;">Xác nhận yêu cầu đặt phòng thành công!</h3>
            <p>Kính chào <strong>{booking_data['guest_name']}</strong>,</p>
            <p>Cảm ơn bạn đã lựa chọn GoldenPlace Hotel. Yêu cầu đặt phòng của bạn đã được tiếp nhận ở trạng thái <strong>CHỜ XÁC NHẬN (PENDING)</strong>. Dưới đây là thông tin chi tiết:</p>
            
            <div style="background-color: #fafafa; padding: 20px; border-radius: 6px; border: 1px solid #eee; margin: 20px 0;">
                <p><strong>Mã đặt phòng:</strong> <span style="font-family: monospace; font-size: 16px; font-weight: bold; color: #c9a84c;">{booking_data['booking_code']}</span></p>
                <p><strong>Phòng:</strong> Số {booking_data['room_number']} ({booking_data['room_type']})</p>
                <p><strong>Check-in:</strong> {booking_data['check_in_date']}</p>
                <p><strong>Check-out:</strong> {booking_data['check_out_date']}</p>
                <p><strong>Số lượng khách:</strong> {booking_data['adults']} người lớn, {booking_data['children']} trẻ em</p>
                <p><strong>Dịch vụ kèm theo:</strong></p>
                <ul style="margin: 5px 0; padding-left: 20px;">
                    {services_list}
                </ul>
            </div>
            
            <div style="text-align: right; font-size: 18px; margin: 20px 0;">
                <strong>Tổng thanh toán tại khách sạn:</strong> <span style="color: #c9a84c; font-weight: bold;">{booking_data['total_amount']:,.0f} VND</span>
            </div>
            
            <p><strong>Chính sách hủy phòng:</strong> Miễn phí hủy phòng trước check-in ít nhất 24 giờ. Quý khách vui lòng liên hệ khách sạn nếu có thay đổi đột xuất.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{settings.FRONTEND_URL}/booking/confirmation/{booking_data['booking_code']}" style="background-color: #1a1f36; color: #f5f0e8; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; border: 1px solid #c9a84c;">Xem chi tiết Booking</a>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">Rất hân hạnh được phục vụ quý khách tại GoldenPlace Hotel!</p>
        </div>
    </body>
    </html>
    """

def get_cancellation_email_body(booking_data: Dict[str, Any]) -> str:
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <h2 style="color: #f44336; text-align: center; border-bottom: 2px solid #f5f0e8; padding-bottom: 15px;">GoldenPlace Hotel</h2>
            <h3 style="color: #1a1f36; text-align: center;">Đơn đặt phòng của bạn đã bị hủy</h3>
            <p>Kính chào <strong>{booking_data['guest_name']}</strong>,</p>
            <p>Hệ thống ghi nhận đơn đặt phòng mã <strong style="color: #c9a84c;">{booking_data['booking_code']}</strong> của quý khách đã được hủy thành công.</p>
            
            <div style="background-color: #fafafa; padding: 20px; border-radius: 6px; border: 1px solid #eee; margin: 20px 0;">
                <p><strong>Chi tiết phòng hủy:</strong> Phòng {booking_data['room_number']} ({booking_data['room_type']})</p>
                <p><strong>Lý do hủy:</strong> {booking_data.get('cancellation_reason', 'Không có lý do cụ thể')}</p>
                <p><strong>Ngày Check-in dự kiến:</strong> {booking_data['check_in_date']}</p>
            </div>
            
            <p>Nếu đây là sự nhầm lẫn hoặc bạn muốn tìm kiếm phòng khác, hãy truy cập website của chúng tôi:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{settings.FRONTEND_URL}/rooms" style="background-color: #1a1f36; color: #f5f0e8; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; border: 1px solid #c9a84c;">Tìm phòng mới</a>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">GoldenPlace Hotel luôn sẵn lòng phục vụ quý khách lần sau.</p>
        </div>
    </body>
    </html>
    """

def get_password_reset_email_body(email: str, reset_link: str) -> str:
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <h2 style="color: #c9a84c; text-align: center; border-bottom: 2px solid #f5f0e8; padding-bottom: 15px;">GoldenPlace Hotel</h2>
            <p>Xin chào,</p>
            <p>Bạn nhận được email này vì hệ thống nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với địa chỉ email: <strong>{email}</strong>.</p>
            <p>Bấm vào nút bên dưới để tiến hành đặt mật khẩu mới (link có hiệu lực trong vòng 15 phút):</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}" style="background-color: #1a1f36; color: #f5f0e8; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; border: 1px solid #c9a84c;">Đặt lại mật khẩu</a>
            </div>
            <p>Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua email này.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">Đây là email tự động, vui lòng không phản hồi email này.</p>
        </div>
    </body>
    </html>
    """

def get_review_invitation_email_body(booking_data: Dict[str, Any]) -> str:
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <h2 style="color: #c9a84c; text-align: center; border-bottom: 2px solid #f5f0e8; padding-bottom: 15px;">GoldenPlace Hotel</h2>
            <p>Xin chào <strong>{booking_data['guest_name']}</strong>,</p>
            <p>Hy vọng quý khách đã có khoảng thời gian nghỉ dưỡng tuyệt vời tại <strong>GoldenPlace Hotel</strong>.</p>
            <p>Chúng tôi rất mong nhận được những đánh giá, góp ý chân thành từ quý khách về chất lượng dịch vụ của phòng {booking_data['room_number']} mà quý khách đã lưu trú vừa qua:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{settings.FRONTEND_URL}/profile/bookings/{booking_data['booking_code']}" style="background-color: #1a1f36; color: #f5f0e8; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; border: 1px solid #c9a84c;">Đánh giá dịch vụ</a>
            </div>
            <p>Ý kiến phản hồi của quý khách là động lực to lớn giúp chúng tôi hoàn thiện chất lượng phục vụ mỗi ngày.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">Cảm ơn quý khách và chúc quý khách nhiều sức khỏe!</p>
        </div>
    </body>
    </html>
    """
