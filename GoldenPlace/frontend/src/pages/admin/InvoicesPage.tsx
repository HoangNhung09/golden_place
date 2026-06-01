import { useState } from 'react'
import { FileText, Printer, Search, X } from 'lucide-react'
import { useAdmin } from '../../hooks/useAdmin'
import { bookingStatusLabel, formatDateVI, formatVND } from '../../lib/utils'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const statusClass: Record<string, string> = {
  PENDING: 'bg-[#fff7d6] text-[#b58100]',
  CONFIRMED: 'bg-[#dbeafe] text-[#2563eb]',
  CHECKED_IN: 'bg-[#dffbea] text-[#16a34a]',
  CHECKED_OUT: 'bg-[#eef0f4] text-[#475569]',
  CANCELLED: 'bg-[#fee2e2] text-[#ef4444]',
  NO_SHOW: 'bg-[#ffedd5] text-[#f97316]',
}

const paymentLabels: Record<string, string> = {
  PAY_AT_HOTEL: 'Tại khách sạn',
  BANK_TRANSFER: 'Chuyển khoản',
  VISA: 'Visa / Mastercard',
  MOMO: 'MoMo',
}

const paymentStatusLabels: Record<string, string> = {
  UNPAID: 'Chưa thanh toán',
  PAID: 'Đã thanh toán',
  PARTIAL: 'Thanh toán một phần',
  REFUNDED: 'Đã hoàn tiền',
}

export default function InvoicesPage() {
  const { useGetBookings } = useAdmin()
  const { data, isLoading } = useGetBookings({ limit: 50 })
  const [search, setSearch] = useState('')
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const bookings = data?.items || []

  const rows = bookings.filter((booking: any) => {
    const haystack = `${booking.booking_code} ${booking.guest_name} ${booking.room?.room_number}`.toLowerCase()
    return haystack.includes(search.toLowerCase())
  })

  const handlePrint = (booking: any) => {
    setSelectedInvoice(booking)
    window.setTimeout(() => window.print(), 300)
  }

  return (
    <div>
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 12mm;
            }

            html,
            body {
              background: #ffffff !important;
            }

            body * {
              visibility: hidden !important;
            }

            .invoice-print-area,
            .invoice-print-area * {
              visibility: visible !important;
            }

            .invoice-print-area {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              max-width: none !important;
              padding: 0 !important;
              background: #ffffff !important;
              border: 0 !important;
              box-shadow: none !important;
              border-radius: 0 !important;
            }

            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[24px] font-bold">Quản lý hóa đơn</h1>
      </div>

      <div className="mt-8 rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-sm">
        <label className="relative block max-w-[760px]">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#94a3b8]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo mã đặt phòng hoặc tên khách hàng..."
            className="h-10 w-full rounded-lg border border-[#d9e0ea] pl-12 pr-4 outline-none focus:border-[#f8d866]"
          />
        </label>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left text-[15px] text-[#475569]">
              <thead className="bg-[#fafafa] text-xs font-bold uppercase">
                <tr>
                  <th className="px-6 py-4">Mã đặt phòng</th>
                  <th className="px-6 py-4">Khách hàng</th>
                  <th className="px-6 py-4">Phòng</th>
                  <th className="px-6 py-4">Tổng tiền</th>
                  <th className="px-6 py-4">Phương thức</th>
                  <th className="px-6 py-4">Hóa đơn</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Ngày tạo</th>
                  <th className="px-6 py-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-10 text-center text-[#64748b]">
                      Chưa có dữ liệu hóa đơn.
                    </td>
                  </tr>
                ) : (
                  rows.map((booking: any) => (
                    <tr key={booking.id} className="border-t border-[#edf0f4]">
                      <td className="px-6 py-5 font-semibold text-[#111827]">{booking.booking_code}</td>
                      <td className="px-6 py-5">{booking.guest_name}</td>
                      <td className="px-6 py-5">{booking.room?.room_number || '-'}</td>
                      <td className="px-6 py-5 font-bold text-[#d5a332]">{formatVND(booking.total_amount)}</td>
                      <td className="px-6 py-5">{paymentLabels[booking.payment_method] || '-'}</td>
                      <td className="px-6 py-5">{booking.invoice_requested ? 'Có yêu cầu' : 'Không'}</td>
                      <td className="px-6 py-5">
                        <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${statusClass[booking.status] || 'bg-[#eef0f4] text-[#475569]'}`}>
                          {bookingStatusLabel(booking.status)}
                        </span>
                      </td>
                      <td className="px-6 py-5">{formatDateVI(booking.created_at)}</td>
                      <td className="px-6 py-5">
                        <div className="flex gap-2">
                          <button onClick={() => setSelectedInvoice(booking)} className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-[#2f73ff] px-3 py-2 text-[#2f73ff]">
                            <FileText className="h-4 w-4" />
                            Xem
                          </button>
                          <button onClick={() => handlePrint(booking)} className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#f8d866] px-3 py-2 font-semibold text-[#111827]">
                            <Printer className="h-4 w-4" />
                            In
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setSelectedInvoice(null)}>
          <section className="invoice-print-area w-full max-w-[640px] rounded-xl bg-white p-7 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="no-print mb-5 flex justify-end gap-2">
              <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-[#f8d866] px-4 py-2 text-sm font-semibold text-[#111827]">
                <Printer className="h-4 w-4" />
                In hóa đơn
              </button>
              <button onClick={() => setSelectedInvoice(null)} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm">
                <X className="h-4 w-4" />
                Đóng
              </button>
            </div>

            <InvoiceContent invoice={selectedInvoice} />
          </section>
        </div>
      )}
    </div>
  )
}

function InvoiceContent({ invoice }: { invoice: any }) {
  const nights = Math.max(1, Math.ceil((new Date(invoice.check_out_date).getTime() - new Date(invoice.check_in_date).getTime()) / 86400000))

  return (
    <div>
      <div className="flex items-start justify-between gap-4 border-b border-[#e5e7eb] pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#d5a332]">Golden Place Hotel</p>
          <h2 className="mt-2 text-2xl font-bold text-[#111827]">Hóa đơn đặt phòng</h2>
          <p className="mt-1 text-sm text-[#64748b]">Mã hóa đơn: {invoice.booking_code}</p>
        </div>
        <div className="text-right text-sm text-[#475569]">
          <p>Ngày tạo</p>
          <strong className="text-[#111827]">{formatDateVI(invoice.created_at)}</strong>
        </div>
      </div>

      <div className="mt-6 grid gap-5 text-sm text-[#475569] md:grid-cols-2">
        <div className="rounded-lg border border-[#e5e7eb] p-4">
          <h3 className="font-bold text-[#111827]">Thông tin khách hàng</h3>
          <p className="mt-3">Khách hàng: <strong className="text-[#111827]">{invoice.guest_name}</strong></p>
          <p>Điện thoại: <strong className="text-[#111827]">{invoice.guest_phone || '-'}</strong></p>
          <p>Email: <strong className="text-[#111827]">{invoice.guest_email || '-'}</strong></p>
        </div>

        <div className="rounded-lg border border-[#e5e7eb] p-4">
          <h3 className="font-bold text-[#111827]">Thông tin lưu trú</h3>
          <p className="mt-3">Phòng: <strong className="text-[#111827]">{invoice.room?.room_number || '-'}</strong></p>
          <p>Loại phòng: <strong className="text-[#111827]">{invoice.room?.room_type?.name || '-'}</strong></p>
          <p>Thời gian: <strong className="text-[#111827]">{formatDateVI(invoice.check_in_date)} - {formatDateVI(invoice.check_out_date)}</strong></p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-[#e5e7eb]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#fafafa] text-xs uppercase text-[#475569]">
            <tr>
              <th className="px-4 py-3">Nội dung</th>
              <th className="px-4 py-3 text-center">SL</th>
              <th className="px-4 py-3 text-right">Đơn giá</th>
              <th className="px-4 py-3 text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-[#edf0f4]">
              <td className="px-4 py-3">Tiền phòng</td>
              <td className="px-4 py-3 text-center">{nights} đêm</td>
              <td className="px-4 py-3 text-right">{formatVND(invoice.room_price_snapshot || 0)}</td>
              <td className="px-4 py-3 text-right">{formatVND((invoice.room_price_snapshot || 0) * nights)}</td>
            </tr>
            {(invoice.booking_services || []).map((item: any) => (
              <tr key={item.id} className="border-t border-[#edf0f4]">
                <td className="px-4 py-3">{item.service?.name || 'Dịch vụ'}</td>
                <td className="px-4 py-3 text-center">{item.quantity}</td>
                <td className="px-4 py-3 text-right">{formatVND(item.unit_price || 0)}</td>
                <td className="px-4 py-3 text-right">{formatVND(item.subtotal || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 space-y-2 text-sm text-[#475569]">
        <div className="flex justify-between">
          <span>Giảm giá</span>
          <strong className="text-[#ef4444]">-{formatVND(invoice.discount_amount || 0)}</strong>
        </div>
        <div className="flex justify-between">
          <span>Phương thức thanh toán</span>
          <strong className="text-[#111827]">{paymentLabels[invoice.payment_method] || '-'}</strong>
        </div>
        <div className="flex justify-between">
          <span>Trạng thái thanh toán</span>
          <strong className="text-[#111827]">{paymentStatusLabels[invoice.payment_status] || 'Chưa thanh toán'}</strong>
        </div>
        <div className="flex justify-between border-t border-[#e5e7eb] pt-3 text-lg">
          <span className="font-bold text-[#111827]">Tổng cộng</span>
          <strong className="text-[#d5a332]">{formatVND(invoice.total_amount || 0)}</strong>
        </div>
      </div>

      {invoice.invoice_requested && (
        <div className="mt-6 rounded-lg bg-[#fff9e6] p-4 text-sm text-[#475569]">
          <h3 className="font-bold text-[#111827]">Thông tin xuất hóa đơn VAT</h3>
          <p className="mt-2">Công ty: {invoice.invoice_company_name || '-'}</p>
          <p>Mã số thuế: {invoice.invoice_tax_code || '-'}</p>
          <p>Địa chỉ: {invoice.invoice_company_address || '-'}</p>
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 gap-12 text-center text-sm text-[#475569]">
        <div>
          <p className="font-semibold text-[#111827]">Khách hàng</p>
          <p className="mt-16 border-t border-[#cbd5e1] pt-2">{invoice.guest_name}</p>
        </div>
        <div>
          <p className="font-semibold text-[#111827]">Người lập hóa đơn</p>
          <p className="mt-16 border-t border-[#cbd5e1] pt-2">Golden Place</p>
        </div>
      </div>
    </div>
  )
}
