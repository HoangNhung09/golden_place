import { Building2, Calendar, DollarSign, Download, Users } from 'lucide-react'
import { useAdmin } from '../../hooks/useAdmin'
import { formatVND } from '../../lib/utils'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function ReportsPage() {
  const { useGetDashboardSummary, useGetRevenueReport, useGetOccupancyReport } = useAdmin()
  const { data: summary, isLoading: isSummaryLoading } = useGetDashboardSummary()
  const { data: revenueReport, isLoading: isRevenueLoading } = useGetRevenueReport(6)
  const { data: occupancyReport, isLoading: isOccupancyLoading } = useGetOccupancyReport(6)

  if (isSummaryLoading || isRevenueLoading || isOccupancyLoading) return <LoadingSpinner />

  const revenueRows = revenueReport?.chart_data || []
  const occupancyRows = occupancyReport?.chart_data || []
  const maxRevenue = Math.max(1, ...revenueRows.map((row: any) => Number(row.revenue || 0)))
  const latestOccupancy = occupancyRows[occupancyRows.length - 1]

  const cards = [
    { label: 'Doanh thu kỳ này', value: formatVND(Number(revenueReport?.summary?.total_revenue || 0)), icon: DollarSign, color: 'text-[#d5a332]' },
    { label: 'Đặt phòng kỳ này', value: revenueReport?.summary?.total_bookings || 0, icon: Calendar, color: 'text-[#2f73ff]' },
    { label: 'Tỷ lệ lấp đầy', value: `${latestOccupancy?.occupancy_rate ?? summary?.occupancy_rate ?? 0}%`, icon: Building2, color: 'text-[#16a34a]' },
    { label: 'Tổng khách hàng', value: summary?.total_customers || 0, icon: Users, color: 'text-[#a855f7]' },
  ]

  const roomStats = [
    ['Phòng trống', summary?.available_rooms || 0],
    ['Đang thuê', summary?.guests_in_house || 0],
    ['Đặt trước', summary?.reserved_rooms || 0],
    ['Bảo trì / khóa', Number(summary?.maintenance_rooms || 0) + Number(summary?.blocked_rooms || 0)],
  ]

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[26px] font-bold">Báo cáo thống kê</h1>
        <button className="flex h-10 items-center gap-2 rounded-lg bg-[#f8d866] px-5 font-semibold">
          <Download className="h-5 w-5" />
          Xuất báo cáo
        </button>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="rounded-lg border border-[#e5e7eb] bg-white p-6 shadow-sm">
              <p className="text-[#64748b]">{card.label}</p>
              <div className="mt-4 flex items-center justify-between gap-4">
                <strong className="text-[28px]">{card.value}</strong>
                <Icon className={`h-8 w-8 ${card.color}`} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-[#e5e7eb] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Doanh thu theo ngày</h2>
          <div className="mt-8 flex h-72 items-end gap-5 border-l border-b border-dashed border-[#d1d5db] px-8 pb-6">
            {revenueRows.map((row: any) => {
              const value = Number(row.revenue || 0)
              return (
                <div key={row.date} className="flex flex-1 flex-col items-center gap-3">
                  <div className="w-full rounded-t bg-[#f8d866]" style={{ height: `${Math.max(12, (value / maxRevenue) * 190)}px` }} />
                  <span className="text-xs text-[#64748b]">{String(row.date).slice(5)}</span>
                </div>
              )
            })}
          </div>
        </section>

        <section className="rounded-lg border border-[#e5e7eb] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Thống kê phòng</h2>
          <div className="mt-8 space-y-4">
            {roomStats.map(([label, value]) => (
              <div key={label}>
                <div className="flex justify-between text-sm">
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
                <div className="mt-2 h-3 rounded-full bg-[#edf0f4]">
                  <div className="h-3 rounded-full bg-[#f8d866]" style={{ width: `${Math.min(100, (Number(value) / Math.max(1, Number(summary?.total_rooms || 1))) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
