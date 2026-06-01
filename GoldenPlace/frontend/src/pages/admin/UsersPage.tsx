import { useState, useEffect } from 'react'
import { useAdmin } from '../../hooks/useAdmin'
import { Plus, Edit2, Trash2, X, Shield, ShieldCheck, UserCheck } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function UsersPage() {
  const { useGetSystemUsers, createSystemUser, updateSystemUser, deleteSystemUser } = useAdmin()
  const { data: users, isLoading, refetch } = useGetSystemUsers()

  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedUserId, setSelectedUserId] = useState('')

  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('STAFF')
  const [isActive, setIsActive] = useState(true)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    document.title = 'Quản Lý Nhân Sự | Admin GoldenPlace'
  }, [])

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setSelectedUserId('')
    setEmail('')
    setFullName('')
    setPhone('')
    setPassword('')
    setRole('STAFF')
    setIsActive(true)
    setFormError('')
    setShowModal(true)
  }

  const handleOpenEditModal = (user: any) => {
    setModalMode('edit')
    setSelectedUserId(user.id)
    setEmail(user.email)
    setFullName(user.full_name)
    setPhone(user.phone || '')
    setPassword('') // Let blank for no password update
    setRole(user.role)
    setIsActive(user.is_active)
    setFormError('')
    setShowModal(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    const payload: any = {
      email,
      full_name: fullName,
      phone: phone || undefined,
      role,
      is_active: isActive
    }

    if (modalMode === 'create') {
      if (!password) {
        setFormError('Mật khẩu bắt buộc đối với tài khoản nhân sự mới.')
        return
      }
      payload.password = password
    } else if (password) {
      payload.password = password
    }

    try {
      if (modalMode === 'create') {
        await createSystemUser(payload)
      } else {
        await updateSystemUser({ id: selectedUserId, ...payload })
      }
      setShowModal(false)
      refetch()
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Thao tác lưu thông tin nhân sự thất bại.')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản nhân sự này? Thao tác này không thể thu hồi.')) return

    try {
      await deleteSystemUser(userId)
      refetch()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Không thể xóa tài khoản này.')
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif font-bold text-white uppercase tracking-wider">Quản lý nhân viên & Quản trị</h2>
          <p className="text-xs text-[#a0a8c0] mt-1">Phân quyền nhân sự nội bộ (Admin, Nhân viên lễ tân) và kiểm soát tài khoản truy cập hệ thống.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center space-x-1.5 bg-[#c9a84c] hover:bg-[#e8c96d] text-[#1a1f36] font-bold py-2.5 px-4 rounded text-xs uppercase transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm nhân sự mới</span>
        </button>
      </div>

      {/* Table List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="glass-panel rounded-xl overflow-hidden border border-[#c9a84c]/10">
          <table className="w-full text-left border-collapse text-xs text-[#a0a8c0]">
            <thead className="bg-[#1e2238] text-[#f5f0e8] border-b border-[#c9a84c]/10 uppercase font-serif font-semibold">
              <tr>
                <th className="p-4">Nhân viên</th>
                <th className="p-4">Email</th>
                <th className="p-4">Điện thoại</th>
                <th className="p-4">Vai trò phân quyền</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c9a84c]/10">
              {users && users.length > 0 ? (
                users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-[#1e2238]/30">
                    <td className="p-4 font-bold text-white flex items-center space-x-2">
                      <div className="h-7 w-7 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs uppercase">
                        {u.full_name?.charAt(0)}
                      </div>
                      <span>{u.full_name}</span>
                    </td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4">{u.phone || 'Chưa cập nhật'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                        u.role === 'ADMIN'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                        u.is_active
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {u.is_active ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="p-4 flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(u)}
                        className="p-1.5 text-blue-400 hover:bg-[#1a1f36] rounded"
                        title="Sửa nhân viên"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 text-red-400 hover:bg-[#1a1f36] rounded"
                        title="Xóa nhân sự"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-10 text-center italic">Không tìm thấy tài khoản nhân sự nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal create / update */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#242840] border border-[#c9a84c]/20 max-w-md w-full mx-4 rounded-xl p-6 shadow-2xl z-10 text-[#f5f0e8] max-h-[85vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-[#c9a84c]/10 pb-4 mb-4">
              <h3 className="font-serif font-bold text-lg text-white">
                {modalMode === 'create' ? 'Thêm nhân sự mới' : `Sửa tài khoản ${fullName}`}
              </h3>
              <button onClick={() => setShowModal(false)}>
                <X className="h-5 w-5 text-[#a0a8c0] hover:text-white" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded">
                {formError}
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#a0a8c0] uppercase font-semibold mb-1">Họ và tên</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1f36] border border-[#c9a84c]/20 rounded text-sm"
                  placeholder="Ví dụ: Nguyễn Văn A"
                />
              </div>

              <div>
                <label className="block text-[#a0a8c0] uppercase font-semibold mb-1">Email truy cập</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1f36] border border-[#c9a84c]/20 rounded text-sm"
                  placeholder="name@goldenplace.com"
                  disabled={modalMode === 'edit'}
                />
              </div>

              <div>
                <label className="block text-[#a0a8c0] uppercase font-semibold mb-1">Điện thoại liên hệ</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1f36] border border-[#c9a84c]/20 rounded text-sm"
                  placeholder="Ví dụ: 0987654321"
                />
              </div>

              <div>
                <label className="block text-[#a0a8c0] uppercase font-semibold mb-1">
                  Mật khẩu {modalMode === 'edit' && '(Để trống nếu không thay đổi)'}
                </label>
                <input
                  type="password"
                  required={modalMode === 'create'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1f36] border border-[#c9a84c]/20 rounded text-sm"
                  placeholder="Nhập mật khẩu an toàn..."
                />
              </div>

              <div>
                <label className="block text-[#a0a8c0] uppercase font-semibold mb-1">Phân quyền vai trò</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1f36] border border-[#c9a84c]/20 rounded text-sm text-[#f5f0e8]"
                >
                  <option value="STAFF">STAFF (Nhân viên lễ tân)</option>
                  <option value="ADMIN">ADMIN (Quản trị viên tối cao)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#a0a8c0] uppercase font-semibold mb-1">Trạng thái tài khoản</label>
                <select
                  value={isActive ? 'true' : 'false'}
                  onChange={(e) => setIsActive(e.target.value === 'true')}
                  className="w-full px-3 py-2 bg-[#1a1f36] border border-[#c9a84c]/20 rounded text-sm text-[#f5f0e8]"
                >
                  <option value="true">Đang kích hoạt hoạt động</option>
                  <option value="false">Tạm khóa tài khoản</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 text-xs font-bold uppercase pt-2 border-t border-[#c9a84c]/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[#c9a84c]/20 text-[#a0a8c0] rounded hover:border-[#c9a84c]/40"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#c9a84c] text-[#1a1f36] rounded hover:bg-[#e8c96d]"
                >
                  Lưu tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
