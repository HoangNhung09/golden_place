import { useState, useEffect } from 'react'
import { useAdmin } from '../../hooks/useAdmin'
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function RoomTypesPage() {
  const { useGetRoomTypes, createRoomType, updateRoomType, deleteRoomType } = useAdmin()
  const { data: roomTypes, isLoading, refetch } = useGetRoomTypes()

  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedTypeId, setSelectedTypeId] = useState('')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [amenitiesInput, setAmenitiesInput] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    document.title = 'Quản Lý Loại Phòng | Admin GoldenPlace'
  }, [])

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setSelectedTypeId('')
    setName('')
    setDescription('')
    setAmenitiesInput('')
    setFormError('')
    setShowModal(true)
  }

  const handleOpenEditModal = (type: any) => {
    setModalMode('edit')
    setSelectedTypeId(type.id)
    setName(type.name)
    setDescription(type.description || '')
    setAmenitiesInput(type.amenities ? type.amenities.join(', ') : '')
    setFormError('')
    setShowModal(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    const amenitiesList = amenitiesInput
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0)

    const payload = {
      name,
      description,
      amenities: amenitiesList
    }

    try {
      if (modalMode === 'create') {
        await createRoomType(payload)
      } else {
        await updateRoomType({ id: selectedTypeId, ...payload })
      }
      setShowModal(false)
      refetch()
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Thao tác lưu loại phòng thất bại.')
    }
  }

  const handleDeleteType = async (typeId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa loại phòng này? Thao tác này có thể ảnh hưởng đến các phòng hiện tại.')) return

    try {
      await deleteRoomType(typeId)
      refetch()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Không thể xóa loại phòng do đang có phòng nghỉ trực thuộc liên kết.')
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif font-bold text-white uppercase tracking-wider">Quản lý loại phòng</h2>
          <p className="text-xs text-[#a0a8c0] mt-1">Cấu hình danh mục loại phòng nghỉ (Suite, Deluxe...) và tiện ích nội khu đi kèm.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center space-x-1.5 bg-[#c9a84c] hover:bg-[#e8c96d] text-[#1a1f36] font-bold py-2.5 px-4 rounded text-xs uppercase transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm loại phòng</span>
        </button>
      </div>

      {/* Grid of types */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roomTypes && roomTypes.length > 0 ? (
            roomTypes.map((type: any) => (
              <div 
                key={type.id}
                className="glass-panel p-6 rounded-xl border border-[#c9a84c]/10 flex flex-col justify-between space-y-4 hover:border-[#c9a84c]/30 shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-serif font-bold text-lg text-white">{type.name}</h3>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleOpenEditModal(type)}
                        className="p-1.5 text-blue-400 hover:bg-[#1a1f36] rounded"
                        title="Sửa loại phòng"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteType(type.id)}
                        className="p-1.5 text-red-400 hover:bg-[#1a1f36] rounded"
                        title="Xóa loại phòng"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#a0a8c0] leading-relaxed">{type.description || 'Chưa có mô tả.'}</p>
                </div>

                {/* Amenities checklist display */}
                {type.amenities && type.amenities.length > 0 && (
                  <div className="pt-4 border-t border-[#c9a84c]/10 space-y-2">
                    <p className="text-[10px] text-[#a0a8c0] uppercase tracking-wider font-semibold">Tiện nghi đặc trưng:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {type.amenities.map((a: string, idx: number) => (
                        <span key={idx} className="text-[10px] bg-[#c9a84c]/10 text-[#e8c96d] border border-[#c9a84c]/20 px-2 py-0.5 rounded flex items-center space-x-1">
                          <Check className="h-3 w-3" />
                          <span>{a}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-[#a0a8c0] italic col-span-2 text-center py-10">Chưa có loại phòng nào.</p>
          )}
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
                {modalMode === 'create' ? 'Thêm loại phòng mới' : `Sửa loại phòng ${name}`}
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
                <label className="block text-[#a0a8c0] uppercase font-semibold mb-1">Tên loại phòng</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1f36] border border-[#c9a84c]/20 rounded text-sm"
                  placeholder="Ví dụ: Standard, Deluxe, Suite, Family"
                />
              </div>

              <div>
                <label className="block text-[#a0a8c0] uppercase font-semibold mb-1">Tiện nghi (phân cách bằng dấu phẩy)</label>
                <input
                  type="text"
                  value={amenitiesInput}
                  onChange={(e) => setAmenitiesInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1f36] border border-[#c9a84c]/20 rounded text-sm"
                  placeholder="Ví dụ: WiFi, Điều hòa, Smart TV, Bồn tắm, Mini Bar"
                />
              </div>

              <div>
                <label className="block text-[#a0a8c0] uppercase font-semibold mb-1">Mô tả chi tiết</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#1a1f36] border border-[#c9a84c]/20 rounded text-sm"
                  placeholder="Nhập mô tả loại phòng ngủ..."
                />
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
                  Lưu loại phòng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
