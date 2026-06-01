import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { useCartStore } from '../../stores/cartStore'
import { X, ShoppingBag, Calendar, Users, Trash2, Tag, Percent } from 'lucide-react'
import { formatVND, calcNights, formatDateVI } from '../../lib/utils'

export default function CartSidebar() {
  const navigate = useNavigate()
  const { isOpen, closeCart } = useCartStore()
  const { useGetCart, clearCart, applyPromo, removePromo, isClearingCart, isApplyingPromo, isRemovingPromo } = useCart()
  const { data: cart } = useGetCart()

  const [promoCode, setPromoCode] = useState('')
  const [promoError, setPromoError] = useState('')

  if (!isOpen) return null

  const handleClearCart = async () => {
    try {
      await clearCart()
    } catch (err: any) {
      console.error(err)
    }
  }

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault()
    setPromoError('')
    if (!promoCode.trim()) return

    try {
      await applyPromo(promoCode.trim().toUpperCase())
      setPromoCode('')
    } catch (err: any) {
      setPromoError(err.response?.data?.detail || 'Mã giảm giá không hợp lệ')
    }
  }

  const handleRemovePromo = async () => {
    try {
      await removePromo()
    } catch (err) {
      console.error(err)
    }
  }

  const handleCheckout = () => {
    closeCart()
    navigate('/checkout')
  }

  // Calculate pricing summary
  const room = cart?.room
  const checkIn = cart?.check_in_date
  const checkOut = cart?.check_out_date
  const hasCart = !!room && !!checkIn && !!checkOut
  
  const nights = hasCart ? calcNights(checkIn, checkOut) : 0
  const roomTotal = hasCart ? room.base_price * nights : 0
  const discount = cart?.promotion ? Number(cart.discount_amount || 0) : 0
  const finalTotal = hasCart ? roomTotal - discount : 0

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={closeCart}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Sidebar Panel */}
        <div className="w-screen max-w-md bg-[#242840] border-l border-[#c9a84c]/20 text-[#f5f0e8] shadow-xl flex flex-col">
          
          {/* Header */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-[#c9a84c]/10">
            <h2 className="text-xl font-bold font-serif text-[#e8c96d] uppercase tracking-wider">Lựa Chọn Đặt Phòng</h2>
            <button onClick={closeCart} className="p-2 text-[#a0a8c0] hover:text-[#f5f0e8] focus:outline-none">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {hasCart ? (
              <div className="space-y-6">
                
                {/* Room Info Card */}
                <div className="p-4 rounded-lg bg-[#1a1f36] border border-[#c9a84c]/10 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-white">Phòng {room.room_number}</h3>
                      <p className="text-xs text-[#c9a84c] uppercase font-semibold">{room.room_type?.name}</p>
                    </div>
                    <button 
                      onClick={handleClearCart} 
                      disabled={isClearingCart}
                      className="p-1.5 text-[#a0a8c0] hover:text-red-400 hover:bg-[#242840] rounded transition-colors"
                      title="Xóa phòng nghỉ khỏi giỏ hàng"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {room.images && room.images.length > 0 && (
                    <img 
                      src={room.images[0]} 
                      alt={`Phòng ${room.room_number}`} 
                      className="w-full h-40 object-cover rounded border border-[#c9a84c]/10" 
                    />
                  )}

                  {/* Booking parameters */}
                  <div className="grid grid-cols-2 gap-4 text-xs text-[#a0a8c0] pt-2 border-t border-[#242840]">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-[#c9a84c]" />
                      <div>
                        <p className="text-[10px] uppercase">Nhận phòng</p>
                        <p className="text-white font-medium">{formatDateVI(checkIn)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-[#c9a84c]" />
                      <div>
                        <p className="text-[10px] uppercase">Trả phòng</p>
                        <p className="text-white font-medium">{formatDateVI(checkOut)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-[#c9a84c]" />
                      <div>
                        <p className="text-[10px] uppercase">Số khách</p>
                        <p className="text-white font-medium">{cart.adults} người lớn, {cart.children} trẻ em</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-[#c9a84c]" />
                      <div>
                        <p className="text-[10px] uppercase">Số đêm lưu trú</p>
                        <p className="text-white font-medium">{nights} đêm</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Promo Code Application */}
                <div className="pt-4 border-t border-[#c9a84c]/10 space-y-3">
                  <h4 className="text-sm font-semibold text-white uppercase tracking-wider font-serif">Mã ưu đãi</h4>
                  
                  {cart.promotion ? (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#e8c96d]">
                      <div className="flex items-center space-x-2">
                        <Percent className="h-4 w-4" />
                        <div>
                          <p className="text-xs font-bold">{cart.promotion.code}</p>
                          <p className="text-[10px]">{cart.promotion.name}</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleRemovePromo}
                        disabled={isRemovingPromo}
                        className="text-xs font-semibold text-[#a0a8c0] hover:text-[#f5f0e8] underline"
                      >
                        Gỡ bỏ
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyPromo} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nhập mã giảm giá..."
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1 bg-[#1a1f36] border border-[#c9a84c]/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#c9a84c] text-[#f5f0e8]"
                      />
                      <button
                        type="submit"
                        disabled={isApplyingPromo}
                        className="bg-[#c9a84c] hover:bg-[#e8c96d] text-[#1a1f36] font-semibold px-4 py-2 rounded text-sm transition-colors border border-[#e8c96d]/20"
                      >
                        Áp dụng
                      </button>
                    </form>
                  )}
                  {promoError && <p className="text-xs text-red-400 mt-1">{promoError}</p>}
                </div>

                {/* Billing Summary */}
                <div className="pt-4 border-t border-[#c9a84c]/10 space-y-2 text-sm">
                  <div className="flex justify-between text-[#a0a8c0]">
                    <span>Tiền phòng ({nights} đêm):</span>
                    <span>{formatVND(roomTotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-red-400">
                      <span>Giảm giá ưu đãi:</span>
                      <span>-{formatVND(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-serif font-bold text-lg text-white border-t border-[#c9a84c]/10 pt-3">
                    <span>Tổng tạm tính:</span>
                    <span className="text-[#e8c96d]">{formatVND(finalTotal)}</span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
                <ShoppingBag className="h-16 w-16 text-[#a0a8c0]/20" />
                <h3 className="font-serif font-bold text-[#f5f0e8]">Giỏ hàng của bạn đang trống</h3>
                <p className="text-sm text-[#a0a8c0] max-w-xs">
                  Vui lòng tìm kiếm phòng trống theo ngày và thêm phòng mong muốn để tiến hành đặt chỗ nghỉ dưỡng.
                </p>
              </div>
            )}
          </div>

          {/* Footer Action Buttons */}
          {hasCart && (
            <div className="p-6 border-t border-[#c9a84c]/10 bg-[#1e2238]">
              <button
                onClick={handleCheckout}
                className="w-full bg-[#c9a84c] hover:bg-[#e8c96d] text-[#1a1f36] font-bold py-3 px-4 rounded-md transition-all text-center tracking-wider uppercase font-serif border border-[#e8c96d]/40 shadow-lg hover:shadow-[#c9a84c]/10"
              >
                Tiến hành thanh toán
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
