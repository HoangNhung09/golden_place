import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { X, ChevronUp, ChevronDown } from 'lucide-react'
import { formatVND, getRoomPrimaryImage } from '../../lib/utils'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function CartPage() {
  const navigate = useNavigate()
  const { useGetCart, clearCart, isClearingCart } = useCart()
  const { data: cart, isLoading } = useGetCart()

  // Local state for quantity to mimic spinner behavior in Figma
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    document.title = 'Giỏ hàng | GoldenPlace Hotel'
  }, [])

  if (isLoading) {
    return <LoadingSpinner fullPage />
  }

  const room = cart?.room
  const checkIn = cart?.check_in_date
  const checkOut = cart?.check_out_date
  const hasCart = !!room && !!checkIn && !!checkOut

  const unitPrice = room?.base_price || 1800000
  const subtotal = unitPrice * quantity

  const handleClearCart = async () => {
    try {
      await clearCart()
    } catch (err) {
      console.error(err)
    }
  }

  const handleCheckout = () => {
    navigate('/checkout')
  }

  // Helper to format quantity with leading zero
  const formatQuantity = (num: number) => {
    return num < 10 ? `0${num}` : `${num}`
  }

  // Format VND matching figma suffix (e.g. 1.800.000đ)
  const formatPriceFigma = (amount: number) => {
    return formatVND(amount).replace(' ₫', 'đ').replace(/\s/g, '')
  }

  return (
    <div className="bg-white min-h-screen text-gray-800 pb-20">
      
      {/* ═══════════ BREADCRUMB ═══════════ */}
      <div className="bg-[#f5f5f5] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-500 flex items-center space-x-2">
          <Link to="/" className="hover:text-[#c9a84c] transition-colors">Trang chủ</Link>
          <span>/</span>
          <span className="text-[#c9a84c] font-medium">Giỏ Hàng</span>
        </div>
      </div>

      {/* ═══════════ MAIN CONTENT CONTAINER ═══════════ */}
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
        
        {/* Table Grid Wrapper */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          
          {/* Header Row */}
          <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200 py-4 px-6 text-sm font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-5 text-left">Phòng</div>
            <div className="col-span-3 text-center">Đơn giá</div>
            <div className="col-span-2 text-center">Số lượng</div>
            <div className="col-span-2 text-right">Tổng</div>
          </div>

          {/* Table Body */}
          {!hasCart ? (
            <div className="py-20 px-6 text-left text-gray-500 italic text-sm">
              Danh sách trống
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              <div className="grid grid-cols-12 items-center py-6 px-6">
                
                {/* Room column with image, name & red delete X button */}
                <div className="col-span-5 flex items-center space-x-6">
                  <div className="relative w-24 h-16 rounded overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0">
                    <img 
                      src={getRoomPrimaryImage(room.images)} 
                      alt="Golden Place Resort & Spa"
                      className="w-full h-full object-cover"
                    />
                    {/* Red X close button */}
                    <button 
                      onClick={handleClearCart}
                      disabled={isClearingCart}
                      className="absolute -top-1 -left-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 shadow transition active:scale-95"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="font-semibold text-gray-800 text-sm md:text-base">
                    Golden Place Resort & Spa
                  </span>
                </div>

                {/* Đơn giá */}
                <div className="col-span-3 text-center text-sm md:text-base text-gray-700 font-medium">
                  {formatPriceFigma(unitPrice)}
                </div>

                {/* Số lượng spinner control */}
                <div className="col-span-2 flex justify-center">
                  <div className="flex items-center border border-gray-300 rounded px-3 py-1.5 space-x-3 bg-white w-20 justify-between">
                    <span className="text-sm font-semibold text-gray-700 select-none">
                      {formatQuantity(quantity)}
                    </span>
                    <div className="flex flex-col -space-y-1">
                      <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="text-gray-400 hover:text-gray-600 transition"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </button>
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="text-gray-400 hover:text-gray-600 transition"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tổng */}
                <div className="col-span-2 text-right text-sm md:text-base text-gray-800 font-bold">
                  {formatPriceFigma(subtotal)}
                </div>

              </div>
            </div>
          )}

        </div>

        {/* ═══════════ SUMMARY BOX ═══════════ */}
        {hasCart && (
          <div className="flex justify-start">
            <div className="w-full max-w-sm border border-gray-300 rounded-lg p-6 space-y-6 bg-white">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
                Giỏ hàng
              </h2>
              
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Số lượng</span>
                <span className="font-semibold text-gray-800">{formatQuantity(quantity)}</span>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-600 border-t border-gray-100 pt-3">
                <span>Tổng</span>
                <span className="font-bold text-lg text-gray-900">{formatPriceFigma(subtotal)}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-[#facc15] hover:bg-[#eab308] text-gray-900 font-bold py-3 px-4 rounded transition-all duration-200 uppercase tracking-wider text-sm shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                Đặt Phòng
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
