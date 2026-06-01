import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertCircle, ChevronRight, CreditCard, Receipt, X } from 'lucide-react'
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

export default function BookingsPage() {
  const [searchParams] = useSearchParams()
  const { useGetAdminBookings, updateBookingStatus, isUpdatingBookingStatus } = useAdmin()

  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('booking_code') || '')
  const [page, setPage] = useState(1)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [statusNote, setStatusNote] = useState('')
  const [statusError, setStatusError] = useState('')

  const { data: bookingsData, isLoading, refetch } = useGetAdminBookings({
    status: statusFilter || undefined,
    search: searchQuery || undefined,
    page,
    limit: 10,
  })

  useEffect(() => {
    document.title = 'Quản lý đơn đặt phòng | Admin GoldenPlace'
  }, [])

  const rows = bookingsData?.items || []

  const openDetail = (booking: any) => {
    setSelectedBooking(booking)
    setStatusNote('')
    setStatusError('')
    setShowDetailModal(true)
  }

  const updateStatus = async (booking: any, newStatus: string, closeModal = false) => {
    setStatusError('')
    if (!window.confirm(`Chuyển đơn ${booking.booking_code} sang trạng thái: ${bookingStatusLabel(newStatus)}?`)) return

    try {
      await updateBookingStatus({
        id: booking.id,
        status: newStatus,
        note: statusNote || (newStatus === 'CONFIRMED' ? 'Admin duyệt đơn đặt phòng' : undefined),
      })
      if (closeModal) setShowDetailModal(false)
      await refetch()
    } catch (err: any) {
      setStatusError(err.response?.data?.detail || 'Không thể cập nhật trạng thái đơn đặt phòng.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0f172a]">Quản lý đơn đặt phòng</h2>
        <p className="mt-2 text-sm text-[#475569]">
          Đơn khách vừa đặt sẽ nằm ở đây với trạng thái chờ xác nhận. Admin duyệt đơn trước khi khách check-in.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 rounded-lg border border-[#e5e7eb] bg-white p-4 text-xs shadow-sm">
        <div className="space-y-1">
          <label className="block font-semibold uppercase text-[#475569]">Trạng thái đơn</label>
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value)
              setPage(1)
            }}
            className="rounded border border-[#dbe1ea] bg-white px-3 py-2 text-[#0f172a] focus:border-[#f2c94c] focus:outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="CHECKED_IN">Đã check-in</option>
            <option value="CHECKED_OUT">Đã check-out</option>
            <option value="CANCELLED">Đã hủy</option>
            <option value="NO_SHOW">Vắng mặt</option>
          </select>
        </div>

        <div className="min-w-[220px] flex-1 space-y-1">
          <label className="block font-semibold uppercase text-[#475569]">Tìm mã đơn hoặc tên khách</label>
          <input
            type="text"
            placeholder="VD: HBS-20260520 hoặc Nguyễn Thị Hoa"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value)
              setPage(1)
            }}
            className="w-full rounded border border-[#dbe1ea] bg-white px-3 py-2 text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#f2c94c] focus:outline-none"
          />
        </div>
      </div>

      {statusError && !showDetailModal && (
        <div className="flex items-center gap-2 rounded border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
          <AlertCircle className="h-4 w-4" />
          <span>{statusError}</span>
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-xs text-[#475569]">
            <thead className="border-b border-[#e5e7eb] bg-[#fafafa] font-semibold uppercase text-[#334155]">
              <tr>
                <th className="p-4">Mã đơn</th>
                <th className="p-4">Khách lưu trú</th>
                <th className="p-4">Phòng</th>
                <th className="p-4">Thời gian</th>
                <th className="p-4">Thanh toán</th>
                <th className="p-4">Tổng tiền</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c9a84c]/10">
              {rows.length > 0 ? (
                rows.map((booking: any) => (
                  <tr key={booking.id} className="border-b border-[#edf0f4] last:border-b-0 hover:bg-[#f8fafc]">
                    <td className="p-4 font-mono font-bold tracking-wider text-[#0f172a]">{booking.booking_code}</td>
                    <td className="p-4">
                      <p className="font-semibold text-[#0f172a]">{booking.guest_name}</p>
                      <p className="text-[10px] text-[#64748b]">{booking.guest_phone}</p>
                    </td>
                    <td className="p-4 font-semibold text-[#0f172a]">Phòng {booking.room?.room_number || '-'}</td>
                    <td className="p-4">{formatDateVI(booking.check_in_date)} - {formatDateVI(booking.check_out_date)}</td>
                    <td className="p-4">
                      <p className="font-semibold text-[#0f172a]">{paymentLabels[booking.payment_method] || '-'}</p>
                      <p className="text-[10px]">{paymentStatusLabels[booking.payment_status] || 'Chưa thanh toán'}</p>
                    </td>
                    <td className="p-4 font-semibold text-[#d29a00]">{formatVND(booking.total_amount)}</td>
                    <td className="p-4">
                      <span className={`whitespace-nowrap rounded px-2.5 py-0.5 text-[9px] font-bold uppercase ${bookingStatusColor(booking.status)}`}>
                        {bookingStatusLabel(booking.status)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {booking.status === 'PENDING' && (
                          <button
                            onClick={() => updateStatus(booking, 'CONFIRMED')}
                            disabled={isUpdatingBookingStatus}
                            className="whitespace-nowrap rounded bg-green-600 px-3 py-2 text-[10px] font-bold uppercase text-white hover:bg-green-700 disabled:opacity-60"
                          >
                            Duyệt
                          </button>
                        )}
                        <button
                          onClick={() => openDetail(booking)}
                          className="inline-flex items-center gap-1 whitespace-nowrap rounded border border-[#f2c94c] px-3 py-2 text-[10px] font-bold uppercase text-[#9a6b00] hover:bg-[#fff7d6]"
                          title="Xem chi tiết đơn đặt phòng"
                        >
                          Chi tiết
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-10 text-center italic">Không tìm thấy đơn đặt phòng nào phù hợp.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={() => setShowDetailModal(false)} />
          <div className="relative z-10 mx-4 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-[#e5e7eb] bg-white p-6 text-[#0f172a] shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-[#e5e7eb] pb-4">
              <div>
                <span className="text-[10px] uppercase text-[#64748b]">Mã đặt phòng</span>
                <h3 className="mt-0.5 font-mono text-lg font-bold text-[#0f172a]">{selectedBooking.booking_code}</h3>
              </div>
              <button onClick={() => setShowDetailModal(false)}>
                <X className="h-5 w-5 text-[#64748b] hover:text-[#0f172a]" />
              </button>
            </div>

            {statusError && (
              <div className="mb-4 flex items-center gap-2 rounded border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span>{statusError}</span>
              </div>
            )}

            <div className="space-y-6 text-xs text-[#475569]">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <InfoCard title="Khách hàng">
                  <p>Họ tên: <strong className="text-[#0f172a]">{selectedBooking.guest_name}</strong></p>
                  <p>Điện thoại: <strong className="text-[#0f172a]">{selectedBooking.guest_phone}</strong></p>
                  <p>Email: <strong className="text-[#0f172a]">{selectedBooking.guest_email}</strong></p>
                  <p>Quốc tịch: <strong className="text-[#0f172a]">{selectedBooking.guest_nationality}</strong></p>
                  <p>Passport / CMND: <strong className="text-[#0f172a]">{selectedBooking.guest_id_number}</strong></p>
                </InfoCard>

                <InfoCard title="Thông tin phòng">
                  <p>Số phòng: <strong className="text-[#0f172a]">Phòng {selectedBooking.room?.room_number || '-'}</strong></p>
                  <p>Loại phòng: <strong className="text-[#0f172a] uppercase">{selectedBooking.room?.room_type?.name || '-'}</strong></p>
                  <p>Giờ check-in: <strong className="text-[#0f172a]">{selectedBooking.expected_checkin_time || '14:00'}</strong></p>
                  <p>Thời gian lưu trú: <strong className="text-[#0f172a]">{formatDateVI(selectedBooking.check_in_date)} - {formatDateVI(selectedBooking.check_out_date)}</strong></p>
                  <p>Số đêm: <strong className="text-[#0f172a]">{calcNights(selectedBooking.check_in_date, selectedBooking.check_out_date)} đêm</strong></p>
                </InfoCard>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <InfoCard title="Thanh toán" icon={<CreditCard className="h-4 w-4 text-[#e8c96d]" />}>
                  <p>Phương thức: <strong className="text-[#0f172a]">{paymentLabels[selectedBooking.payment_method] || '-'}</strong></p>
                  <p>Trạng thái: <strong className="text-[#0f172a]">{paymentStatusLabels[selectedBooking.payment_status] || 'Chưa thanh toán'}</strong></p>
                </InfoCard>

                <InfoCard title="Hóa đơn" icon={<Receipt className="h-4 w-4 text-[#e8c96d]" />}>
                  {selectedBooking.invoice_requested ? (
                    <>
                      <p>Công ty: <strong className="text-[#0f172a]">{selectedBooking.invoice_company_name || '-'}</strong></p>
                      <p>MST: <strong className="text-[#0f172a]">{selectedBooking.invoice_tax_code || '-'}</strong></p>
                      <p>Địa chỉ: <strong className="text-[#0f172a]">{selectedBooking.invoice_company_address || '-'}</strong></p>
                    </>
                  ) : (
                    <p>Khách không yêu cầu xuất hóa đơn.</p>
                  )}
                </InfoCard>
              </div>

              {selectedBooking.booking_services && selectedBooking.booking_services.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#0f172a]">Dịch vụ đã chọn</h4>
                  <div className="divide-y divide-[#e5e7eb] rounded border border-[#e5e7eb] bg-[#fafafa] p-3">
                    {selectedBooking.booking_services.map((item: any) => (
                      <div key={item.id} className="flex justify-between py-2">
                        <span>{item.service?.name} x {item.quantity}</span>
                        <span className="font-semibold text-[#0f172a]">{formatVND(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2 border-t border-[#e5e7eb] pt-4">
                <div className="flex justify-between">
                  <span>Giá phòng/đêm snapshot:</span>
                  <span>{formatVND(selectedBooking.room_price_snapshot)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tiền dịch vụ:</span>
                  <span>{formatVND(selectedBooking.services_amount)}</span>
                </div>
                {selectedBooking.discount_amount > 0 && (
                  <div className="flex justify-between text-red-400">
                    <span>Khuyến mãi:</span>
                    <span>-{formatVND(selectedBooking.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-[#e5e7eb] pt-2 text-sm font-bold text-[#0f172a]">
                  <span>Tổng tiền:</span>
                  <span className="text-[#d29a00]">{formatVND(selectedBooking.total_amount)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-semibold uppercase text-[#475569]">Ghi chú nghiệp vụ</label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(event) => setStatusNote(event.target.value)}
                  className="w-full rounded border border-[#dbe1ea] bg-white px-3 py-2 text-sm text-[#0f172a]"
                  placeholder="VD: Khách đã thanh toán cọc, hủy do sai thông tin..."
                />
              </div>

              <div className="flex flex-wrap gap-2.5 border-t border-[#e5e7eb] pt-4">
                {selectedBooking.status === 'PENDING' && (
                  <>
                    <button onClick={() => updateStatus(selectedBooking, 'CONFIRMED', true)} disabled={isUpdatingBookingStatus} className="rounded bg-green-600 px-4 py-2 text-xs font-bold uppercase text-white hover:bg-green-700">Duyệt & xác nhận</button>
                    <button onClick={() => updateStatus(selectedBooking, 'CANCELLED', true)} disabled={isUpdatingBookingStatus} className="rounded bg-red-600 px-4 py-2 text-xs font-bold uppercase text-white hover:bg-red-700">Hủy đặt phòng</button>
                  </>
                )}

                {selectedBooking.status === 'CONFIRMED' && (
                  <>
                    <button onClick={() => updateStatus(selectedBooking, 'CHECKED_IN', true)} disabled={isUpdatingBookingStatus} className="rounded bg-blue-600 px-4 py-2 text-xs font-bold uppercase text-white hover:bg-blue-700">Xác nhận check-in</button>
                    <button onClick={() => updateStatus(selectedBooking, 'NO_SHOW', true)} disabled={isUpdatingBookingStatus} className="rounded bg-gray-600 px-4 py-2 text-xs font-bold uppercase text-white hover:bg-gray-700">Báo vắng mặt</button>
                    <button onClick={() => updateStatus(selectedBooking, 'CANCELLED', true)} disabled={isUpdatingBookingStatus} className="rounded bg-red-600 px-4 py-2 text-xs font-bold uppercase text-white hover:bg-red-700">Hủy đặt phòng</button>
                  </>
                )}

                {selectedBooking.status === 'CHECKED_IN' && (
                  <button onClick={() => updateStatus(selectedBooking, 'CHECKED_OUT', true)} disabled={isUpdatingBookingStatus} className="rounded bg-purple-600 px-4 py-2 text-xs font-bold uppercase text-white hover:bg-purple-700">Xác nhận check-out</button>
                )}

                <button type="button" onClick={() => setShowDetailModal(false)} className="ml-auto rounded border border-[#dbe1ea] px-4 py-2 text-xs font-bold uppercase text-[#475569] hover:bg-[#f8fafc]">
                  Đóng lại
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoCard({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-3 rounded border border-[#e5e7eb] bg-[#fafafa] p-4">
      <h4 className="flex items-center gap-2 border-b border-[#e5e7eb] pb-2 text-[10px] font-semibold uppercase tracking-wider text-[#0f172a]">
        {icon}
        {title}
      </h4>
      {children}
    </div>
  )
}
