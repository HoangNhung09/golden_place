import { useEffect, useState } from 'react'
import { Edit2, Plus, Search, Trash2, X } from 'lucide-react'
import { useAdmin } from '../../hooks/useAdmin'
import LoadingSpinner from '../../components/common/LoadingSpinner'

type CustomerForm = {
  id?: string
  full_name: string
  email: string
  phone: string
  password: string
  id_number: string
  address: string
  nationality: string
  gender: string
}

const emptyForm: CustomerForm = {
  full_name: '',
  email: '',
  phone: '',
  password: '',
  id_number: '',
  address: '',
  nationality: 'Việt Nam',
  gender: '',
}

export default function CustomersPage() {
  const { useGetCustomers, createCustomer, updateCustomer, deleteCustomer, toggleCustomerActive } = useAdmin()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [form, setForm] = useState<CustomerForm>(emptyForm)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState('')
  const { data, isLoading } = useGetCustomers({ search: search || undefined, page, limit: 5 })

  useEffect(() => {
    document.title = 'Quản lý khách hàng | Admin Golden Place'
  }, [])

  const customers = data?.customers || data?.items || []
  const total = data?.total || customers.length
  const pages = data?.pages || 1
  const isEditing = Boolean(form.id)

  const openCreate = () => {
    setForm(emptyForm)
    setError('')
    setIsModalOpen(true)
  }

  const openEdit = (customer: any) => {
    setForm({
      id: customer.id,
      full_name: customer.full_name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      password: '',
      id_number: customer.id_number || '',
      address: customer.address || '',
      nationality: customer.nationality || 'Việt Nam',
      gender: customer.gender || '',
    })
    setError('')
    setIsModalOpen(true)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (!form.full_name.trim() || !form.email.trim()) {
      setError('Vui lòng nhập họ tên và email.')
      return
    }
    if (!form.id && form.password.length < 8) {
      setError('Mật khẩu khách hàng mới cần ít nhất 8 ký tự.')
      return
    }

    const payload: any = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      id_number: form.id_number.trim() || undefined,
      address: form.address.trim() || undefined,
      nationality: form.nationality.trim() || undefined,
      gender: form.gender || undefined,
    }
    if (!form.id) payload.password = form.password

    try {
      if (form.id) await updateCustomer({ id: form.id, ...payload })
      else await createCustomer(payload)
      setIsModalOpen(false)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Không thể lưu khách hàng.')
    }
  }

  const handleDelete = async (customer: any) => {
    if (!window.confirm(`Khóa khách hàng "${customer.full_name}"?`)) return
    try {
      await deleteCustomer(customer.id)
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Không thể khóa khách hàng.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-4">
        <h1 className="text-[26px] font-bold">Quản lý khách hàng</h1>
      </div>

      <button onClick={openCreate} className="mt-4 flex h-10 items-center gap-2 rounded-lg bg-[#f8d866] px-5 text-sm font-semibold hover:bg-[#f5cf43]">
        <Plus className="h-5 w-5" />
        Thêm khách hàng
      </button>

      <div className="mt-6 rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-sm">
        <label className="relative block">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#94a3b8]" />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Tìm kiếm theo tên, email, số điện thoại..." className="h-12 w-full rounded-lg border border-[#d9e0ea] pl-12 pr-4 text-[15px] outline-none focus:border-[#f8d866]" />
        </label>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left text-[15px] text-[#475569]">
              <thead className="bg-[#fafafa] text-xs font-bold uppercase tracking-wide text-[#475569]">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Họ tên</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Số điện thoại</th>
                  <th className="px-6 py-4">CCCD</th>
                  <th className="px-6 py-4">Địa chỉ</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-10 text-center text-[#64748b]">Chưa có khách hàng.</td></tr>
                ) : customers.map((customer: any, index: number) => (
                  <tr key={customer.id} className="border-t border-[#edf0f4]">
                    <td className="px-6 py-5">{(page - 1) * 5 + index + 1}</td>
                    <td className="px-6 py-5 font-semibold text-[#1f2937]">{customer.full_name}</td>
                    <td className="px-6 py-5">{customer.email}</td>
                    <td className="px-6 py-5">{customer.phone || '-'}</td>
                    <td className="px-6 py-5">{customer.id_number || '-'}</td>
                    <td className="max-w-[180px] px-6 py-5">{customer.address || '-'}</td>
                    <td className="px-6 py-5">
                      <button onClick={() => toggleCustomerActive(customer.id)} className={`rounded-full px-3 py-1 text-xs font-semibold ${customer.is_active ? 'bg-[#dffbea] text-[#16a34a]' : 'bg-[#fee2e2] text-[#ef4444]'}`}>
                        {customer.is_active ? 'Hoạt động' : 'Đã khóa'}
                      </button>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openEdit(customer)} className="flex h-9 items-center gap-1 rounded-full border border-[#dbe1ea] px-3 text-sm font-medium hover:bg-[#f8fafc]">
                          <Edit2 className="h-4 w-4" />
                          Sửa
                        </button>
                        <button onClick={() => handleDelete(customer)} className="flex h-9 items-center gap-1 rounded-full bg-[#ff2d3d] px-3 text-sm font-semibold text-white hover:bg-[#ef2333]">
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

          <div className="flex items-center justify-between border-t border-[#edf0f4] px-6 py-4 text-sm text-[#475569]">
            <span>Hiển thị {customers.length}/{total} khách hàng</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded border border-[#dbe1ea] px-3 py-2 disabled:opacity-40">Trước</button>
              {Array.from({ length: Math.min(pages, 3) }).map((_, index) => (
                <button key={index} onClick={() => setPage(index + 1)} className={`rounded px-3 py-2 ${page === index + 1 ? 'bg-[#f8d866] font-bold' : 'border border-[#dbe1ea]'}`}>{index + 1}</button>
              ))}
              <button disabled={page >= pages || total === 0} onClick={() => setPage(page + 1)} className="rounded border border-[#dbe1ea] px-3 py-2 disabled:opacity-40">Sau</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <form onSubmit={handleSubmit} className="max-h-[90vh] w-full max-w-[640px] overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{isEditing ? 'Sửa khách hàng' : 'Thêm khách hàng'}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            {error && <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium">Họ tên<input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="mt-2 h-11 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
              <label className="text-sm font-medium">Email<input type="email" disabled={isEditing} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-2 h-11 w-full rounded-lg border border-[#d9e0ea] px-3 disabled:bg-[#f8fafc]" /></label>
              {!isEditing && <label className="text-sm font-medium">Mật khẩu<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-2 h-11 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>}
              <label className="text-sm font-medium">Số điện thoại<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-2 h-11 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
              <label className="text-sm font-medium">CCCD<input value={form.id_number} onChange={(e) => setForm({ ...form, id_number: e.target.value })} className="mt-2 h-11 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
              <label className="text-sm font-medium">Quốc tịch<input value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} className="mt-2 h-11 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
              <label className="text-sm font-medium">Giới tính<select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="mt-2 h-11 w-full rounded-lg border border-[#d9e0ea] px-3"><option value="">-</option><option value="male">Nam</option><option value="female">Nữ</option><option value="other">Khác</option></select></label>
              <label className="text-sm font-medium md:col-span-2">Địa chỉ<textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-2 h-24 w-full rounded-lg border border-[#d9e0ea] px-3 py-2" /></label>
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
