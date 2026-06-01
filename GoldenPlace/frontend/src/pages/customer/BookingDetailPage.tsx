import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Calendar, Check, CheckCircle2, Clock, CreditCard, Mail, MapPin, MessageSquare, Phone, Printer, Receipt, User, Users } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useBookings } from '../../hooks/useBookings'
import { bookingStatusLabel, calcNights, formatDateVI, formatVND, getRoomPrimaryImage, paymentStatusLabel } from '../../lib/utils'
import StarRating from '../../components/common/StarRating'

const statusConfig: Record<string, { className: string }> = {
  PENDING: { className: 'bg-[#f5b400] text-white' },
  CONFIRMED: { className: 'bg-[#f5b400] text-white' },
  CHECKED_IN: { className: 'bg-[#2f73ff] text-white' },
  CHECKED_OUT: { className: 'bg-[#04c56a] text-white' },
  CANCELLED: { className: 'bg-[#ff3045] text-white' },
  NO_SHOW: { className: 'bg-[#ff3045] text-white' },
}

const paymentLabels: Record<string, string> = {
  PAY_AT_HOTEL: 'Thanh toán tại khách sạn',
  BANK_TRANSFER: 'Chuyển khoản ngân hàng',
  VISA: 'Thẻ Visa / Mastercard',
  MOMO: 'Ví MoMo',
}

function money(amount: number) {
  return formatVND(amount).replace(/\s/g, '').replace('₫', ' đ')
}

function SummaryIcon({ icon, title, value, note }: { icon: ReactNode; title: string; value: string; note?: string }) {
  return (
    <div className="flex gap-4">
      <div className="mt-1 text-[#e5a700] [&>svg]:h-5 [&>svg]:w-5">{icon}</div>
      <div>
        <p className="text-[14px] text-gray-500">{title}</p>
        <p className="text-[16px] font-semibold text-gray-950">{value}</p>
        {note && <p className="mt-1 text-[13px] text-gray-400">{note}</p>}
      </div>
    </div>
  )
}

function CustomerRow({ icon, label, value }: { icon: ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
      <div className="text-gray-400 [&>svg]:h-5 [&>svg]:w-5">{icon}</div>
      <div>
        <p className="text-[13px] text-gray-500">{label}</p>
        <p className="text-[15px] font-semibold text-gray-950">{value || '-'}</p>
      </div>
    </div>
  )
}

function SummaryLine({ label, value, valueClassName = '' }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <strong className={`text-right text-gray-950 ${valueClassName}`}>{value}</strong>
    </div>
  )
}

export default function BookingDetailPage() {
  const { bookingCode } = useParams<{ bookingCode: string }>()
  const navigate = useNavigate()
  const { useGetBookingDetail, cancelBooking, isCancelling, createReview, isCreatingReview } = useBookings()
  const { data: booking, isLoading, refetch } = useGetBookingDetail(bookingCode || '')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [cancellationReason, setCancellationReason] = useState('')
  const [cancelError, setCancelError] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')
  const [reviewComment, setReviewComment] = useState('')
  const [reviewRatings, setReviewRatings] = useState({
    rating_room: 5,
    rating_service: 5,
    rating_cleanliness: 5,
    rating_location: 5,
    rating_value: 5,
  })

  useEffect(() => {
    document.title = bookingCode ? `Chi tiết đặt phòng ${bookingCode} | Golden Place` : 'Chi tiết đặt phòng | Golden Place'
    window.scrollTo(0, 0)
  }, [bookingCode])

  if (isLoading) return <LoadingSpinner fullPage />

  if (!booking) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-xl font-bold text-gray-950">Đơn đặt phòng không tồn tại</h1>
        <button onClick={() => navigate('/bookings')} className="mt-6 rounded-md bg-[#f5b400] px-6 py-3 text-sm font-bold text-white">
          Quay lại lịch sử đặt phòng
        </button>
      </div>
    )
  }

  const nights = calcNights(booking.check_in_date, booking.check_out_date)
  const roomName = booking.room?.room_type?.name || 'Phòng cao cấp'
  const roomTotal = booking.room_price_snapshot * nights
  const amenities = booking.room?.amenities?.length ? booking.room.amenities : ['WiFi miễn phí', 'Bữa sáng', 'Hồ bơi', 'Gym', 'Spa']
  const badge = statusConfig[booking.status] || statusConfig.PENDING
  const services = booking.booking_services || []
  const guestCount = Number(booking.adults || 0) + Number(booking.children || 0)
  const canCancel = booking.status === 'PENDING' || booking.status === 'CONFIRMED'
  const canReview = booking.status === 'CHECKED_OUT'

  const handleCancelBooking = async (event: FormEvent) => {
    event.preventDefault()
    setCancelError('')

    if (!cancellationReason.trim()) {
      setCancelError('Vui lòng nhập lý do hủy đặt phòng.')
      return
    }

    try {
      await cancelBooking({ bookingCode: booking.booking_code, reason: cancellationReason })
      setShowCancelModal(false)
      setCancellationReason('')
      refetch()
    } catch (err: any) {
      setCancelError(err.response?.data?.detail || 'Không thể hủy đặt phòng.')
    }
  }

  const handleSubmitReview = async (event: FormEvent) => {
    event.preventDefault()
    setReviewError('')
    setReviewSuccess('')

    try {
      await createReview({
        booking_id: booking.id,
        ...reviewRatings,
        comment: reviewComment.trim() || undefined,
        images: [],
      })
      setReviewSuccess('Cảm ơn bạn đã gửi đánh giá. Đánh giá sẽ hiển thị sau khi admin duyệt.')
      setReviewComment('')
      window.setTimeout(() => setShowReviewModal(false), 900)
    } catch (err: any) {
      setReviewError(err.response?.data?.detail || 'Không thể gửi đánh giá. Vui lòng thử lại.')
    }
  }

  const updateRating = (key: keyof typeof reviewRatings, value: number) => {
    setReviewRatings((current) => ({ ...current, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      <main className="mx-auto max-w-[990px] px-4 pb-24 pt-8">
        <div className="mb-5 text-sm">
          <Link to="/bookings" className="font-semibold text-[#d98a00]">Lịch sử đặt phòng</Link>
          <span className="mx-2 text-gray-300">/</span>
          <span className="text-gray-600">{booking.booking_code}</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_315px]">
          <div className="space-y-6">
            <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <img src={getRoomPrimaryImage(booking.room?.images || [])} alt={roomName} className="h-[250px] w-full object-cover" />

              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-[25px] font-bold leading-8 text-gray-950">Golden Place</h1>
                    <p className="mt-2 text-[18px] text-gray-600">{roomName}</p>
                  </div>
                  <span className={`rounded-md px-3 py-1 text-[13px] font-semibold ${badge.className}`}>{bookingStatusLabel(booking.status)}</span>
                </div>

                <div className="mt-5 flex items-center gap-3 text-[16px] text-gray-600">
                  <MapPin className="h-5 w-5 text-[#e5a700]" />
                  <span>Đà Nẵng, Việt Nam</span>
                </div>

                <div className="mt-6 grid gap-8 border-t border-gray-200 pt-5 sm:grid-cols-2">
                  <SummaryIcon icon={<Calendar />} title="Nhận phòng" value={formatDateVI(booking.check_in_date)} note="Từ 14:00" />
                  <SummaryIcon icon={<Calendar />} title="Trả phòng" value={formatDateVI(booking.check_out_date)} note="Trước 12:00" />
                  <SummaryIcon icon={<Clock />} title="Thời gian lưu trú" value={`${nights} đêm`} />
                  <SummaryIcon icon={<Users />} title="Số khách" value={`${guestCount || 1} người`} />
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-7 text-[18px] font-semibold text-gray-950">Thông tin khách hàng</h2>
              <div className="divide-y divide-gray-200">
                <CustomerRow icon={<User />} label="Tên khách hàng" value={booking.guest_name} />
                <CustomerRow icon={<Mail />} label="Email" value={booking.guest_email} />
                <CustomerRow icon={<Phone />} label="Số điện thoại" value={booking.guest_phone} />
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-7 text-[18px] font-semibold text-gray-950">Tiện nghi</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                {amenities.slice(0, 6).map((item) => (
                  <div key={item} className="flex items-center gap-3 text-[16px] text-gray-600">
                    <CheckCircle2 className="h-5 w-5 text-[#04c56a]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {booking.special_requests && (
              <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-3 text-[18px] font-semibold text-gray-950">Yêu cầu đặc biệt</h2>
                <p className="text-[15px] text-gray-600">{booking.special_requests}</p>
              </section>
            )}
          </div>

          <aside className="space-y-6">
            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-7 text-[18px] font-semibold text-gray-950">Tóm tắt đặt phòng</h2>

              <div className="space-y-5 text-[15px]">
                <SummaryLine label="Mã đặt phòng" value={booking.booking_code} valueClassName="text-[18px]" />
                <SummaryLine label="Ngày đặt phòng" value={formatDateVI(booking.created_at || booking.check_in_date)} />

                <div className="border-t border-gray-200 pt-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-gray-600">{roomName}</p>
                      <p className="mt-1 text-gray-500">x {nights} đêm</p>
                    </div>
                    <strong>{money(roomTotal)}</strong>
                  </div>
                </div>

                {services.length > 0 && services.map((service) => (
                  <div key={service.id} className="flex justify-between text-gray-600">
                    <span>{service.service?.name || 'Dịch vụ'} x {service.quantity}</span>
                    <strong className="text-gray-950">{money(service.subtotal)}</strong>
                  </div>
                ))}

                <div className="flex justify-between border-t border-gray-200 pt-5 text-[16px]">
                  <span>Phí dịch vụ</span>
                  <strong>{money(booking.services_amount || 0)}</strong>
                </div>

                {booking.discount_amount > 0 && (
                  <div className="flex justify-between text-[#04a85a]">
                    <span>Khuyến mãi</span>
                    <strong>-{money(booking.discount_amount)}</strong>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-gray-200 pt-5">
                  <strong className="text-[20px] text-gray-950">Tổng cộng</strong>
                  <strong className="text-[25px] text-[#d98a00]">{money(booking.total_amount)}</strong>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-7 text-[18px] font-semibold text-gray-950">Thông tin thanh toán</h2>
              <div className="space-y-5">
                <div className="flex gap-4">
                  <CreditCard className="mt-1 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-[14px] text-gray-500">Phương thức</p>
                    <p className="text-[16px] font-semibold text-gray-950">{paymentLabels[booking.payment_method] || 'Thanh toán tại khách sạn'}</p>
                  </div>
                </div>
                <div className="flex gap-4 border-t border-gray-200 pt-5">
                  <Check className="mt-1 h-5 w-5 text-[#04c56a]" />
                  <div>
                    <p className="text-[14px] text-gray-500">Trạng thái</p>
                    <p className="text-[16px] font-semibold text-[#04a85a]">{paymentStatusLabel(booking.payment_status || 'UNPAID')}</p>
                  </div>
                </div>
              </div>
            </section>

            {booking.invoice_requested && (
              <section className="rounded-lg border border-[#f1d27a] bg-[#fff9e6] p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-[18px] font-semibold text-gray-950">
                  <Receipt className="h-5 w-5 text-[#d98a00]" />
                  Thông tin hóa đơn
                </h2>
                <div className="space-y-2 text-[14px] text-gray-700">
                  <p>Công ty: <strong>{booking.invoice_company_name}</strong></p>
                  <p>Mã số thuế: <strong>{booking.invoice_tax_code}</strong></p>
                  <p>Địa chỉ: <strong>{booking.invoice_company_address}</strong></p>
                </div>
              </section>
            )}

            <button className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#f5b400] text-[14px] font-semibold text-white">
              <Printer className="h-4 w-4" />
              <span>In phiếu đặt phòng</span>
            </button>
            <button className="h-10 w-full rounded-md border border-gray-200 bg-white text-[14px] font-semibold text-gray-950">
              Liên hệ khách sạn
            </button>
            {canReview && (
              <button onClick={() => setShowReviewModal(true)} className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[#f5b400] bg-white text-[14px] font-semibold text-[#d98a00]">
                <MessageSquare className="h-4 w-4" />
                Viết đánh giá
              </button>
            )}
            {canCancel && (
              <button onClick={() => setShowCancelModal(true)} className="h-10 w-full rounded-md border border-red-200 bg-white text-[14px] font-semibold text-red-600">
                Hủy đặt phòng
              </button>
            )}
          </aside>
        </div>
      </main>

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <form onSubmit={handleCancelBooking} className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-950">Hủy đặt phòng</h2>
            <p className="mt-2 text-sm text-gray-500">Vui lòng nhập lý do hủy để khách sạn xử lý yêu cầu của bạn.</p>
            <textarea
              value={cancellationReason}
              onChange={(event) => setCancellationReason(event.target.value)}
              rows={4}
              className="mt-4 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#f5b400]"
              placeholder="Nhập lý do hủy..."
            />
            {cancelError && <p className="mt-2 text-sm text-red-500">{cancelError}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setShowCancelModal(false)} className="rounded-md border px-4 py-2 text-sm font-semibold text-gray-700">Đóng</button>
              <button disabled={isCancelling} className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {isCancelling ? 'Đang xử lý...' : 'Xác nhận hủy'}
              </button>
            </div>
          </form>
        </div>
      )}

      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <form onSubmit={handleSubmitReview} className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-950">Viết đánh giá</h2>
                <p className="mt-2 text-sm text-gray-500">Chia sẻ trải nghiệm của bạn sau kỳ nghỉ tại phòng {booking.room?.room_number || '-'}.</p>
              </div>
              <button type="button" onClick={() => setShowReviewModal(false)} className="rounded-md border px-3 py-1 text-sm font-semibold text-gray-600">
                Đóng
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <ReviewRatingRow label="Phòng" value={reviewRatings.rating_room} onChange={(value) => updateRating('rating_room', value)} />
              <ReviewRatingRow label="Dịch vụ" value={reviewRatings.rating_service} onChange={(value) => updateRating('rating_service', value)} />
              <ReviewRatingRow label="Vệ sinh" value={reviewRatings.rating_cleanliness} onChange={(value) => updateRating('rating_cleanliness', value)} />
              <ReviewRatingRow label="Vị trí" value={reviewRatings.rating_location} onChange={(value) => updateRating('rating_location', value)} />
              <ReviewRatingRow label="Giá trị" value={reviewRatings.rating_value} onChange={(value) => updateRating('rating_value', value)} />
            </div>

            <label className="mt-5 block">
              <span className="text-sm font-semibold text-gray-700">Nội dung đánh giá</span>
              <textarea
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
                rows={5}
                className="mt-2 w-full resize-none rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#f5b400]"
                placeholder="Nhập cảm nhận của bạn về phòng, dịch vụ và trải nghiệm lưu trú..."
              />
            </label>

            {reviewError && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{reviewError}</p>}
            {reviewSuccess && <p className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{reviewSuccess}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowReviewModal(false)} className="rounded-md border px-4 py-2 text-sm font-semibold text-gray-700">Hủy</button>
              <button disabled={isCreatingReview} className="rounded-md bg-[#f5b400] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {isCreatingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function ReviewRatingRow({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-gray-200 px-4 py-3">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <StarRating rating={value} interactive onRatingChange={onChange} size={22} />
    </div>
  )
}
