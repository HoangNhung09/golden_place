import { useEffect, useState } from 'react'
import { Edit2, Plus, Search, Trash2, X } from 'lucide-react'
import { useAdmin } from '../../hooks/useAdmin'
import { formatVND } from '../../lib/utils'
import LoadingSpinner from '../../components/common/LoadingSpinner'

type ServiceForm = {
  id?: string
  name: string
  description: string
  price: string
  unit: string
  image_url: string
}

const emptyForm: ServiceForm = {
  name: '',
  description: '',
  price: '',
  unit: '/lượt',
  image_url: '',
}

export default function ServicesPage() {
  const { useGetServices, createService, updateService, deleteService, toggleServiceActive } = useAdmin()
  const { data: services = [], isLoading } = useGetServices()
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<ServiceForm>(emptyForm)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Quản lý dịch vụ | Admin Golden Place'
  }, [])

  const rows = services.filter((item: any) => `${item.name} ${item.description || ''}`.toLowerCase().includes(search.toLowerCase()))
  const isEditing = Boolean(form.id)

  const openCreate = () => {
    setForm(emptyForm)
    setError('')
    setIsModalOpen(true)
  }

  const openEdit = (service: any) => {
    setForm({
      id: service.id,
      name: service.name || '',
      description: service.description || '',
      price: String(service.price || ''),
      unit: service.unit || '/lượt',
      image_url: service.image_url || '',
    })
    setError('')
    setIsModalOpen(true)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      price: Number(form.price),
      unit: form.unit.trim() || '/lượt',
      image_url: form.image_url.trim() || undefined,
    }

    if (!payload.name || !payload.price || payload.price <= 0) {
      setError('Vui lòng nhập tên dịch vụ và giá hợp lệ.')
      return
    }

    try {
      if (form.id) await updateService({ id: form.id, ...payload })
      else await createService(payload)
      setIsModalOpen(false)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Không thể lưu dịch vụ.')
    }
  }

  const handleDelete = async (service: any) => {
    if (!window.confirm(`Xóa dịch vụ "${service.name}"?`)) return
    try {
      await deleteService(service.id)
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Không thể xóa dịch vụ.')
    }
  }

  return (
    <div>
      <h1 className="text-[26px] font-bold">Quản lý dịch vụ</h1>

      <div className="mt-8 rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <button onClick={openCreate} className="flex h-10 items-center gap-2 rounded-lg bg-[#f8d866] px-5 text-sm font-semibold hover:bg-[#f5cf43]">
            <Plus className="h-5 w-5" />
            Thêm dịch vụ
          </button>
          <label className="relative min-w-[280px] flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#94a3b8]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm tên dịch vụ..." className="h-10 w-full rounded-lg border border-[#d9e0ea] pl-12 pr-4 outline-none focus:border-[#f8d866]" />
          </label>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-[15px] text-[#475569]">
              <thead className="bg-[#fafafa] text-xs font-bold uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-4">Tên dịch vụ</th>
                  <th className="px-6 py-4">Đơn vị</th>
                  <th className="px-6 py-4">Giá</th>
                  <th className="px-6 py-4">Mô tả</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-[#64748b]">Chưa có dịch vụ.</td></tr>
                ) : rows.map((service: any) => (
                  <tr key={service.id} className="border-t border-[#edf0f4]">
                    <td className="px-6 py-5 font-semibold text-[#111827]">{service.name}</td>
                    <td className="px-6 py-5">{service.unit || '-'}</td>
                    <td className="px-6 py-5 font-bold text-[#d5a332]">{formatVND(service.price)}</td>
                    <td className="max-w-[260px] px-6 py-5">{service.description || '-'}</td>
                    <td className="px-6 py-5">
                      <button onClick={() => toggleServiceActive(service.id)} className={`rounded-full px-3 py-1 text-xs font-semibold ${service.is_active ? 'bg-[#dffbea] text-[#16a34a]' : 'bg-[#eef0f4] text-[#64748b]'}`}>
                        {service.is_active ? 'Hoạt động' : 'Tạm dừng'}
                      </button>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(service)} className="flex h-9 items-center gap-1 rounded-lg border border-[#dbe1ea] px-3">
                          <Edit2 className="h-4 w-4" />
                          Sửa
                        </button>
                        <button onClick={() => handleDelete(service)} className="flex h-9 items-center gap-1 rounded-lg bg-[#ff2d3d] px-3 font-semibold text-white">
                          <Trash2 className="h-4 w-4" />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <form onSubmit={handleSubmit} className="w-full max-w-[520px] rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{isEditing ? 'Sửa dịch vụ' : 'Thêm dịch vụ'}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            {error && <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <div className="mt-5 grid gap-4">
              <label className="text-sm font-medium">Tên dịch vụ<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-2 h-11 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
              <label className="text-sm font-medium">Giá<input type="number" min="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-2 h-11 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
              <label className="text-sm font-medium">Đơn vị<input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="mt-2 h-11 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
              <label className="text-sm font-medium">URL ảnh<input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="mt-2 h-11 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
              <label className="text-sm font-medium">Mô tả<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-2 h-24 w-full rounded-lg border border-[#d9e0ea] px-3 py-2" /></label>
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
