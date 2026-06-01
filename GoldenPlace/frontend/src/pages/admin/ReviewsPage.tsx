import { useState } from 'react'
import { Eye, MessageSquare, RotateCcw, Star, Trash2 } from 'lucide-react'
import { useAdmin } from '../../hooks/useAdmin'
import { formatDateVI } from '../../lib/utils'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const shortId = (value?: string, prefix = '') => (value ? `${prefix}${value.slice(0, 6).toUpperCase()}` : '-')

const statusMeta: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Chưa phản hồi', className: 'bg-[#ff8a8a] text-white' },
  APPROVED: { label: 'Đã phản hồi', className: 'bg-[#d8f8df] text-[#16803a]' },
  HIDDEN: { label: 'Đã ẩn', className: 'bg-[#ffe0e0] text-[#e43b3b]' },
}

function Stars({ value, compact = false }: { value?: number; compact?: boolean }) {
  const rating = Math.max(0, Math.min(5, Math.round(Number(value || 0))))
  return (
    <span className={`inline-flex items-center ${compact ? 'gap-0.5' : 'gap-1'}`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className={`${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} ${index < rating ? 'fill-[#ffc400] text-[#ffc400]' : 'text-[#cbd5e1]'}`} />
      ))}
    </span>
  )
}

export default function ReviewsPage() {
  const { useGetReviews, updateReviewStatus, replyReview } = useAdmin()
  const { data: reviews = [], isLoading } = useGetReviews()
  const [selectedReview, setSelectedReview] = useState<any>(null)
  const [reply, setReply] = useState('')
  const [error, setError] = useState('')

  const openDetail = (review: any) => {
    setSelectedReview(review)
    setReply(review.admin_reply || '')
    setError('')
  }

  const closeDetail = () => {
    setSelectedReview(null)
    setReply('')
    setError('')
  }

  const handleReply = async () => {
    if (!selectedReview) return
    if (reply.trim().length < 2) {
      setError('Vui lòng nhập phản hồi ít nhất 2 ký tự.')
      return
    }

    try {
      await replyReview({ id: selectedReview.id, reply: reply.trim() })
      closeDetail()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Không thể gửi phản hồi.')
    }
  }

  const handleHide = async () => {
    if (!selectedReview) return
    try {
      await updateReviewStatus({ id: selectedReview.id, status: 'HIDDEN' })
      closeDetail()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Không thể ẩn feedback.')
    }
  }

  if (selectedReview) {
    const meta = selectedReview.admin_reply ? statusMeta.APPROVED : (statusMeta[selectedReview.status] || statusMeta.PENDING)
    const roomNumber = selectedReview.room?.room_number || '-'
    const roomType = selectedReview.room?.room_type?.name || '-'
    const customerName = selectedReview.user?.full_name || shortId(selectedReview.user_id, 'AD')
    const contact = selectedReview.user?.phone || selectedReview.user?.email || '-'

    return (
      <div className="min-h-[calc(100vh-88px)] bg-[#f2f2f2] px-3 py-2">
        <div className="grid max-w-[920px] grid-cols-1 gap-20 lg:grid-cols-[470px_250px]">
          <section>
            <h1 className="mb-3 text-[18px] font-semibold text-[#c8c8c8]">Chi tiết feedback-1</h1>
            <div className="rounded-lg bg-white px-14 py-7 shadow-sm">
              <h2 className="text-center text-[16px] font-medium uppercase text-[#ff0b48]">Thông tin chi tiết của feedback</h2>

              {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

              <div className="mt-5 space-y-6 text-[12px] text-[#111827]">
                <div>
                  <h3 className="mb-4 text-[15px] font-medium">Thông Tin Khách hàng</h3>
                  <DetailLine label="Mã khách hàng" value={shortId(selectedReview.user_id, 'AD')} />
                  <DetailLine label="Tên khách hàng" value={customerName} />
                  <DetailLine label="Thông tin liên lạc" value={contact} />
                </div>

                <div>
                  <h3 className="mb-4 text-[15px] font-medium">Thông tin về phòng</h3>
                  <div className="grid grid-cols-2 gap-8">
                    <PillLine label="Số phòng" value={roomNumber} />
                    <PillLine label="Loại phòng" value={roomType} />
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-[15px] font-medium">Feedback</h3>
                  <PillLine label="Thời gian feedback" value={formatDateVI(selectedReview.created_at)} />
                  <div className="mt-4 grid grid-cols-[110px_1fr] items-center gap-3">
                    <span className="text-[11px] text-[#475569]">Điểm</span>
                    <span className="inline-flex h-7 w-[96px] items-center justify-center rounded-full border border-[#85ccff] bg-[#cdeeff] text-[#ffc400]">
                      <Stars value={selectedReview.rating_overall} compact />
                    </span>
                  </div>
                  <div className="mt-4">
                    <span className="mb-2 block text-[11px] text-[#475569]">Nội dung đánh giá</span>
                    <div className="min-h-[96px] rounded-lg border border-[#85ccff] bg-[#cdeeff] px-3 py-3 text-[11px] leading-4 text-[#111827]">
                      {selectedReview.comment || 'Không có nội dung đánh giá.'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-[90px_1fr] items-center gap-4">
                  <span className="text-[14px] font-medium">Trạng thái</span>
                  <span className={`inline-flex h-7 w-fit items-center justify-center rounded-lg px-5 text-[12px] font-semibold ${meta.className}`}>{meta.label}</span>
                </div>

                <div className="grid grid-cols-[90px_1fr] items-center gap-4">
                  <span className="text-[14px] font-medium">Hành động</span>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={handleReply} className="inline-flex h-7 items-center gap-1 rounded-lg bg-[#83df8b] px-4 text-[12px] font-semibold text-white">
                      <MessageSquare className="h-3.5 w-3.5" /> Phản hồi
                    </button>
                    <button onClick={handleHide} className="inline-flex h-7 items-center gap-1 rounded-lg bg-[#ec3434] px-4 text-[12px] font-semibold text-white">
                      <Trash2 className="h-3.5 w-3.5" /> Xóa
                    </button>
                    <button onClick={closeDetail} className="inline-flex h-7 items-center gap-1 rounded-lg bg-[#a9ddff] px-4 text-[12px] font-semibold text-white">
                      <RotateCcw className="h-3.5 w-3.5" /> Quay lại
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="pt-0 lg:pt-1">
            <h2 className="mb-3 text-[18px] font-semibold text-[#c8c8c8]">Phản hồi KH</h2>
            <div className="rounded-lg bg-white px-5 py-6 shadow-sm">
              <textarea
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                placeholder="Viết phản hồi........."
                className="h-[118px] w-full resize-none rounded-2xl border-0 bg-[#d9d9d9] px-4 py-4 text-[11px] text-gray-700 outline-none placeholder:text-gray-500"
              />
              <div className="mt-4 text-right">
                <button onClick={handleReply} className="h-7 rounded-lg bg-[#f8d86b] px-5 text-[12px] font-semibold text-white">
                  Phản hồi
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-[24px] font-bold">Quản lý đánh giá</h1>
      <p className="mt-3 text-[#475569]">Xem và quản lý phản hồi từ khách hàng</p>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="mt-7 overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-[15px] text-[#475569]">
              <thead className="bg-[#fafafa] text-xs font-bold uppercase">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Khách hàng</th>
                  <th className="px-6 py-4">Phòng</th>
                  <th className="px-6 py-4">Số sao</th>
                  <th className="px-6 py-4">Nội dung</th>
                  <th className="px-6 py-4">Ngày đánh giá</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {reviews.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-10 text-center text-[#64748b]">Chưa có đánh giá nào.</td></tr>
                ) : reviews.map((review: any) => {
                  const meta = review.admin_reply ? statusMeta.APPROVED : (statusMeta[review.status] || statusMeta.PENDING)
                  return (
                    <tr key={review.id} className="border-t border-[#edf0f4]">
                      <td className="px-6 py-5 font-medium text-[#111827]">{shortId(review.user_id, 'AD')}</td>
                      <td className="px-6 py-5 font-semibold text-[#111827]">{review.user?.full_name || shortId(review.user_id)}</td>
                      <td className="px-6 py-5">{review.room?.room_number || '-'}</td>
                      <td className="px-6 py-5"><Stars value={review.rating_overall} /></td>
                      <td className="max-w-[280px] truncate px-6 py-5">{review.comment || '-'}</td>
                      <td className="px-6 py-5">{formatDateVI(review.created_at)}</td>
                      <td className="px-6 py-5"><span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}>{meta.label}</span></td>
                      <td className="px-6 py-5">
                        <button onClick={() => openDetail(review)} className="inline-flex min-w-[118px] items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#2f73ff] px-3 py-2 text-[#2f73ff]">
                          <Eye className="mr-1 inline h-4 w-4" />Chi tiết
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <label className="mb-4 block">
      <span className="mb-2 block text-[11px] text-[#475569]">{label}</span>
      <span className="block border-b border-[#2f2f2f] px-1 pb-2 text-[11px]">{value}</span>
    </label>
  )
}

function PillLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[90px_1fr] items-center gap-3">
      <span className="text-[11px] text-[#475569]">{label}</span>
      <span className="inline-flex h-7 min-w-[58px] items-center justify-center rounded-full border border-[#85ccff] bg-[#cdeeff] px-4 text-[11px] text-[#64748b]">
        {value}
      </span>
    </div>
  )
}
