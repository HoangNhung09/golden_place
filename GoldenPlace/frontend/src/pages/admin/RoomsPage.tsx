import { useEffect, useMemo, useState } from 'react'
import { Edit2, Eye, Plus, Trash2, X } from 'lucide-react'
import { useAdmin } from '../../hooks/useAdmin'
import { formatVND } from '../../lib/utils'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const tabs = [
  { label: 'Tất cả', value: '' },
  { label: 'Trống', value: 'AVAILABLE' },
  { label: 'Bảo trì', value: 'MAINTENANCE' },
  { label: 'Đã khóa', value: 'BLOCKED' },
]

const statusMeta: Record<string, { label: string; className: string }> = {
  AVAILABLE: { label: 'Trống', className: 'bg-[#dffbea] text-[#16a34a]' },
  MAINTENANCE: { label: 'Bảo trì', className: 'bg-[#fff0db] text-[#f05a24]' },
  BLOCKED: { label: 'Đã khóa', className: 'bg-[#dbeafe] text-[#2563eb]' },
}

type RoomForm = {
  id?: string
  room_number: string
  room_type_id: string
  floor: string
  max_adults: string
  max_children: string
  area_sqm: string
  base_price: string
  weekend_price: string
  description: string
  image_url: string
  status: 'AVAILABLE' | 'MAINTENANCE' | 'BLOCKED'
}

const emptyForm: RoomForm = {
  room_number: '',
  room_type_id: '',
  floor: '1',
  max_adults: '2',
  max_children: '0',
  area_sqm: '',
  base_price: '',
  weekend_price: '',
  description: '',
  image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200',
  status: 'AVAILABLE',
}

export default function RoomsPage() {
  const { useGetRooms, useGetRoomTypes, createRoom, updateRoom, deleteRoom, updateRoomStatus } = useAdmin()
  const { data: rooms = [], isLoading } = useGetRooms()
  const { data: roomTypes = [] } = useGetRoomTypes()
  const [status, setStatus] = useState('')
  const [form, setForm] = useState<RoomForm>(emptyForm)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Quản lý phòng | Admin Golden Place'
  }, [])

  const filteredRooms = useMemo(() => {
    if (!status) return rooms
    return rooms.filter((room: any) => room.status === status)
  }, [rooms, status])

  const counts = {
    all: rooms.length,
    AVAILABLE: rooms.filter((room: any) => room.status === 'AVAILABLE').length,
    MAINTENANCE: rooms.filter((room: any) => room.status === 'MAINTENANCE').length,
    BLOCKED: rooms.filter((room: any) => room.status === 'BLOCKED').length,
  }

  const openCreate = () => {
    setForm({ ...emptyForm, room_type_id: roomTypes[0]?.id || '' })
    setError('')
    setIsModalOpen(true)
  }

  const openEdit = (room: any) => {
    setForm({
      id: room.id,
      room_number: room.room_number || '',
      room_type_id: room.room_type_id || '',
      floor: String(room.floor || 1),
      max_adults: String(room.max_adults || 2),
      max_children: String(room.max_children || 0),
      area_sqm: room.area_sqm ? String(room.area_sqm) : '',
      base_price: String(room.base_price || ''),
      weekend_price: room.weekend_price ? String(room.weekend_price) : '',
      description: room.description || '',
      image_url: room.images?.[0] || emptyForm.image_url,
      status: room.status || 'AVAILABLE',
    })
    setError('')
    setIsModalOpen(true)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (!form.room_number.trim() || !form.room_type_id || !Number(form.base_price)) {
      setError('Vui lòng nhập số phòng, loại phòng và giá phòng.')
      return
    }

    const payload = {
      room_number: form.room_number.trim(),
      room_type_id: form.room_type_id,
      floor: Number(form.floor || 1),
      max_adults: Number(form.max_adults || 1),
      max_children: Number(form.max_children || 0),
      area_sqm: form.area_sqm ? Number(form.area_sqm) : undefined,
      base_price: Number(form.base_price),
      weekend_price: form.weekend_price ? Number(form.weekend_price) : undefined,
      description: form.description.trim() || undefined,
      images: [form.image_url.trim() || emptyForm.image_url],
      status: form.status,
    }

    try {
      if (form.id) await updateRoom({ id: form.id, ...payload })
      else await createRoom(payload)
      setIsModalOpen(false)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Không thể lưu phòng.')
    }
  }

  const handleDelete = async (room: any) => {
    if (!window.confirm(`Xóa phòng ${room.room_number}?`)) return
    try {
      await deleteRoom(room.id)
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Không thể xóa phòng.')
    }
  }

  const handleStatusChange = async (room: any, nextStatus: string) => {
    try {
      await updateRoomStatus({ id: room.id, status: nextStatus })
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Không thể đổi trạng thái phòng.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[26px] font-bold">Quản lý phòng</h1>
        <button onClick={openCreate} className="flex h-10 items-center gap-2 rounded-lg bg-[#f8d866] px-5 text-sm font-semibold hover:bg-[#f5cf43]">
          <Plus className="h-5 w-5" />
          Thêm phòng mới
        </button>
      </div>

      <div className="mt-10 rounded-none bg-white py-5">
        <div className="flex flex-wrap gap-3">
          {tabs.map((tab) => {
            const active = status === tab.value
            const count = tab.value === '' ? counts.all : counts[tab.value as keyof typeof counts]
            return (
              <button key={tab.label} onClick={() => setStatus(tab.value)} className={`rounded-full px-4 py-2 text-sm font-medium ${active ? 'bg-[#f8d866] text-black' : 'text-[#475569] hover:bg-[#f7f7f7]'}`}>
                {tab.label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredRooms.length === 0 ? (
            <div className="rounded-lg border border-[#e5e7eb] bg-white p-6 text-[#64748b] shadow-sm xl:col-span-3">Chưa có phòng phù hợp.</div>
          ) : filteredRooms.map((room: any) => {
            const meta = statusMeta[room.status] || statusMeta.AVAILABLE
            return (
              <article key={room.id} className="rounded-lg border border-[#e5e7eb] bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-[28px] font-bold leading-none">Phòng {room.room_number}</h2>
                    <p className="mt-3 text-sm font-bold uppercase text-[#304ffe]">{room.room_type?.name || '-'}</p>
                    <p className="mt-1 text-sm text-[#64748b]">Tầng {room.floor}</p>
                  </div>
                  <select value={room.status} onChange={(event) => handleStatusChange(room, event.target.value)} className={`rounded-full px-3 py-1 text-xs font-semibold outline-none ${meta.className}`}>
                    <option value="AVAILABLE">Trống</option>
                    <option value="MAINTENANCE">Bảo trì</option>
                    <option value="BLOCKED">Đã khóa</option>
                  </select>
                </div>

                <div className="mt-6">
                  <span className="text-[28px] font-bold text-[#d5a332]">{formatVND(room.base_price)}</span>
                  <span className="ml-1 text-sm text-[#64748b]">/ đêm</span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                  <p><span className="text-[#64748b]">Người lớn:</span> <strong>{room.max_adults}</strong></p>
                  <p><span className="text-[#64748b]">Trẻ em:</span> <strong>{room.max_children}</strong></p>
                  <p><span className="text-[#64748b]">Diện tích:</span> <strong>{room.area_sqm || '-'} m2</strong></p>
                  <p><span className="text-[#64748b]">Cuối tuần:</span> <strong>{room.weekend_price ? formatVND(room.weekend_price) : '-'}</strong></p>
                </div>

                <div className="mt-5 flex gap-2 border-t border-[#eef2f7] pt-4">
                  <button onClick={() => openEdit(room)} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-[#dbe1ea] text-sm font-semibold hover:bg-[#f8fafc]">
                    <Edit2 className="h-4 w-4" />
                    Sửa
                  </button>
                  <button onClick={() => openEdit(room)} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-[#dbe1ea] text-sm font-semibold hover:bg-[#f8fafc]">
                    <Eye className="h-4 w-4" />
                    Chi tiết
                  </button>
                  <button onClick={() => handleDelete(room)} className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ff2d3d] text-white hover:bg-[#ef2333]" aria-label="Xóa phòng">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <form onSubmit={handleSubmit} className="max-h-[90vh] w-full max-w-[720px] overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{form.id ? 'Sửa phòng' : 'Thêm phòng'}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            {error && <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium">Số phòng<input value={form.room_number} onChange={(e) => setForm({ ...form, room_number: e.target.value })} className="mt-2 h-11 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
              <label className="text-sm font-medium">Loại phòng<select value={form.room_type_id} onChange={(e) => setForm({ ...form, room_type_id: e.target.value })} className="mt-2 h-11 w-full rounded-lg border border-[#d9e0ea] px-3">{roomTypes.map((type: any) => <option key={type.id} value={type.id}>{type.name}</option>)}</select></label>
              <label className="text-sm font-medium">Tầng<input type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} className="mt-2 h-11 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
              <label className="text-sm font-medium">Trạng thái<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as RoomForm['status'] })} className="mt-2 h-11 w-full rounded-lg border border-[#d9e0ea] px-3"><option value="AVAILABLE">Trống</option><option value="MAINTENANCE">Bảo trì</option><option value="BLOCKED">Đã khóa</option></select></label>
              <label className="text-sm font-medium">Người lớn<input type="number" min="1" value={form.max_adults} onChange={(e) => setForm({ ...form, max_adults: e.target.value })} className="mt-2 h-11 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
              <label className="text-sm font-medium">Trẻ em<input type="number" min="0" value={form.max_children} onChange={(e) => setForm({ ...form, max_children: e.target.value })} className="mt-2 h-11 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
              <label className="text-sm font-medium">Diện tích<input type="number" min="0" value={form.area_sqm} onChange={(e) => setForm({ ...form, area_sqm: e.target.value })} className="mt-2 h-11 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
              <label className="text-sm font-medium">Giá/đêm<input type="number" min="1" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: e.target.value })} className="mt-2 h-11 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
              <label className="text-sm font-medium">Giá cuối tuần<input type="number" min="1" value={form.weekend_price} onChange={(e) => setForm({ ...form, weekend_price: e.target.value })} className="mt-2 h-11 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
              <label className="text-sm font-medium">URL ảnh<input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="mt-2 h-11 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
              <label className="text-sm font-medium md:col-span-2">Mô tả<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-2 h-24 w-full rounded-lg border border-[#d9e0ea] px-3 py-2" /></label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="h-10 rounded-lg border border-[#d9e0ea] px-5">Hủy</button>
              <button className="h-10 rounded-lg bg-[#f8d866] px-5 font-semibold">Lưu</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
