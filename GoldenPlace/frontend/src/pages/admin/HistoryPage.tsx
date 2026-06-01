import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, CreditCard, Eye, FileText, Search, Star, WalletCards } from 'lucide-react'
import { useAdmin } from '../../hooks/useAdmin'
import { bookingStatusColor, bookingStatusLabel, calcNights, formatDateVI, formatVND } from '../../lib/utils'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const paymentLabels: Record<string, string> = {
  PAY_AT_HOTEL: 'Thanh toán tại khách sạn',
  BANK_TRANSFER: 'Chuyển khoản ngân hàng',
  VISA: 'Thẻ Visa / Mastercard',
  MOMO: 'Ví MoMo',
}

const paymentStatusLabels: Record<string, string> = {
  UNPAID: 'Chưa thanh toán',
  PAID: 'Đã thanh toán',
  PARTIAL: 'Thanh toán một phần',
  REFUNDED: 'Đã hoàn tiền',
}

export default function HistoryPage() {
  const { useGetBookingHistory } = useAdmin()
  const [searchQuery, setSearchQuery] = useState('')
  const { data, isLoading } = useGetBookingHistory({
    search: searchQuery || undefined,
    limit: 50,
  })

  const bookings = data?.items || []
  const completedCount = data?.summary?.completed ?? bookings.filter((booking: any) => booking.status === 'CHECKED_OUT').length
  const inactiveCount = data?.summary?.inactive ?? bookings.filter((booking: any) => ['CANCELLED', 'NO_SHOW'].includes(booking.status)).length
  const revenue = data?.summary?.revenue ?? bookings
    .filter((booking: any) => booking.status === 'CHECKED_OUT')
    .reduce((sum: number, booking: any) => sum + Number(booking.total_amount || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold uppercase tracking-wider text-white">Lịch sử lưu trú</h1>
        <p className="mt-1 text-xs text-[#a0a8c0]">
          Theo dõi các đơn đã check-out, đã hủy hoặc khách vắng mặt. Đơn mới từ khách hàng cần xử lý tại Quản lý đặt phòng.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-[#c9a84c]/10 bg-[#242840] p-5">
          <p className="text-xs uppercase text-[#a0a8c0]">Tổng lịch sử</p>
          <p className="mt-2 text-3xl font-bold text-white">{data?.total || bookings.length}</p>
        </div>
        <div className="rounded-xl border border-[#c9a84c]/10 bg-[#242840] p-5">
          <p className="text-xs uppercase text-[#a0a8c0]">Đã hoàn tất</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-3xl font-bold text-white">{completedCount}</p>
            <Star className="h-8 w-8 text-[#e8c96d]" />
          </div>
        </div>
        <div className="rounded-xl border border-[#c9a84c]/10 bg-[#242840] p-5">
          <p className="text-xs uppercase text-[#a0a8c0]">Doanh thu lưu trú</p>
          <p className="mt-2 text-2xl font-bold text-[#e8c96d]">{formatVND(revenue)}</p>
        </div>
        <div className="rounded-xl border border-[#c9a84c]/10 bg-[#242840] p-5">
          <p className="text-xs uppercase text-[#a0a8c0]">Hủy / vắng mặt</p>
          <p className="mt-2 text-3xl font-bold text-white">{inactiveCount}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 rounded-xl border border-[#c9a84c]/10 bg-[#242840] p-4 text-xs">
        <div className="min-w-[260px] flex-1 space-y-1">
          <label className="block font-semibold uppercase text-[#a0a8c0]">Tìm mã đơn hoặc tên khách</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a0a8c0]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="VD: HBS-20260521 hoặc Nguyễn Thị Hoa"
              className="w-full rounded border border-[#c9a84c]/20 bg-[#1a1f36] py-2 pl-9 pr-3 text-[#f5f0e8] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : bookings.length === 0 ? (
        <div className="rounded-xl border border-[#c9a84c]/10 bg-[#242840] p-8 text-center text-sm text-[#a0a8c0]">
          Chưa có lịch sử lưu trú. Khi admin chuyển đơn sang đã check-out, đã hủy hoặc vắng mặt, đơn sẽ tự xuất hiện ở đây.
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {bookings.map((booking: any) => (
            <article key={booking.id} className="rounded-xl border border-[#c9a84c]/10 bg-[#242840] p-5 text-sm shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#c9a84c]/10 pb-4">
                <div>
                  <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#e8c96d]">{booking.booking_code}</p>
                  <h3 className="mt-1 text-lg font-bold text-white">{booking.guest_name}</h3>
                  <p className="mt-1 text-xs text-[#a0a8c0]">{booking.guest_phone} · {booking.guest_email}</p>
                </div>
                <span className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase ${bookingStatusColor(booking.status)}`}>
                  {bookingStatusLabel(booking.status)}
                </span>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-3 text-[#a0a8c0]">
                  <p className="font-semibold text-white">Phòng {booking.room?.room_number || '-'} · {booking.room?.room_type?.name || 'Chưa có loại phòng'}</p>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#e8c96d]" />
                    {formatDateVI(booking.check_in_date)} - {formatDateVI(booking.check_out_date)}
                  </p>
                  <p>Số đêm: <span className="font-semibold text-white">{calcNights(booking.check_in_date, booking.check_out_date)}</span></p>
                </div>

                <div className="space-y-3 text-[#a0a8c0]">
                  <p className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-[#e8c96d]" />
                    {paymentLabels[booking.payment_method] || 'Chưa chọn thanh toán'}
                  </p>
                  <p className="flex items-center gap-2">
                    <WalletCards className="h-4 w-4 text-[#e8c96d]" />
                    {paymentStatusLabels[booking.payment_status] || 'Chưa thanh toán'}
                  </p>
                  <p className="text-xl font-bold text-[#e8c96d]">{formatVND(booking.total_amount)}</p>
                </div>
              </div>

              {booking.invoice_requested && (
                <div className="mt-4 rounded-lg border border-[#c9a84c]/10 bg-[#1a1f36] p-3 text-xs text-[#a0a8c0]">
                  <p className="mb-1 flex items-center gap-2 font-semibold uppercase text-white">
                    <FileText className="h-4 w-4 text-[#e8c96d]" />
                    Thông tin hóa đơn
                  </p>
                  <p>{booking.invoice_company_name || '-'}</p>
                  <p>MST: {booking.invoice_tax_code || '-'}</p>
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  to={`/admin/bookings?booking_code=${encodeURIComponent(booking.booking_code)}`}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded border border-[#c9a84c]/20 px-4 text-xs font-bold uppercase text-[#f5f0e8] hover:border-[#c9a84c]/50"
                >
                  <Eye className="h-4 w-4" />
                  Xem chi tiết
                </Link>
                <Link
                  to="/admin/invoices"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded bg-[#e8c96d] px-4 text-xs font-bold uppercase text-[#161a2b] hover:bg-[#f1d77a]"
                >
                  <FileText className="h-4 w-4" />
                  Hóa đơn
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
