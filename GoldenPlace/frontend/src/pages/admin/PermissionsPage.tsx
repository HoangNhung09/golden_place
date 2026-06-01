import { useState } from 'react'
import { Edit2, Plus, Shield, Trash2, X } from 'lucide-react'
import { useAdmin } from '../../hooks/useAdmin'
import LoadingSpinner from '../../components/common/LoadingSpinner'

type SystemRole = 'admin' | 'staff'

type AdminForm = {
  id?: string
  full_name: string
  email: string
  phone: string
  password: string
  role: SystemRole
  is_active: boolean
}

const emptyForm: AdminForm = {
  full_name: '',
  email: '',
  phone: '',
  password: '',
  role: 'staff',
  is_active: true,
}

export default function PermissionsPage() {
  const { useGetAdmins, createAdminUser, updateAdminUser, deleteAdminUser } = useAdmin()
  const { data: users = [], isLoading } = useGetAdmins()
  const [form, setForm] = useState<AdminForm>(emptyForm)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState('')
  const isEditing = Boolean(form.id)

  const openCreate = () => {
    setForm(emptyForm)
    setError('')
    setIsModalOpen(true)
  }

  const openEdit = (user: any) => {
    setForm({
      id: user.id,
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      role: user.role === 'admin' ? 'admin' : 'staff',
      is_active: Boolean(user.is_active),
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
      setError('Mật khẩu tài khoản mới cần ít nhất 8 ký tự.')
      return
    }

    try {
      if (form.id) {
        await updateAdminUser({
          id: form.id,
          full_name: form.full_name,
          phone: form.phone || undefined,
          role: form.role,
          is_active: form.is_active,
          ...(form.password ? { password: form.password } : {}),
        })
      } else {
        await createAdminUser({
          full_name: form.full_name,
          email: form.email,
          phone: form.phone || undefined,
          password: form.password,
          role: form.role,
          is_active: form.is_active,
        })
      }
      setIsModalOpen(false)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Không thể lưu tài khoản nội bộ.')
    }
  }

  const handleDelete = async (user: any) => {
    if (!window.confirm(`Khóa tài khoản "${user.full_name}"?`)) return
    try {
      await deleteAdminUser(user.id)
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Không thể khóa tài khoản.')
    }
  }

  const adminCount = users.filter((user: any) => user.role === 'admin').length
  const staffCount = users.filter((user: any) => user.role === 'staff').length

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold">Quản lý phân quyền</h1>
          <p className="mt-3 text-[#475569]">Quản lý tài khoản nội bộ và vai trò truy cập hệ thống.</p>
        </div>
        <button onClick={openCreate} className="flex h-10 items-center gap-2 rounded-lg bg-[#f8d866] px-5 font-semibold">
          <Plus className="h-5 w-5" />
          Thêm tài khoản
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <p className="text-[#64748b]">Tổng tài khoản nội bộ</p>
          <p className="mt-2 text-[28px] font-bold">{users.length}</p>
        </div>
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <p className="text-[#64748b]">Admin</p>
          <p className="mt-2 text-[28px] font-bold">{adminCount}</p>
        </div>
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <p className="text-[#64748b]">Staff</p>
          <p className="mt-2 text-[28px] font-bold">{staffCount}</p>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="mt-7 overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-[15px] text-[#475569]">
              <thead className="bg-[#fafafa] text-xs font-bold uppercase">
                <tr>
                  <th className="px-6 py-4">Tài khoản</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Điện thoại</th>
                  <th className="px-6 py-4">Vai trò</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-[#64748b]">Chưa có tài khoản nội bộ.</td></tr>
                ) : users.map((user: any) => (
                  <tr key={user.id} className="border-t border-[#edf0f4]">
                    <td className="px-6 py-5 font-semibold text-[#111827]">
                      <Shield className="mr-2 inline h-4 w-4 text-[#d5a332]" />
                      {user.full_name}
                    </td>
                    <td className="px-6 py-5">{user.email}</td>
                    <td className="px-6 py-5">{user.phone || '-'}</td>
                    <td className="px-6 py-5">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${user.role === 'admin' ? 'bg-[#fff7d6] text-[#b58100]' : 'bg-[#dbeafe] text-[#2563eb]'}`}>
                        {user.role === 'admin' ? 'Admin' : 'Staff'}
                      </span>
                    </td>
                    <td className="px-6 py-5">{user.is_active ? 'Hoạt động' : 'Đã khóa'}</td>
                    <td className="px-6 py-5">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(user)} className="flex h-9 items-center gap-1 rounded-lg border border-[#dbe1ea] px-3">
                          <Edit2 className="h-4 w-4" />
                          Sửa
                        </button>
                        <button onClick={() => handleDelete(user)} className="flex h-9 items-center gap-1 rounded-lg bg-[#ff2d3d] px-3 font-semibold text-white">
                          <Trash2 className="h-4 w-4" />
                          Khóa
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
          <form onSubmit={handleSubmit} className="w-full max-w-[560px] rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{isEditing ? 'Sửa tài khoản' : 'Thêm tài khoản'}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            {error && <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <div className="mt-5 grid gap-4">
              <label className="text-sm font-medium">Họ tên<input value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} className="mt-2 h-11 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
              <label className="text-sm font-medium">Email<input type="email" disabled={isEditing} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-2 h-11 w-full rounded-lg border border-[#d9e0ea] px-3 disabled:bg-[#f8fafc]" /></label>
              <label className="text-sm font-medium">Số điện thoại<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="mt-2 h-11 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
              <label className="text-sm font-medium">Vai trò<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as SystemRole })} className="mt-2 h-11 w-full rounded-lg border border-[#d9e0ea] px-3"><option value="staff">Staff</option><option value="admin">Admin</option></select></label>
              <label className="text-sm font-medium">Trạng thái<select value={form.is_active ? 'true' : 'false'} onChange={(event) => setForm({ ...form, is_active: event.target.value === 'true' })} className="mt-2 h-11 w-full rounded-lg border border-[#d9e0ea] px-3"><option value="true">Hoạt động</option><option value="false">Đã khóa</option></select></label>
              <label className="text-sm font-medium">Mật khẩu {isEditing && '(để trống nếu không đổi)'}<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-2 h-11 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
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
