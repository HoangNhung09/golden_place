import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronDown, ChevronRight, LayoutGrid, List } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useRooms } from '../../hooks/useRooms'
import { formatVND, getRoomPrimaryImage } from '../../lib/utils'

const discounts = [6, 17, 8, 25, 17, 0, 0, 0, 0, 0, 20, 45]

function priceText(amount: number) {
  return `${formatVND(amount).replace(/\s/g, '').replace('₫', 'đ')}/đêm`
}

function getRoomRating(room: any, index: number) {
  const rating = Number(room.average_rating || 0)
  const count = Number(room.total_reviews || 0)

  if (rating > 0 && count > 0) {
    return {
      label: rating >= 4.5 ? 'Xuất sắc' : rating >= 4 ? 'Khá' : 'Tốt',
      score: rating.toFixed(1),
      count,
    }
  }

  const score = [4.8, 4.7, 4.9, 4.6, 4.5, 4.8][index % 6]
  const fallbackCount = 18 + (Number(room.room_number || index) % 7) * 9
  return {
    label: score >= 4.7 ? 'Xuất sắc' : 'Khá',
    score: score.toFixed(1),
    count: fallbackCount,
  }
}

export default function RoomsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { useGetRooms, useGetRoomTypes } = useRooms()

  const [roomTypeId, setRoomTypeId] = useState(searchParams.get('room_type_id') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || '')
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    document.title = 'Danh sách phòng | Golden Place'
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    setRoomTypeId(searchParams.get('room_type_id') || '')
    setSortBy(searchParams.get('sort_by') || '')
    setPage(Number(searchParams.get('page')) || 1)
  }, [searchParams])

  const { data: roomsData, isLoading } = useGetRooms({
    room_type_id: roomTypeId || undefined,
    sort_by: sortBy || undefined,
    page,
    limit: 12,
  })
  const { data: roomTypes } = useGetRoomTypes()

  const handleFilterChange = (updates: Record<string, string | number>) => {
    const nextParams = new URLSearchParams(searchParams)

    Object.entries(updates).forEach(([key, value]) => {
      if (value === '' || value === undefined || value === null) {
        nextParams.delete(key)
      } else {
        nextParams.set(key, String(value))
      }
    })

    if (!updates.page) nextParams.set('page', '1')
    setSearchParams(nextParams)
  }

  const totalPages = roomsData?.pages || 1
  const rooms = roomsData?.rooms || []

  const selectClass =
    'h-11 min-w-[180px] appearance-none border border-gray-200 bg-white px-5 pr-10 text-[13px] font-semibold text-gray-700 outline-none transition focus:border-[#f5b400]'

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-100">
        <div className="mx-auto max-w-[1140px] px-4 py-4 text-[13px]">
          <Link to="/" className="text-gray-600 transition hover:text-gray-950">Trang chủ</Link>
          <span className="mx-2 text-gray-300">/</span>
          <span className="font-semibold text-[#00a884]">Tất cả phòng</span>
        </div>
      </div>

      <main className="mx-auto max-w-[1140px] px-4 pb-20 pt-8">
        <h1 className="text-[32px] font-normal leading-10 text-gray-900">Danh sách phòng</h1>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-4">
            <label className="relative">
              <select
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value)
                  handleFilterChange({ sort_by: event.target.value })
                }}
                className={selectClass}
              >
                <option value="">Giá phòng</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-700" />
            </label>

            <label className="relative">
              <select
                value={roomTypeId}
                onChange={(event) => {
                  setRoomTypeId(event.target.value)
                  handleFilterChange({ room_type_id: event.target.value })
                }}
                className={selectClass}
              >
                <option value="">Loại phòng</option>
                {roomTypes?.map((type: any) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-700" />
            </label>

            <label className="relative">
              <select className={selectClass}>
                <option value="">Kích thước</option>
                <option value="small">&lt; 30 m²</option>
                <option value="medium">30 - 50 m²</option>
                <option value="large">&gt; 50 m²</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-700" />
            </label>

            <label className="relative">
              <select className={selectClass}>
                <option value="">Tiện nghi phòng</option>
                <option value="wifi">WiFi miễn phí</option>
                <option value="pool">Hồ bơi</option>
                <option value="spa">Spa</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-700" />
            </label>
          </div>

          <div className="flex items-center">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Xem dạng lưới"
              className={`flex h-11 w-11 items-center justify-center border border-gray-200 ${viewMode === 'grid' ? 'bg-[#ffcc00] text-gray-950' : 'bg-white text-gray-700'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              aria-label="Xem dạng danh sách"
              className={`ml-2 flex h-11 w-11 items-center justify-center border border-gray-200 ${viewMode === 'list' ? 'bg-[#ffcc00] text-gray-950' : 'bg-white text-gray-700'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-24"><LoadingSpinner /></div>
        ) : rooms.length > 0 ? (
          <div className={`mt-8 grid gap-x-[30px] gap-y-[70px] ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {rooms.map((room: any, index: number) => {
              const review = getRoomRating(room, index)
              const discount = discounts[index % discounts.length]
              const title = `Phòng ${room.room_number} - ${room.room_type?.name || 'Golden Place'}`
              const subtitle = room.description || room.room_type?.description || 'Phòng nghỉ tiện nghi tại Golden Place'

              return (
                <button
                  key={room.id}
                  onClick={() => navigate(`/rooms/${room.id}`)}
                  className={`group text-left ${viewMode === 'list' ? 'flex gap-6' : 'block'}`}
                >
                  <div className={`relative overflow-hidden bg-gray-100 ${viewMode === 'list' ? 'h-[220px] w-[360px] flex-shrink-0' : 'aspect-[1.5/1]'}`}>
                    <img
                      src={getRoomPrimaryImage(room.images)}
                      alt={title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    {discount > 0 && (
                      <span className="absolute left-4 top-4 bg-[#ff6848] px-3 py-1 text-[13px] text-white">- {discount}%</span>
                    )}
                    <span className="absolute bottom-0 right-0 bg-[#00a884] px-4 py-2 text-[22px] leading-7 text-white">
                      {priceText(room.base_price)}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-[#ffcc00] px-2.5 py-1 text-[14px] leading-none text-gray-950">{review.label}</span>
                      <span className="bg-[#ffdf5d] px-2 py-1 text-[14px] leading-none text-gray-950">{review.score}</span>
                      <span className="text-[14px] text-gray-400">( {review.count} đánh giá )</span>
                    </div>
                    <h2 className="mt-3 text-[16px] font-semibold text-gray-900">{title}</h2>
                    <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-gray-500">{subtitle}</p>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="mt-10 border border-dashed border-gray-300 py-20 text-center text-sm text-gray-500">
            Không tìm thấy phòng phù hợp.
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-20 flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1
              return (
                <button
                  key={pageNumber}
                  onClick={() => {
                    setPage(pageNumber)
                    handleFilterChange({ page: pageNumber })
                  }}
                  className={`h-11 w-11 border text-sm ${page === pageNumber ? 'border-[#00a884] bg-[#00a884] text-white' : 'border-gray-200 bg-white text-gray-700'}`}
                >
                  {pageNumber}
                </button>
              )
            })}
            <button
              onClick={() => {
                const nextPage = Math.min(totalPages, page + 1)
                setPage(nextPage)
                handleFilterChange({ page: nextPage })
              }}
              disabled={page === totalPages}
              className="flex h-11 w-11 items-center justify-center border border-gray-200 bg-white text-gray-700 disabled:opacity-40"
              aria-label="Trang tiếp theo"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
