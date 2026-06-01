import { useState, useEffect, useMemo } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useRooms } from '../../hooks/useRooms'
import { useCart } from '../../hooks/useCart'
import { useBookings } from '../../hooks/useBookings'
import { useCartStore } from '../../stores/cartStore'
import { useAuthStore } from '../../stores/authStore'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ShieldAlert,
  Star,
  Maximize2,
} from 'lucide-react'
import { formatVND, calcNights, getRoomPrimaryImage, formatDateVI } from '../../lib/utils'
import LoadingSpinner from '../../components/common/LoadingSpinner'

/* ───────── Figma-sourced data overrides ───────── */
const figmaDataOverrides: Record<string, { discount: string; rating: string; reviews: number; img: string }> = {
  Standard: { discount: '-6%', rating: '5.0', reviews: 120, img: 'https://images.unsplash.com/photo-1611891487122-2075b9627798?auto=format&fit=crop&q=80&w=800' },
  Deluxe:   { discount: '-17%', rating: '5.0', reviews: 120, img: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800' },
  Suite:    { discount: '-8%', rating: '5.0', reviews: 120, img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800' },
  Family:   { discount: '-10%', rating: '4.8', reviews: 85, img: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800' },
}

/* ───────── Fallback gallery images ───────── */
const fallbackImages = [
  'https://images.unsplash.com/photo-1611891487122-2075b9627798?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=800',
]

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function toDateStringLocal(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function RoomDetailPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { toggleCart } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  /* ── Data fetching ── */
  const { useGetRoomDetail, useGetRooms } = useRooms()
  const { data: room, isLoading: isLoadingRoom } = useGetRoomDetail(roomId || '')
  const { data: allRoomsData } = useGetRooms({ limit: 100 })
  const { updateCart, isUpdatingCart } = useCart()
  const { useGetRoomReviews } = useBookings()
  const { data: reviews, isLoading: isLoadingReviews } = useGetRoomReviews(roomId || '')

  /* ── Local states ── */
  const [selectedImgIndex, setSelectedImgIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'desc' | 'review'>('desc')
  const [phoneSupport, setPhoneSupport] = useState('')
  const [supportSuccess, setSupportSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)

  /* ── Prefill from search params ── */
  useEffect(() => {
    const cIn = searchParams.get('check_in')
    const cOut = searchParams.get('check_out')
    const adl = searchParams.get('adults')
    const chd = searchParams.get('children')
    if (cIn) setCheckIn(new Date(cIn)); else setCheckIn(new Date())
    if (cOut) setCheckOut(new Date(cOut)); else setCheckOut(new Date(Date.now() + 24 * 60 * 60 * 1000))
    if (adl) setAdults(Number(adl))
    if (chd) setChildren(Number(chd))
  }, [searchParams])

  useEffect(() => {
    if (room) document.title = `Phòng ${room.room_number} | GoldenPlace Hotel`
  }, [room])

  /* ── Image gallery construction ── */
  const galleryImages = useMemo(() => {
    if (!room) return fallbackImages
    const imgs: string[] = []
    if (room.images && room.images.length > 0) {
      room.images.forEach((img: any) => {
        if (typeof img === 'string') imgs.push(img)
        else if (img?.url) imgs.push(img.url)
      })
    }
    // pad with fallbacks so we always have at least 5 thumbs
    let idx = 0
    while (imgs.length < 5 && idx < fallbackImages.length) {
      if (!imgs.includes(fallbackImages[idx])) imgs.push(fallbackImages[idx])
      idx++
    }
    return imgs
  }, [room])

  /* ── Computed data ── */
  const typeName = room?.room_type?.name || 'Standard'
  const extraData = figmaDataOverrides[typeName] || figmaDataOverrides['Standard']

  /* ── Similar rooms ── */
  const similarRooms = useMemo(() => {
    if (!allRoomsData?.rooms || !room) return []
    return allRoomsData.rooms
      .filter((r: any) => r.id !== room.id)
      .slice(0, 3)
  }, [allRoomsData, room])

  /* ── Thumbnail scroll state ── */
  const [thumbStart, setThumbStart] = useState(0)
  const thumbsVisible = 3 // Show exactly 3 thumbnails like in the Figma mockup
  const thumbsToShow = galleryImages.slice(thumbStart, thumbStart + thumbsVisible)

  /* ── Handlers ── */
  const handleCheckInChange = (date: Date | null) => {
    setCheckIn(date)
    setErrorMsg('')
    if (date && (!checkOut || checkOut <= date)) {
      setCheckOut(addDays(date, 1))
    }
  }

  const handleCheckOutChange = (date: Date | null) => {
    setCheckOut(date)
    setErrorMsg('')
  }

  const validateBookingDates = () => {
    if (!checkIn || !checkOut) {
      setErrorMsg('Vui lòng chọn ngày nhận và trả phòng.')
      return null
    }
    if (checkOut <= checkIn) {
      setErrorMsg('Ngày trả phòng phải sau ngày nhận phòng.')
      return null
    }

    return {
      checkInStr: toDateStringLocal(checkIn),
      checkOutStr: toDateStringLocal(checkOut),
    }
  }

  const handleBookNow = async () => {
    if (!isAuthenticated) {
      navigate(`/auth/login?redirect=/rooms/${roomId}`)
      return
    }
    setErrorMsg('')
    const dates = validateBookingDates()
    if (!dates) return
    try {
      await updateCart({ room_id: room!.id, check_in_date: dates.checkInStr, check_out_date: dates.checkOutStr, adults, children })
      navigate('/cart') // Redirect directly to full cart page
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Đặt phòng thất bại.')
    }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate(`/auth/login?redirect=/rooms/${roomId}`)
      return
    }
    setErrorMsg('')
    const dates = validateBookingDates()
    if (!dates) return
    try {
      await updateCart({ room_id: room!.id, check_in_date: dates.checkInStr, check_out_date: dates.checkOutStr, adults, children })
      navigate('/cart') // Go directly to /cart to show item added
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Thêm vào giỏ hàng thất bại.')
    }
  }

  const handleSupportSubmit = () => {
    if (phoneSupport.trim().length >= 8) {
      setSupportSuccess(true)
      setTimeout(() => setSupportSuccess(false), 3000)
    }
  }

  /* ── Price computations ── */
  const nights = checkIn && checkOut ? calcNights(toDateStringLocal(checkIn), toDateStringLocal(checkOut)) : 0
  const unitPrice = room?.base_price || 1800000
  const displayTotal = unitPrice * quantity

  /* ── Loading / Not found ── */
  if (isLoadingRoom) return <LoadingSpinner fullPage />
  if (!room) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <ShieldAlert className="h-16 w-16 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold font-serif">Phòng không tồn tại</h2>
        <button onClick={() => navigate('/rooms')} className="bg-[#facc15] px-6 py-2 rounded text-xs uppercase font-bold text-gray-900">
          Quay lại danh sách phòng
        </button>
      </div>
    )
  }

  /* ─────────────── RENDER ─────────────── */
  return (
    <div className="flex flex-col bg-white min-h-screen text-gray-800" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

      {/* ═══════════ BREADCRUMB ═══════════ */}
      <div className="bg-[#f5f5f5] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-3 text-sm text-gray-500 flex items-center space-x-2">
          <Link to="/" className="hover:text-[#c9a84c] transition-colors">Trang chủ</Link>
          <span>/</span>
          <span className="text-[#c9a84c] font-medium">Golden Place Resort &amp; Spa</span>
        </div>
      </div>

      {/* ═══════════ MAIN 3-COLUMN GRID ═══════════ */}
      <div className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ─── COLUMN 1: Image Gallery (5 cols) ─── */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main image */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
            <img
              src={galleryImages[selectedImgIndex] || galleryImages[0]}
              alt={`Phòng ${room.room_number}`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnail strip with 3 items */}
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => setThumbStart(Math.max(0, thumbStart - 1))}
              className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition disabled:opacity-30"
              disabled={thumbStart === 0}
            >
              <ChevronLeft className="h-4 w-4 text-gray-500" />
            </button>
            <div className="flex space-x-2 flex-1 justify-center">
              {thumbsToShow.map((imgSrc, idx) => {
                const realIndex = thumbStart + idx
                return (
                  <button
                    key={realIndex}
                    onClick={() => setSelectedImgIndex(realIndex)}
                    className={`w-20 h-16 rounded overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImgIndex === realIndex ? 'border-[#c9a84c]' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img src={imgSrc} alt="" className="w-full h-full object-cover" />
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setThumbStart(Math.min(galleryImages.length - thumbsVisible, thumbStart + 1))}
              className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition disabled:opacity-30"
              disabled={thumbStart >= galleryImages.length - thumbsVisible}
            >
              <ChevronRight className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* ─── COLUMN 2: Title & Description & Quantity (4 cols) ─── */}
        <div className="lg:col-span-4 space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 font-serif leading-tight">
            Golden Place Resort &amp; Spa
          </h1>

          <p className="text-sm text-gray-600 leading-relaxed font-normal">
            {room.description || 'Phòng cao cấp ( Hướng biển ), với cảnh quan tuyệt đẹp, bạn sẽ tận hưởng đầy đủ kỳ nghỉ với các dịch vụ hoàn hảo. Buổi sáng có thể ngắm bình minh, buổi chiều có thể ngắm hoàng hôn, ngoài ra khách đặt phòng còn được miễn phí ăn sáng các buổi, miễn phí spa 2 ngày. Tiện ích phòng đầy đủ máy lạnh, máy giặt, tivi màn hình phẳng 45" và nhiều tiện ích khác nữa.'}
          </p>

          <div className="space-y-2.5">
            <span className="text-sm font-semibold text-gray-700 block">Số lượng:</span>
            <div className="flex items-center border border-gray-300 rounded overflow-hidden w-full max-w-[280px]">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition border-r border-gray-300 flex-1 flex justify-center"
              >
                <Minus className="h-4 w-4 text-gray-600" />
              </button>
              <span className="px-6 py-2.5 text-sm font-semibold text-center flex-1 bg-white">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition border-l border-gray-300 flex-1 flex justify-center"
              >
                <Plus className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* ─── COLUMN 3: Badges & Pricing & CTA Buttons (3 cols) ─── */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Rating Badge */}
          <div className="space-y-1">
            <span className="bg-[#facc15] text-gray-900 text-xs font-bold px-3 py-1.5 rounded inline-block">
              Xuất sắc {extraData.rating}
            </span>
            <span className="text-xs text-gray-500 block mt-1">( {extraData.reviews} đánh giá )</span>
          </div>

          {/* Discount code horizontal ribbon */}
          <div>
            <div 
              className="bg-red-500 text-white text-xs font-bold px-4 py-1.5 inline-block shadow-sm"
              style={{ clipPath: 'polygon(0 0, 100% 0, 85% 50%, 100% 100%, 0 100%)' }}
            >
              {extraData.discount}
            </div>
          </div>

          {/* Green bold price tag */}
          <div className="text-3xl md:text-4xl font-bold text-[#10b981] flex items-baseline">
            {formatVND(displayTotal).replace(' ₫', '').replace(/\s/g, '')}
            <span className="underline text-xl font-bold">đ</span>
            <span className="text-sm font-normal text-gray-500 ml-1">/đêm</span>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-gray-700">Ngày nhận phòng</span>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <DatePicker
                    selected={checkIn}
                    onChange={handleCheckInChange}
                    minDate={new Date()}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Chọn ngày nhận"
                    className="h-10 w-full rounded-md border border-gray-200 bg-[#f3f3f5] pl-10 pr-3 text-sm outline-none focus:border-[#f5b400] focus:bg-white"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-gray-700">Ngày trả phòng</span>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <DatePicker
                    selected={checkOut}
                    onChange={handleCheckOutChange}
                    minDate={checkIn ? addDays(checkIn, 1) : addDays(new Date(), 1)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Chọn ngày trả"
                    className="h-10 w-full rounded-md border border-gray-200 bg-[#f3f3f5] pl-10 pr-3 text-sm outline-none focus:border-[#f5b400] focus:bg-white"
                  />
                </div>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <GuestStepper label="Người lớn" value={adults} onMinus={() => setAdults(Math.max(1, adults - 1))} onPlus={() => setAdults(adults + 1)} />
                <GuestStepper label="Trẻ em" value={children} onMinus={() => setChildren(Math.max(0, children - 1))} onPlus={() => setChildren(children + 1)} />
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
                <span>Số đêm</span>
                <strong className="text-gray-900">{Math.max(0, nights)} đêm</strong>
              </div>
            </div>
          </div>

          {/* Booking CTAs */}
          <div className="space-y-3">
            <button
              onClick={handleBookNow}
              disabled={isUpdatingCart}
              className="w-full bg-[#facc15] hover:bg-[#eab308] text-gray-950 font-bold py-3 px-6 rounded transition-all duration-200 uppercase tracking-wide text-sm shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              Đặt phòng ngay
            </button>
            <button
              onClick={handleAddToCart}
              disabled={isUpdatingCart}
              className="w-full bg-[#facc15] hover:bg-[#eab308] text-gray-950 font-bold py-3 px-6 rounded transition-all duration-200 uppercase tracking-wide text-sm shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              Thêm vào giỏ
            </button>
          </div>

          {errorMsg && <p className="text-xs text-red-500 mt-1">{errorMsg}</p>}

          {/* Hotline Support Card */}
          <div className="space-y-3 pt-3">
            <p className="text-xs text-gray-600 font-semibold leading-relaxed">
              Nhập số điện thoại của bạn chúng tôi<br/>hỗ trợ bạn ngay
            </p>
            
            <div className="relative border border-gray-300 rounded overflow-hidden bg-white flex items-center pr-3">
              <input
                type="tel"
                placeholder="Điện thoại*"
                value={phoneSupport}
                onChange={(e) => setPhoneSupport(e.target.value)}
                className="w-full px-4 py-2.5 text-sm focus:outline-none text-gray-700 placeholder-gray-400 border-none"
              />
              <button 
                onClick={handleSupportSubmit}
                className="text-gray-400 hover:text-gray-700 transition"
              >
                <svg className="h-4.5 w-4.5 transform rotate-45" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>

            {supportSuccess && (
              <p className="text-xs text-green-600 font-medium">✓ Chúng tôi sẽ liên hệ lại ngay!</p>
            )}

            <div className="pt-1">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block font-bold">Hỗ trợ 24/24</span>
              <span className="text-3xl font-extrabold text-[#e53e3e] tracking-tight block mt-0.5">
                +1900 1234
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* ═══════════ TABS PANEL: Mô tả / Đánh giá ═══════════ */}
      <div className="max-w-7xl mx-auto px-8 w-full mt-10">
        
        {/* Tab Headers */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-3 text-base font-semibold transition-colors border-b-2 -mb-[2px] ${
              activeTab === 'desc'
                ? 'border-[#0f766e] text-[#0f766e]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Mô tả
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`ml-10 pb-3 text-base font-semibold transition-colors border-b-2 -mb-[2px] ${
              activeTab === 'review'
                ? 'border-[#0f766e] text-[#0f766e]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Đánh giá
          </button>
        </div>

        {/* Tab Contents */}
        <div className="py-8">
          {activeTab === 'desc' && (
            <div className="space-y-6">
              <p className="text-sm text-gray-600 leading-relaxed max-w-4xl font-normal">
                {room.description || 'Phòng cao cấp ( Hướng biển ), với cảnh quan tuyệt đẹp, bạn sẽ tận hưởng đầy đủ kỳ nghỉ với các dịch vụ hoàn hảo. Buổi sáng có thể ngắm bình minh, buổi chiều có thể ngắm hoàng hôn, ngoài ra khách đặt phòng còn được miễn phí ăn sáng các buổi, miễn phí spa 2 ngày.'}
              </p>
              {/* Giant nighttime resort photo */}
              <div className="rounded-xl overflow-hidden shadow-md">
                <img
                  src="/images/div.relative.png"
                  alt="Resort night panorama"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          )}

          {activeTab === 'review' && (
            <div className="space-y-6">
              {isLoadingReviews ? (
                <LoadingSpinner />
              ) : reviews && reviews.length > 0 ? (
                reviews.map((rev: any) => (
                  <div key={rev.id} className="p-5 rounded-lg bg-gray-50 border border-gray-200 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{rev.user?.full_name || 'Khách hàng'}</h4>
                        <p className="text-xs text-gray-400">Đã lưu trú vào {formatDateVI(rev.created_at)}</p>
                      </div>
                      <div className="flex items-center space-x-1 bg-[#facc15] px-2.5 py-1 rounded text-xs font-bold text-gray-950">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span>{rev.rating_overall}/5</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs text-gray-500">
                      {[
                        { label: 'Phòng', val: rev.rating_room },
                        { label: 'Dịch vụ', val: rev.rating_service },
                        { label: 'Vệ sinh', val: rev.rating_cleanliness },
                        { label: 'Vị trí', val: rev.rating_location },
                        { label: 'Giá trị', val: rev.rating_value },
                      ].map((r) => (
                        <div key={r.label} className="flex justify-between bg-white rounded px-2 py-1 border border-gray-100">
                          <span>{r.label}</span>
                          <span className="text-[#c9a84c] font-bold">{r.val}★</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-sm text-gray-700 italic">"{rev.comment}"</p>

                    {rev.admin_reply && (
                      <div className="mt-2 p-3 rounded bg-[#fef9c3] border-l-2 border-[#facc15] text-sm space-y-1">
                        <p className="font-bold text-gray-800">Phản hồi từ Quản trị viên:</p>
                        <p className="text-gray-600 italic">"{rev.admin_reply}"</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">Chưa có đánh giá nào cho phòng nghỉ này.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════ SIMILAR ROOMS ═══════════ */}
      {similarRooms.length > 0 && (
        <div className="max-w-7xl mx-auto px-8 pb-16 w-full mt-10">
          <h2 className="text-2xl font-serif font-bold text-center text-gray-900 mb-10">
            Phòng tương tự
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {similarRooms.map((sr: any) => {
              const srType = sr.room_type?.name || 'Standard'
              const srExtra = figmaDataOverrides[srType] || figmaDataOverrides['Standard']
              const srImg = getRoomPrimaryImage(sr.images) || srExtra.img

              return (
                <Link
                  to={`/rooms/${sr.id}`}
                  key={sr.id}
                  className="group flex flex-col cursor-pointer hover:-translate-y-1 transition-transform duration-300"
                >
                  {/* Card Image */}
                  <div className="relative h-64 overflow-hidden shadow-md rounded-t-lg">
                    <img
                      src={srImg}
                      alt={srType}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {/* Ribbon discount tag */}
                    <div
                      className="absolute top-4 left-0 bg-red-500 text-white text-xs font-bold px-3 py-1.5 shadow"
                      style={{ clipPath: 'polygon(0 0, 100% 0, 85% 50%, 100% 100%, 0 100%)' }}
                    >
                      {srExtra.discount}
                    </div>
                    {/* Price tag */}
                    <div className="absolute bottom-0 right-0 bg-[#10b981] text-white px-4 py-2 font-bold text-sm shadow-md">
                      {formatVND(sr.base_price).replace(' ₫', 'đ')}/đêm
                    </div>
                  </div>
                  {/* Information block */}
                  <div className="pt-4 space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="bg-[#facc15] text-gray-900 text-xs font-bold px-2 py-0.5 rounded-sm">
                        Xuất sắc {srExtra.rating}
                      </div>
                      <span className="text-xs text-gray-500">({srExtra.reviews} đánh giá)</span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-sm font-serif">
                      Golden Place {srType} Resort &amp; Spa
                    </h3>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function GuestStepper({ label, value, onMinus, onPlus }: { label: string; value: number; onMinus: () => void; onPlus: () => void }) {
  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold text-gray-700">{label}</span>
      <div className="flex h-10 items-center overflow-hidden rounded-md border border-gray-200 bg-[#f3f3f5]">
        <button onClick={onMinus} className="flex h-full w-9 items-center justify-center text-gray-500 hover:bg-white" aria-label={`Giảm ${label}`}>
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="flex-1 text-center text-sm font-semibold text-gray-900">{value}</span>
        <button onClick={onPlus} className="flex h-full w-9 items-center justify-center text-gray-500 hover:bg-white" aria-label={`Tăng ${label}`}>
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
