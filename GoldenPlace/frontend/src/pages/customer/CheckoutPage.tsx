import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  Receipt,
  Smartphone,
  Users,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useBookings } from '../../hooks/useBookings'
import { useCart } from '../../hooks/useCart'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { calcNights, formatVND, getRoomPrimaryImage } from '../../lib/utils'
import type { BookingResponse, PaymentMethod } from '../../types'

const checkoutSchema = z
  .object({
    guest_last_name: z.string().min(1, 'Vui lòng nhập họ'),
    guest_first_name: z.string().min(1, 'Vui lòng nhập tên'),
    guest_email: z.string().email('Email không hợp lệ'),
    guest_phone: z.string().regex(/^[0-9\s]{10,13}$/, 'Số điện thoại không hợp lệ'),
    payment_method: z.enum(['BANK_TRANSFER', 'VISA', 'MOMO']),
    invoice_requested: z.boolean(),
    invoice_company_name: z.string().optional(),
    invoice_tax_code: z.string().optional(),
    invoice_company_address: z.string().optional(),
    special_requests: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.invoice_requested) return
    if (!data.invoice_company_name?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['invoice_company_name'], message: 'Vui lòng nhập tên công ty' })
    }
    if (!data.invoice_tax_code?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['invoice_tax_code'], message: 'Vui lòng nhập mã số thuế' })
    }
    if (!data.invoice_company_address?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['invoice_company_address'], message: 'Vui lòng nhập địa chỉ công ty' })
    }
  })

type CheckoutForm = z.infer<typeof checkoutSchema>

const paymentLabels: Record<PaymentMethod, string> = {
  PAY_AT_HOTEL: 'Thanh toán tại khách sạn',
  BANK_TRANSFER: 'Chuyển khoản ngân hàng',
  VISA: 'Thẻ Visa / Mastercard',
  MOMO: 'Ví MoMo',
}

const paymentOptions: Array<{ value: Exclude<PaymentMethod, 'PAY_AT_HOTEL'>; label: string; icon: typeof Building2 }> = [
  { value: 'BANK_TRANSFER', label: paymentLabels.BANK_TRANSFER, icon: Building2 },
  { value: 'VISA', label: paymentLabels.VISA, icon: CreditCard },
  { value: 'MOMO', label: paymentLabels.MOMO, icon: Smartphone },
]

function splitName(fullName?: string) {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length <= 1) {
    return { lastName: parts[0] || '', firstName: '' }
  }
  return {
    lastName: parts.slice(0, -1).join(' '),
    firstName: parts[parts.length - 1],
  }
}

function money(amount: number) {
  return formatVND(amount).replace(/\s/g, '').replace('₫', ' đ')
}

function BookingSuccess({ booking, onHistory, onHome }: { booking: BookingResponse; onHistory: () => void; onHome: () => void }) {
  return (
    <div className="bg-[#f7f7f8]">
      <div className="mx-auto flex min-h-[620px] max-w-[912px] items-center justify-center px-4 py-16">
        <section className="w-full max-w-[520px] rounded-2xl border border-gray-200 bg-white px-8 py-9 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#d8f8df] text-[#05c65d]">
            <CheckCircle2 className="h-11 w-11" />
          </div>

          <h1 className="mt-7 text-[26px] font-bold text-gray-950">Đặt phòng thành công!</h1>
          <p className="mt-3 text-[15px] text-gray-500">
            Mã đặt phòng của bạn là <strong className="text-gray-950">{booking.booking_code}</strong>
          </p>

          <div className="mt-8 rounded-xl bg-[#f7f7f8] p-5 text-left">
            <h2 className="flex items-center gap-2 text-[15px] font-bold text-gray-950">
              <Receipt className="h-4 w-4 text-[#e5a700]" />
              Thông tin thanh toán
            </h2>
            <div className="mt-4 space-y-3 text-[14px] text-gray-600">
              <div className="flex justify-between gap-4">
                <span>Phương thức</span>
                <strong className="text-right text-gray-950">{paymentLabels[booking.payment_method] || booking.payment_method}</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span>Trạng thái</span>
                <strong className="text-right text-gray-950">Chưa thanh toán</strong>
              </div>
              <div className="flex justify-between gap-4 border-t border-gray-200 pt-3">
                <span>Tổng tiền</span>
                <strong className="text-right text-[#e5a700]">{money(booking.total_amount)}</strong>
              </div>
            </div>
          </div>

          {booking.invoice_requested && (
            <div className="mt-4 rounded-xl border border-[#f1d27a] bg-[#fff9e6] p-5 text-left text-[13px] text-gray-700">
              <h3 className="font-bold text-gray-950">Thông tin xuất hóa đơn</h3>
              <p className="mt-3">{booking.invoice_company_name}</p>
              <p>MST: {booking.invoice_tax_code}</p>
              <p>{booking.invoice_company_address}</p>
            </div>
          )}

          <button onClick={onHistory} className="mt-8 h-[52px] w-full rounded-xl bg-[#ff9f0a] text-[16px] font-bold text-white transition hover:bg-[#f08f00]">
            Xem lịch sử đặt phòng
          </button>
          <button onClick={onHome} className="mt-4 h-[52px] w-full rounded-xl bg-[#f7f7f8] text-[16px] font-bold text-gray-700 transition hover:bg-gray-100">
            Về trang chủ
          </button>
        </section>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { useGetCart } = useCart()
  const { data: cart, isLoading: isLoadingCart } = useGetCart()
  const { createBooking, isCreatingBooking } = useBookings()
  const [createdBooking, setCreatedBooking] = useState<BookingResponse | null>(null)

  const defaultName = splitName(user?.full_name)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    values: {
      guest_last_name: defaultName.lastName,
      guest_first_name: defaultName.firstName,
      guest_email: user?.email || '',
      guest_phone: user?.phone || '',
      payment_method: 'BANK_TRANSFER',
      invoice_requested: false,
      invoice_company_name: '',
      invoice_tax_code: '',
      invoice_company_address: '',
      special_requests: '',
    },
  })

  const selectedPayment = watch('payment_method')
  const invoiceRequested = watch('invoice_requested')

  useEffect(() => {
    document.title = 'Đặt phòng | GoldenPlace'
  }, [])

  if (isLoadingCart) return <LoadingSpinner fullPage />

  const room = cart?.room
  const checkIn = cart?.check_in_date
  const checkOut = cart?.check_out_date
  const hasCart = !!room && !!checkIn && !!checkOut

  if (createdBooking) {
    return <BookingSuccess booking={createdBooking} onHistory={() => navigate('/bookings')} onHome={() => navigate('/')} />
  }

  if (!hasCart) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-gray-950">Giỏ hàng của bạn đang trống</h2>
        <p className="mt-3 text-sm text-gray-500">Vui lòng chọn phòng trước khi tiếp tục đặt phòng.</p>
        <button
          onClick={() => navigate('/rooms')}
          className="mt-6 rounded-md bg-[#f5b400] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#e1a500]"
        >
          Xem phòng
        </button>
      </div>
    )
  }

  const stayNights = calcNights(checkIn, checkOut)
  const roomTotal = room.base_price * stayNights
  const discount = Number((cart as any).discount_amount || 0)
  const finalTotal = Math.max(0, roomTotal - discount)
  const roomImage = getRoomPrimaryImage(room.images)
  const amenities = room.amenities?.length ? room.amenities : ['WiFi miễn phí', 'Bữa sáng', 'Hồ bơi', 'Gym', 'Spa']

  const onSubmit = async (data: CheckoutForm) => {
    try {
      const guestName = `${data.guest_last_name} ${data.guest_first_name}`.trim()
      const newBooking = await createBooking({
        guest_name: guestName,
        guest_email: data.guest_email,
        guest_phone: data.guest_phone.replace(/\s/g, ''),
        guest_nationality: user?.nationality || 'Việt Nam',
        guest_id_number: user?.id_number || '000000000000',
        expected_checkin_time: '14:00',
        special_requests: data.special_requests,
        payment_method: data.payment_method,
        invoice_requested: data.invoice_requested,
        invoice_company_name: data.invoice_requested ? data.invoice_company_name : undefined,
        invoice_tax_code: data.invoice_requested ? data.invoice_tax_code : undefined,
        invoice_company_address: data.invoice_requested ? data.invoice_company_address : undefined,
        services: [],
      })
      setCreatedBooking(newBooking)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: any) {
      const detail = err.response?.data?.detail
      const message = Array.isArray(detail)
        ? detail.map((item: any) => item?.msg || String(item)).join(', ')
        : detail || 'Không thể tạo đơn đặt phòng. Vui lòng kiểm tra lại thông tin.'

      setError('root', { message })
    }
  }

  const fieldClass =
    'h-[34px] w-full rounded-md border-0 bg-[#f3f3f5] px-4 text-[12px] text-gray-700 outline-none ring-1 ring-transparent transition placeholder:text-gray-400 focus:bg-white focus:ring-[#f5b400]'

  return (
    <div className="bg-[#f7f7f8]">
      <div className="mx-auto max-w-[912px] px-4 pb-10 pt-8">
        <div className="mb-6">
          <h1 className="text-[24px] font-bold leading-8 text-gray-950">Nhập thông tin đặt phòng</h1>
          <p className="mt-1 text-[12px] text-gray-500">Vui lòng điền đầy đủ thông tin để hoàn tất đặt phòng</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_264px]">
          <div className="space-y-5">
            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-5 text-[13px] font-bold text-gray-950">Thông tin khách hàng</h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[12px] font-semibold text-gray-900">Họ *</span>
                  <input {...register('guest_last_name')} className={fieldClass} placeholder="Nguyễn Thị" />
                  {errors.guest_last_name && <p className="mt-1 text-[11px] text-red-500">{errors.guest_last_name.message}</p>}
                </label>

                <label className="block">
                  <span className="mb-2 block text-[12px] font-semibold text-gray-900">Tên *</span>
                  <input {...register('guest_first_name')} className={fieldClass} placeholder="Hoa" />
                  {errors.guest_first_name && <p className="mt-1 text-[11px] text-red-500">{errors.guest_first_name.message}</p>}
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-[12px] font-semibold text-gray-900">Email *</span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input {...register('guest_email')} className={`${fieldClass} pl-11`} placeholder="nguyenthihoa@email.com" />
                  </div>
                  {errors.guest_email && <p className="mt-1 text-[11px] text-red-500">{errors.guest_email.message}</p>}
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-[12px] font-semibold text-gray-900">Số điện thoại *</span>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input {...register('guest_phone')} className={`${fieldClass} pl-11`} placeholder="0123 456 789" />
                  </div>
                  {errors.guest_phone && <p className="mt-1 text-[11px] text-red-500">{errors.guest_phone.message}</p>}
                </label>
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-5 text-[13px] font-bold text-gray-950">Chi tiết đặt phòng</h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <span className="mb-2 block text-[12px] font-semibold text-gray-900">Ngày nhận phòng</span>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input value={checkIn} readOnly className={`${fieldClass} pl-11`} />
                  </div>
                </div>

                <div>
                  <span className="mb-2 block text-[12px] font-semibold text-gray-900">Ngày trả phòng</span>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input value={checkOut} readOnly className={`${fieldClass} pl-11`} />
                  </div>
                </div>

                <div>
                  <span className="mb-2 block text-[12px] font-semibold text-gray-900">Số người lớn</span>
                  <div className="relative">
                    <Users className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input value={cart.adults} readOnly className={`${fieldClass} pl-11`} />
                  </div>
                </div>

                <div>
                  <span className="mb-2 block text-[12px] font-semibold text-gray-900">Số trẻ em</span>
                  <div className="relative">
                    <Users className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input value={cart.children} readOnly className={`${fieldClass} pl-11`} />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-5 text-[13px] font-bold text-gray-950">Phương thức thanh toán</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {paymentOptions.map((option) => {
                  const Icon = option.icon
                  const active = selectedPayment === option.value
                  return (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-[12px] font-semibold transition ${
                        active ? 'border-[#f5b400] bg-[#fff8dc] text-gray-950' : 'border-gray-200 bg-white text-gray-600 hover:border-[#f5b400]/60'
                      }`}
                    >
                      <input type="radio" value={option.value} {...register('payment_method')} className="sr-only" />
                      <Icon className={`h-4 w-4 ${active ? 'text-[#e5a700]' : 'text-gray-400'}`} />
                      <span>{option.label}</span>
                    </label>
                  )
                })}
              </div>
              <p className="mt-3 text-[11px] text-gray-400">Hiện tại hệ thống chỉ ghi nhận phương thức thanh toán, chưa tích hợp cổng thanh toán online.</p>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <label className="flex cursor-pointer items-center gap-3 text-[13px] font-bold text-gray-950">
                <input type="checkbox" {...register('invoice_requested')} className="h-4 w-4 rounded border-gray-300 text-[#f5b400] focus:ring-[#f5b400]" />
                Yêu cầu xuất hóa đơn
              </label>

              {invoiceRequested && (
                <div className="mt-5 grid grid-cols-1 gap-4">
                  <label className="block">
                    <span className="mb-2 block text-[12px] font-semibold text-gray-900">Tên công ty *</span>
                    <input {...register('invoice_company_name')} className={fieldClass} placeholder="Công ty TNHH Golden Place" />
                    {errors.invoice_company_name && <p className="mt-1 text-[11px] text-red-500">{errors.invoice_company_name.message}</p>}
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[12px] font-semibold text-gray-900">Mã số thuế *</span>
                    <input {...register('invoice_tax_code')} className={fieldClass} placeholder="0312345678" />
                    {errors.invoice_tax_code && <p className="mt-1 text-[11px] text-red-500">{errors.invoice_tax_code.message}</p>}
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[12px] font-semibold text-gray-900">Địa chỉ công ty *</span>
                    <input {...register('invoice_company_address')} className={fieldClass} placeholder="123 Trần Hưng Đạo, Quận 1, TP.HCM" />
                    {errors.invoice_company_address && <p className="mt-1 text-[11px] text-red-500">{errors.invoice_company_address.message}</p>}
                  </label>
                </div>
              )}
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-5 text-[13px] font-bold text-gray-950">Yêu cầu đặc biệt (Tùy chọn)</h2>
              <textarea
                {...register('special_requests')}
                rows={5}
                className="w-full resize-none rounded-md border border-gray-200 bg-white px-4 py-3 text-[12px] text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#f5b400]"
                placeholder="VD: Tầng cao, giường đôi, không hút thuốc..."
              />
              <p className="mt-3 text-[11px] text-gray-400">Yêu cầu đặc biệt không được đảm bảo nhưng chúng tôi sẽ cố gắng đáp ứng tối đa.</p>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-5 text-[13px] font-bold text-gray-950">Thông tin phòng</h2>
              <img src={roomImage} alt={room.room_type?.name || 'Phòng khách sạn'} className="h-[107px] w-full rounded-md object-cover" />

              <h3 className="mt-4 text-[14px] font-bold text-gray-950">Golden Place Resort & Spa</h3>
              <p className="mt-2 text-[12px] text-gray-500">{room.room_type?.name || 'Phòng cao cấp hướng biển'}</p>
              <div className="mt-3 flex items-center gap-2 text-[12px] text-gray-500">
                <MapPin className="h-4 w-4" />
                <span>Đà Nẵng, Việt Nam</span>
              </div>

              <div className="mt-5 border-t border-gray-200 pt-4">
                <h4 className="mb-3 text-[13px] font-bold text-gray-950">Tiện nghi</h4>
                <div className="space-y-2">
                  {amenities.slice(0, 5).map((item) => (
                    <div key={item} className="flex items-center gap-2 text-[12px] text-gray-600">
                      <Check className="h-3.5 w-3.5 text-[#21b05b]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-5 text-[13px] font-bold text-gray-950">Tổng quan giá</h2>

              <div className="space-y-4 text-[12px]">
                <div className="flex items-center justify-between text-gray-500">
                  <span>Giá phòng/đêm</span>
                  <span className="font-bold text-gray-950">{money(room.base_price)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span>Số đêm</span>
                  <span className="font-bold text-gray-950">{stayNights} đêm</span>
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Khuyến mãi</span>
                    <span className="font-bold text-[#21a35a]">-{money(discount)}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                <span className="text-[13px] font-bold text-gray-950">Tổng cộng</span>
                <span className="text-[20px] font-bold text-[#e5a700]">{money(finalTotal)}</span>
              </div>

              <p className="mt-3 text-[11px] text-gray-400">* Giá đã bao gồm thuế và phí dịch vụ</p>
            </section>

            {errors.root?.message && <p className="text-[12px] text-red-500">{errors.root.message}</p>}

            <button
              type="submit"
              disabled={isCreatingBooking}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-md bg-[#f5b400] text-[13px] font-bold text-white transition hover:bg-[#dfa300] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span>{isCreatingBooking ? 'Đang xử lý...' : 'Tiếp tục'}</span>
              {!isCreatingBooking && <ChevronRight className="h-4 w-4" />}
            </button>
          </aside>
        </form>
      </div>
    </div>
  )
}
