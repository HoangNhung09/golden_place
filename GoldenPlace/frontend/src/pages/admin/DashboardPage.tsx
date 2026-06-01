import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Building2, CircleDollarSign, Plus, Users } from 'lucide-react'
import { useAdmin } from '../../hooks/useAdmin'
import { formatVND } from '../../lib/utils'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function DashboardPage() {
  const { useGetDashboardSummary, useGetCheckinsToday, useGetCheckoutsToday } = useAdmin()
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary()
  const { data: checkins = [] } = useGetCheckinsToday()
  const { data: checkouts = [] } = useGetCheckoutsToday()

  useEffect(() => {
    document.title = 'Dashboard | Admin Golden Place'
  }, [])

  if (loadingSummary) return <LoadingSpinner />

  const totalRooms = Number(summary?.total_rooms || 0)
  const occupiedRooms = Number(summary?.guests_in_house || 0)
  const freeRooms = Number(summary?.available_rooms || Math.max(totalRooms - occupiedRooms, 0))
  const customers = Number(summary?.total_customers || 0)
  const maintenanceRooms = Number(summary?.maintenance_rooms || 0)
  const reservedRooms = Number(summary?.reserved_rooms || 0)
  const statusTotal = Math.max(1, freeRooms + occupiedRooms + reservedRooms + maintenanceRooms)
  const freePct = (freeRooms / statusTotal) * 100
  const occupiedPct = freePct + (occupiedRooms / statusTotal) * 100
  const reservedPct = occupiedPct + (reservedRooms / statusTotal) * 100
  const chartFill = freeRooms + occupiedRooms + reservedRooms + maintenanceRooms > 0
    ? `conic-gradient(#15bd83 0 ${freePct}%, #f84146 ${freePct}% ${occupiedPct}%, #3486f5 ${occupiedPct}% ${reservedPct}%, #f5a400 ${reservedPct}% 100%)`
    : '#eef2f7'

  const stats = [
    { label: 'Tổng số phòng', value: totalRooms, unit: 'phòng', icon: Building2, color: 'text-[#0b73ff]', bg: 'bg-[#eef5ff]' },
    { label: 'Phòng đang thuê', value: occupiedRooms, unit: 'phòng', icon: Building2, color: 'text-[#16b978]', bg: 'bg-[#eefbf4]' },
    { label: 'Khách hàng', value: customers, unit: 'khách', icon: Users, color: 'text-[#a855f7]', bg: 'bg-[#faf1ff]' },
    { label: 'Doanh thu hôm nay', value: formatVND(Number(summary?.revenue_today || 0)).replace('₫', ''), unit: 'VND', icon: CircleDollarSign, color: 'text-[#d5a332]', bg: 'bg-[#fff9e8]' },
  ]

  return (
    <div>
      <h1 className="text-[26px] font-bold">Dashboard</h1>

      <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="rounded-lg border border-[#e5e7eb] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[15px] text-[#6b7280]">{item.label}</p>
                  <p className="mt-2 text-[34px] font-bold leading-none">{item.value}</p>
                  <p className="mt-3 text-[13px] text-[#94a3b8]">{item.unit}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${item.bg} ${item.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          )
        })}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-6 shadow-sm">
          <h2 className="text-[20px] font-bold">Doanh thu theo ngày</h2>
          <div className="mt-6 h-[270px]">
            <div className="flex h-full items-end gap-7 border-l border-b border-dashed border-[#d1d5db] px-8 pb-6">
              {[summary?.revenue_today || 0, 0, 0, 0, 0, 0, 0].map((value, index) => {
                const height = value > 0 ? 80 : 8
                return (
                <div key={index} className="flex h-full flex-1 flex-col items-center justify-end gap-3">
                  <div className="w-full rounded-t bg-[#f8cf4d]" style={{ height: `${height}%` }} />
                  <span className="text-xs text-[#6b7280]">{['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'][index]}</span>
                </div>
              )})}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-[#e5e7eb] bg-white p-6 shadow-sm">
          <h2 className="text-[20px] font-bold">Trạng thái phòng</h2>
          <div className="mt-10 flex flex-col items-center gap-8 md:flex-row md:justify-center">
            <div className="h-44 w-44 rounded-full" style={{ background: chartFill }} />
            <div className="grid gap-4 text-[15px]">
              <p><span className="mr-2 inline-block h-3 w-3 rounded-full bg-[#15bd83]" />Phòng trống: {freeRooms}</p>
              <p><span className="mr-2 inline-block h-3 w-3 rounded-full bg-[#f84146]" />Đang thuê: {occupiedRooms}</p>
              <p><span className="mr-2 inline-block h-3 w-3 rounded-full bg-[#3486f5]" />Đặt trước: {reservedRooms}</p>
              <p><span className="mr-2 inline-block h-3 w-3 rounded-full bg-[#f5a400]" />Đang dọn: {maintenanceRooms}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-6 shadow-sm">
          <h2 className="text-[20px] font-bold">Hoạt động gần đây</h2>
          <div className="mt-7 space-y-6 text-[15px]">
            {[...checkins.map((booking: any) => `${booking.guest_name} nhận phòng ${booking.room?.room_number || ''}`), ...checkouts.map((booking: any) => `${booking.guest_name} trả phòng ${booking.room?.room_number || ''}`)].slice(0, 5).map((activity, index) => (
              <div key={activity} className="flex gap-4">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-[#f8d866]" />
                <div>
                  <p>{activity}</p>
                  <p className="mt-1 text-sm text-[#94a3b8]">Từ dữ liệu đặt phòng hôm nay</p>
                </div>
              </div>
            ))}
            {checkins.length === 0 && checkouts.length === 0 && (
              <p className="text-sm text-[#94a3b8]">Chưa có hoạt động check-in/check-out hôm nay.</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-[#e5e7eb] bg-white p-6 shadow-sm">
          <h2 className="text-[20px] font-bold">Thao tác nhanh</h2>
          <div className="mt-6 grid gap-3">
            {[
              ['Thêm phòng', '/admin/rooms'],
              ['Thêm khách hàng', '/admin/customers'],
              ['Tạo đặt phòng', '/admin/bookings'],
              ['Thêm dịch vụ', '/admin/services'],
            ].map(([label, to]) => (
              <Link key={label} to={to} className="flex h-11 items-center gap-3 rounded-lg bg-[#f8d866] px-5 font-semibold text-black hover:bg-[#f5cf43]">
                <Plus className="h-5 w-5" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
