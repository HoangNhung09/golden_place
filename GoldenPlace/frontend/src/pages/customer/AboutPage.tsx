import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function AboutPage() {
  useEffect(() => {
    document.title = 'Giới thiệu | GoldenPlace Hotel'
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 pt-8">
        
        {/* Breadcrumb */}
        <div className="text-xs mb-10 flex items-center space-x-2">
          <Link to="/" className="text-gray-500 hover:text-gray-900 transition-colors">
            Trang chủ
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-[#00a884] font-medium">Giới thiệu</span>
        </div>

        {/* Content */}
        <div className="w-full space-y-8">
          <h1 className="text-4xl font-serif text-gray-800">Giới thiệu</h1>
          
          <div className="space-y-6 text-sm text-gray-600 leading-relaxed font-medium">
            <p>
              Trong bối cảnh nhu cầu du lịch và nghỉ dưỡng ngày càng gia tăng, việc tìm kiếm và đặt phòng lưu trú một cách nhanh chóng, tiện lợi và đáng tin cậy trở thành mối quan tâm hàng đầu của du khách. Golden Place ra đời như một giải pháp công nghệ hiện đại, hỗ trợ người dùng dễ dàng tiếp cận các dịch vụ lưu trú chất lượng tại nhiều địa điểm du lịch khác nhau.
            </p>
            <p>
              Golden Place là trang web đặt phòng du lịch trực tuyến, cho phép khách hàng tìm kiếm, so sánh và đặt phòng khách sạn, homestay, resort một cách thuận tiện thông qua nền tảng web. Với giao diện thân thiện, trực quan và khả năng hiển thị tối ưu trên nhiều thiết bị, Golden Place mang đến trải nghiệm người dùng mượt mà và hiệu quả.
            </p>
            <p>
              Hệ thống của Golden Place cung cấp đầy đủ thông tin về phòng ở như: hình ảnh, giá cả, vị trí, tiện nghi, đánh giá từ khách hàng trước đó, giúp người dùng đưa ra quyết định phù hợp với nhu cầu và ngân sách của mình. Bên cạnh đó, quy trình đặt phòng được thiết kế đơn giản, nhanh gọn và an toàn, góp phần tiết kiệm thời gian cho khách hàng.
            </p>
            <p>
              Không chỉ phục vụ người dùng cuối, Golden Place còn hỗ trợ các đối tác lưu trú trong việc quản lý phòng, cập nhật thông tin và tiếp cận khách hàng tiềm năng một cách hiệu quả. Qua đó, nền tảng đóng vai trò là cầu nối giữa khách hàng và nhà cung cấp dịch vụ du lịch, góp phần thúc đẩy sự phát triển của ngành du lịch trong thời đại số.
            </p>
            <p>
              Với định hướng lấy người dùng làm trung tâm và ứng dụng công nghệ thông tin vào quản lý và vận hành, Golden Place hướng tới mục tiêu trở thành một trong những nền tảng đặt phòng du lịch trực tuyến đáng tin cậy, mang lại giá trị thiết thực cho cả khách hàng và đối tác.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
