import { Mail, MapPin, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="min-h-[351px] bg-[#101828] px-4 pt-16 text-white">
      <div className="mx-auto grid max-w-[1160px] grid-cols-1 gap-8 md:grid-cols-4">
        <div>
          <h3 className="text-[20px] font-bold uppercase leading-7 text-[#f0b100]">GOLDEN PLACE</h3>
          <p className="mt-4 max-w-[215px] text-[14px] leading-5 text-[#99a1af]">
            Mạng lưới khách sạn cao cấp hàng đầu Việt Nam
          </p>
        </div>

        <div>
          <h4 className="text-[16px] font-semibold leading-6 text-white">Hỗ trợ</h4>
          <ul className="mt-4 space-y-2 text-[14px] leading-5 text-[#99a1af]">
            <li><a href="#" className="hover:text-white">Trung tâm trợ giúp</a></li>
            <li><a href="#" className="hover:text-white">Chính sách hủy</a></li>
            <li><a href="#" className="hover:text-white">Điều khoản dịch vụ</a></li>
            <li><a href="#" className="hover:text-white">Chính sách bảo mật</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[16px] font-semibold leading-6 text-white">Liên hệ</h4>
          <ul className="mt-4 space-y-3 text-[14px] leading-5 text-[#99a1af]">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <span>123 Trần Hưng Đạo, Q.1, TP.HCM</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#99a1af]" />
              <span>1900 1234</span>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#99a1af]" />
              <span>info@goldenplace.vn</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-[16px] font-semibold leading-6 text-white">Phương thức thanh toán</h4>
          <div className="mt-4 flex gap-2">
            {['VISA', 'MASTERCARD', 'MOMO'].map((name) => (
              <span key={name} className="rounded bg-white px-3 py-2 text-[12px] font-semibold leading-4 text-[#101828]">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-[1160px] border-t border-[#1e2939] pt-8 text-center">
        <p className="text-[14px] leading-5 text-[#99a1af]">© 2026 Golden Place. All rights reserved.</p>
      </div>
    </footer>
  )
}
