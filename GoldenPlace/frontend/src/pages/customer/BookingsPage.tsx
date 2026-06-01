import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, ChevronRight, MapPin, MessageSquare, Users } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useBookings } from '../../hooks/useBookings'
import { calcNights, formatDateVI, formatVND, getRoomPrimaryImage } from '../../lib/utils'

const statusMap: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Chờ xác nhận', className: 'bg-[#f5b400] text-white' },
  CONFIRMED: { label: 'Đã xác nhận', className: 'bg-[#f5b400] text-white' },
  CHECKED_IN: { label: 'Đã check-in', className: 'bg-[#2f73ff] text-white' },
  CHECKED_OUT: { label: 'Đã hoàn thành', className: 'bg-[#04c56a] text-white' },
  CANCELLED: { label: 'Đã hủy', className: 'bg-[#ff3045] text-white' },
  NO_SHOW: { label: 'Vắng mặt', className: 'bg-[#ff3045] text-white' },
}

function amountText(amount: number) {
  return formatVND(amount).replace(/\s/g, '').replace('₫', ' đ')
}

export default function BookingsPage() {
  const [status] = useState('')
  const { useGetMyBookings } = useBookings()
  const { data: bookings, isLoading } = useGetMyBookings(status || undefined)

  useEffect(() => {
    document.title = 'Lịch sử đặt phòng | Golden Place'
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      <main className="mx-auto max-w-[1030px] px-4 pb-20 pt-12">
        <h1 className="mb-8 text-[32px] font-bold leading-10 text-gray-950">Lịch sử đặt phòng</h1>

        {isLoading ? (
          <div className="py-24"><LoadingSpinner /></div>
        ) : bookings && bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking: any) => {
              const badge = statusMap[booking.status] || statusMap.PENDING
              const guests = Number(booking.adults || 0) + Number(booking.children || 0)
              const roomName = booking.room?.room_type?.name || 'Phòng cao cấp'
              const nights = calcNights(booking.check_in_date, booking.check_out_date)
              const canReview = booking.status === 'CHECKED_OUT'

              return (
                <article key={booking.id} className="grid overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm md:grid-cols-[256px_1fr]">
                  <img
                    src={getRoomPrimaryImage(booking.room?.images || [])}
                    alt={roomName}
                    className="h-[245px] w-full object-cover md:h-full"
                  />

                  <div className="grid gap-5 p-6 md:grid-cols-[1fr_190px]">
                    <div>
                      <h2 className="text-[21px] font-bold leading-7 text-gray-950">Golden Place</h2>
                      <p className="mt-2 text-[16px] text-gray-600">{roomName}</p>
                      <div className="mt-4 flex items-center gap-2 text-[14px] text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>Đà Nẵng, Việt Nam</span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-[14px] text-gray-700">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#e5a700]" />
                          <span><strong>Nhận phòng:</strong> {formatDateVI(booking.check_in_date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#e5a700]" />
                          <span><strong>Trả phòng:</strong> {formatDateVI(booking.check_out_date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-[#e5a700]" />
                          <span><strong>Số khách:</strong> {guests || 1} người</span>
                        </div>
                      </div>

                      <p className="mt-6 text-[14px] text-gray-600">
                        Mã đặt phòng: <strong>{booking.booking_code}</strong>
                      </p>
                      <p className="mt-1 text-[13px] text-gray-500">Thời gian lưu trú: {nights} đêm</p>
                    </div>

                    <div className="flex flex-col items-start md:items-end">
                      <span className={`rounded-md px-3 py-1 text-[13px] font-semibold ${badge.className}`}>{badge.label}</span>
                      <span className="mt-4 text-[14px] text-gray-500">Tổng tiền</span>
                      <strong className="mt-1 text-[25px] leading-8 text-[#d98a00]">{amountText(booking.total_amount)}</strong>
                      <Link
                        to={`/bookings/${booking.booking_code}`}
                        className="mt-5 flex h-9 items-center gap-3 rounded-md bg-[#f5b400] px-5 text-[14px] font-semibold text-white transition hover:bg-[#e1a500]"
                      >
                        <span>Xem chi tiết</span>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                      {canReview && (
                        <Link
                          to={`/bookings/${booking.booking_code}`}
                          className="mt-3 flex h-9 items-center gap-2 rounded-md border border-[#f5b400] bg-white px-4 text-[14px] font-semibold text-[#d98a00] transition hover:bg-[#fff7d6]"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>Viết đánh giá</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white py-20 text-center text-sm text-gray-500">
            Không tìm thấy đơn đặt phòng nào.
          </div>
        )}
      </main>
    </div>
  )
}
