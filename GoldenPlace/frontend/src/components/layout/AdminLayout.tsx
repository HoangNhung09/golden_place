import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  BarChart3,
  BedDouble,
  Bell,
  ClipboardList,
  Crown,
  FileText,
  Gift,
  History,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Shield,
  Star,
  UserCircle,
  Users,
  Wrench,
} from 'lucide-react'

const menuItems = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Quản lý đặt phòng', path: '/admin/bookings', icon: ClipboardList },
  { name: 'Quản lý phòng', path: '/admin/rooms', icon: BedDouble },
  { name: 'Quản lý khách hàng', path: '/admin/customers', icon: Users },
  { name: 'Quản lý dịch vụ', path: '/admin/services', icon: Wrench },
  { name: 'Lịch sử lưu trú', path: '/admin/history', icon: History },
  { name: 'Khuyến mãi', path: '/admin/promotions', icon: Gift },
  { name: 'Báo cáo thống kê', path: '/admin/reports', icon: BarChart3 },
  { name: 'Quản lý đánh giá', path: '/admin/reviews', icon: MessageSquare },
  { name: 'Quản lý hóa đơn', path: '/admin/invoices', icon: FileText },
  { name: 'Tài khoản', path: '/admin/account', icon: UserCircle },
  { name: 'Quản lý phân quyền', path: '/admin/permissions', icon: Shield },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6] font-sans text-[#111827] [&_h1]:font-sans [&_h2]:font-sans [&_h3]:font-sans">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[240px] border-r border-[#e5e7eb] bg-white lg:block">
        <div className="px-5 py-6">
          <Link to="/admin" className="flex items-center gap-3">
            <Crown className="h-7 w-7 text-[#f6d765]" strokeWidth={1.8} />
            <span className="text-[18px] font-bold tracking-tight">Golden Place</span>
          </Link>
          <div className="mt-6 text-sm">
            <p className="font-semibold">{user?.full_name || 'Admin'}</p>
            <p className="mt-1 text-xs text-[#6b7280]">Role: ADMIN</p>
          </div>
        </div>

        <nav className="border-t border-[#f0f0f0] px-3 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = location.pathname === item.path
            return (
              <Link
                key={`${item.name}-${item.path}`}
                to={item.path}
                className={`mb-1.5 flex h-10 items-center gap-3 rounded-lg px-3 text-[14px] transition ${
                  active
                    ? 'bg-[#f8dc65] font-semibold text-black'
                    : 'text-[#374151] hover:bg-[#f7f7f7] hover:text-black'
                }`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.2 : 1.8} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="lg:pl-[240px]">
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-[#e5e7eb] bg-white px-6 lg:px-8">
          <div className="lg:hidden">
            <Link to="/admin" className="flex items-center gap-2 font-bold">
              <Crown className="h-6 w-6 text-[#f6d765]" />
              Golden Place
            </Link>
          </div>
          <div className="hidden lg:block" />

          <div className="flex items-center gap-6">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#334155] hover:bg-[#f8f8f8]" aria-label="Thông báo">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ff2d3d]" />
            </button>
            <button
              onClick={handleLogout}
              className="flex h-10 items-center gap-2 rounded-lg bg-[#ff2d3d] px-5 text-sm font-semibold text-white hover:bg-[#ef2333]"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        </header>

        <main className="min-h-[calc(100vh-68px)] px-6 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
