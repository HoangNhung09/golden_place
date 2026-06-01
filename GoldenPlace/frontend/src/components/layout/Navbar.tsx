import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ShoppingBag, User, LogOut, Menu, ChevronDown, LayoutDashboard, Search } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'
import { getInitials } from '../../lib/utils'

export default function Navbar() {
  const queryClient = useQueryClient()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { useGetCart } = useCart()
  const { data: cart } = useGetCart()
  const navigate = useNavigate()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  const handleLogout = async () => {
    logout()
    queryClient.clear()
    setProfileDropdownOpen(false)
    navigate('/')
  }

  const cartCount = cart && cart.room ? 1 : 0

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 transition-all duration-300">
        <div className="w-full px-4 sm:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-gray-800 hover:text-[#00a680] focus:outline-none transition-colors"
                aria-label="Mở menu"
              >
                <Menu className="h-6 w-6" />
              </button>

              <Link to="/" className="flex items-center">
                <span className="text-xl md:text-2xl font-bold text-[#ffd700] uppercase font-sans leading-tight text-center">
                  GOLDEN<br />PLACE
                </span>
              </Link>
            </div>

            <div className="flex items-center space-x-4 md:space-x-8">
              <div className="hidden sm:flex items-center border-b border-gray-300 py-1">
                <span className="text-gray-400 text-sm mr-2 select-none">|</span>
                <input
                  type="text"
                  placeholder="Tìm kiếm"
                  className="bg-transparent border-none outline-none text-sm w-24 focus:w-40 transition-all duration-300 text-gray-700 placeholder-gray-400"
                />
                <button className="text-gray-600 hover:text-[#00a680] ml-1" aria-label="Tìm kiếm">
                  <Search className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => navigate('/cart')}
                className="relative p-2 text-gray-800 hover:text-[#00a680] transition-colors focus:outline-none flex items-center space-x-1"
                aria-label="Giỏ hàng"
              >
                <ShoppingBag className="h-5 w-5" />
                <span className="text-gray-900 font-bold text-sm bg-[#ffcc00] rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              </button>

              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-2 text-gray-800 hover:text-[#00a680] focus:outline-none transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-[#c9a84c] text-white flex items-center justify-center font-bold text-sm">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.full_name} className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        getInitials(user.full_name)
                      )}
                    </div>
                    <span className="font-medium text-sm hidden lg:inline-block">{user.full_name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 rounded-md shadow-lg bg-white border border-gray-100 ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-2" role="menu">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center px-4 py-3 text-sm text-[#c9a84c] hover:bg-gray-50 transition-colors"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <LayoutDashboard className="mr-3 h-4 w-4" />
                            Trang quản trị
                          </Link>
                        )}
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <User className="mr-3 h-4 w-4" />
                          Tài khoản của tôi
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center px-4 py-3 text-sm text-red-500 hover:bg-gray-50 transition-colors"
                        >
                          <LogOut className="mr-3 h-4 w-4" />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2 cursor-pointer border border-gray-200 rounded px-2 py-1 hover:border-[#00a680] transition-colors">
                  <div className="w-5 h-5 bg-red-600 rounded-full overflow-hidden flex items-center justify-center border border-gray-200 text-yellow-300 text-[10px]">
                    ★
                  </div>
                  <span className="text-xs font-bold text-gray-700 ml-1">TIẾNG VIỆT</span>
                  <ChevronDown className="h-3 w-3 text-gray-500" />
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setMobileMenuOpen(false)} />
      )}

      <div className={`fixed top-0 left-0 bottom-0 w-[346px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="relative h-full px-3 pt-[30px]">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute left-3 top-[30px] p-0 text-[#006b70] hover:text-[#00a680]"
            aria-label="Đóng menu"
          >
            <Menu className="h-[22px] w-[22px]" strokeWidth={3} />
          </button>

          <div className="flex justify-center">
            <span className="text-center font-sans text-[18px] font-bold uppercase leading-[1.2] text-[#ffd700]">
              GOLDEN<br />PLACE
            </span>
          </div>

          <nav className="mt-[36px] space-y-[34px]">
            {[
              ['GIỚI THIỆU', '/about'],
              ['XEM PHÒNG', '/rooms'],
              ['TÀI KHOẢN', '/profile'],
              ['ĐĂNG KÍ', '/auth/register'],
              ['ĐĂNG NHẬP', '/auth/login'],
            ].map(([label, href]) => (
              <Link
                key={href}
                to={href}
                className="flex items-center justify-between px-0 text-[15px] font-bold uppercase leading-6 text-black hover:text-[#00a680]"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>{label}</span>
                <span className="text-[28px] font-normal leading-none text-black">›</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}
