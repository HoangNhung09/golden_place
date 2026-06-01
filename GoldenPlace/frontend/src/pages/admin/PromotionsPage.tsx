import { useEffect, useState } from 'react'
import { Calendar, Edit2, Gift, Percent, Plus, Search, Trash2 } from 'lucide-react'
import { useAdmin } from '../../hooks/useAdmin'
import { formatDateVI, formatVND } from '../../lib/utils'
import LoadingSpinner from '../../components/common/LoadingSpinner'

type PromoForm = {
  id?: string
  code: string
  name: string
  description: string
  discount_type: 'PERCENT' | 'AMOUNT'
  discount_value: string
  max_uses: string
  start_date: string
  end_date: string
}

const emptyForm: PromoForm = {
  code: '',
  name: '',
  description: '',
  discount_type: 'PERCENT',
  discount_value: '',
  max_uses: '',
  start_date: '',
  end_date: '',
}

const toDateInput = (value?: string) => (value ? value.slice(0, 10) : '')

const toForm = (promo: any): PromoForm => ({
  id: promo.id,
  code: promo.code || '',
  name: promo.name || '',
  description: promo.description || '',
  discount_type: promo.discount_type || 'PERCENT',
  discount_value: String(promo.discount_value || ''),
  max_uses: promo.max_uses ? String(promo.max_uses) : '',
  start_date: toDateInput(promo.start_date),
  end_date: toDateInput(promo.end_date),
})

export default function PromotionsPage() {
  const { useGetPromotions, createPromotion, updatePromotion, deletePromotion, togglePromotionActive } = useAdmin()
  const { data: promotions = [], isLoading } = useGetPromotions()
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<PromoForm>(emptyForm)
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list')
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Khuyến mãi | Admin Golden Place'
  }, [])

  const rows = promotions.filter((promo: any) => `${promo.code || ''} ${promo.name || ''}`.toLowerCase().includes(search.toLowerCase()))
  const selectedPromo = promotions.find((promo: any) => promo.id === form.id)
  const usedCount = Number(selectedPromo?.used_count || 0)
  const maxUses = Number(form.max_uses || (selectedPromo as any)?.max_uses || 0)
  const usagePercent = maxUses ? Math.min(100, (usedCount / maxUses) * 100) : 0

  const openCreate = () => {
    setForm(emptyForm)
    setError('')
    setMode('create')
  }

  const openEdit = (promo: any) => {
    setForm(toForm(promo))
    setError('')
    setMode('edit')
  }

  const closeEditor = () => {
    setMode('list')
    setError('')
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (!form.name.trim() || !form.discount_value || !form.start_date || !form.end_date) {
      setError('Vui lòng nhập đầy đủ tên, mức giảm và thời gian áp dụng.')
      return
    }

    const payload: any = {
      code: form.code.trim() || undefined,
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      type: 'COUPON',
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order_amount: 0,
      max_uses: form.max_uses ? Number(form.max_uses) : undefined,
      start_date: new Date(`${form.start_date}T00:00:00`).toISOString(),
      end_date: new Date(`${form.end_date}T23:59:59`).toISOString(),
      applicable_to: 'ALL',
    }

    try {
      if (form.id) await updatePromotion({ id: form.id, ...payload })
      else await createPromotion(payload)
      closeEditor()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Không thể lưu khuyến mãi.')
    }
  }

  const handleDelete = async (promo: any) => {
    if (!window.confirm(`Xóa khuyến mãi "${promo.name}"?`)) return
    try {
      await deletePromotion(promo.id)
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Không thể xóa khuyến mãi.')
    }
  }

  if (mode !== 'list') {
    const isEdit = mode === 'edit'

    return (
      <div className="max-w-[760px]">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-medium uppercase tracking-[-0.01em]">{isEdit ? 'Sửa khuyến mãi' : 'Thêm khuyến mãi'}</h1>
          <button onClick={closeEditor} className="h-10 rounded-xl bg-[#8ccbf2] px-5 text-white shadow-sm hover:bg-[#74bce8]">Quay lại</button>
        </div>

        {error && <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-12 space-y-8">
          <section>
            <label className="block text-[17px] font-medium">Tên khuyến mãi</label>
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-3 h-11 w-[360px] rounded-xl border-0 bg-[#eeeeee] px-6 outline-none focus:ring-2 focus:ring-[#f8d866]" />
          </section>

          <section>
            <label className="block text-[17px] font-medium">Mô tả</label>
            <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-4 h-[74px] w-full resize-none rounded-xl border-0 bg-[#eeeeee] px-6 py-4 outline-none focus:ring-2 focus:ring-[#f8d866]" />
          </section>

          <section>
            <h2 className="text-[17px] font-medium">Mức khuyến mãi</h2>
            <div className={`mt-5 grid gap-8 rounded-xl bg-[#f4f4f4] px-12 py-4 ${isEdit ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <label className="block">
                <span className="text-[16px]">Loại giảm giá</span>
                <select value={form.discount_type} onChange={(event) => setForm({ ...form, discount_type: event.target.value as PromoForm['discount_type'] })} className="mt-3 h-11 w-full rounded-xl border-0 bg-[#d9d9d9] px-4 outline-none focus:ring-2 focus:ring-[#f8d866]">
                  <option value="PERCENT">Giảm theo phần trăm</option>
                  <option value="AMOUNT">Giảm theo số tiền</option>
                </select>
              </label>
              <label className="block">
                <span className="text-[16px]">Giá trị</span>
                <input type="number" min="1" value={form.discount_value} onChange={(event) => setForm({ ...form, discount_value: event.target.value })} className="mt-3 h-11 w-full rounded-xl border-0 bg-[#d9d9d9] px-5 outline-none focus:ring-2 focus:ring-[#f8d866]" />
              </label>
              {isEdit && (
                <label className="block">
                  <span className="text-[16px]">Số lượng</span>
                  <input type="number" min="1" value={form.max_uses} onChange={(event) => setForm({ ...form, max_uses: event.target.value })} className="mt-3 h-11 w-full rounded-xl border-0 bg-[#d9d9d9] px-5 outline-none focus:ring-2 focus:ring-[#f8d866]" />
                </label>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-[17px] font-medium">{isEdit ? 'Thời gian & Sử dụng' : 'Thời gian & Số lượng'}</h2>
            <div className="mt-5 rounded-xl bg-[#f4f4f4] px-12 py-4">
              <div className="grid gap-12 md:grid-cols-2">
                <label className="block">
                  <span className="text-[16px]">Ngày bắt đầu</span>
                  <input type="date" value={form.start_date} onChange={(event) => setForm({ ...form, start_date: event.target.value })} className="mt-3 h-11 w-full rounded-xl border-0 bg-[#d9d9d9] px-4 outline-none focus:ring-2 focus:ring-[#f8d866]" />
                </label>
                <label className="block">
                  <span className="text-[16px]">Ngày kết thúc</span>
                  <input type="date" value={form.end_date} onChange={(event) => setForm({ ...form, end_date: event.target.value })} className="mt-3 h-11 w-full rounded-xl border-0 bg-[#d9d9d9] px-4 outline-none focus:ring-2 focus:ring-[#f8d866]" />
                </label>
              </div>

              {!isEdit && (
                <label className="mt-5 block max-w-[250px]">
                  <span className="text-[16px]">Số lượng mã giảm giá</span>
                  <input type="number" min="1" value={form.max_uses} onChange={(event) => setForm({ ...form, max_uses: event.target.value })} className="mt-3 h-11 w-full rounded-xl border-0 bg-[#d9d9d9] px-5 outline-none focus:ring-2 focus:ring-[#f8d866]" />
                </label>
              )}

              {isEdit && (
                <div className="mt-6">
                  <p className="text-[16px]">Thống kê sử dụng</p>
                  <div className="mt-4 flex items-center gap-8">
                    <div className="h-3 flex-1 rounded-full bg-[#d9d9d9]">
                      <div className="h-3 rounded-full bg-[#f8d866]" style={{ width: `${usagePercent}%` }} />
                    </div>
                    <span className="min-w-[70px] text-right text-[16px]">{usedCount}/{maxUses || '∞'}</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="flex justify-end">
            <button className="h-11 rounded-xl bg-[#f8d866] px-8 font-semibold hover:bg-[#f5cf43]">{isEdit ? 'Lưu thay đổi' : 'Tạo khuyến mãi'}</button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[26px] font-bold">Khuyến mãi</h1>
        <button onClick={openCreate} className="flex h-10 items-center gap-2 rounded-lg bg-[#f8d866] px-5 text-sm font-semibold hover:bg-[#f5cf43]">
          <Plus className="h-5 w-5" />
          Tạo khuyến mãi mới
        </button>
      </div>
      <h2 className="mt-8 text-[22px] font-bold">Quản lý khuyến mãi</h2>

      <div className="mt-8 rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-sm">
        <label className="relative block">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#94a3b8]" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm kiếm theo mã hoặc tên khuyến mãi..." className="h-12 w-full rounded-lg border border-[#d9e0ea] pl-12 pr-4 outline-none focus:border-[#f8d866]" />
        </label>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {rows.length === 0 ? (
            <div className="rounded-lg border border-[#e5e7eb] bg-white p-6 text-[#64748b] shadow-sm lg:col-span-3">Chưa có khuyến mãi.</div>
          ) : rows.map((promo: any) => {
            const used = Number(promo.used_count || 0)
            const limit = Number(promo.max_uses || 0)
            const isAmount = promo.discount_type === 'AMOUNT'
            const percent = limit ? Math.min(100, (used / limit) * 100) : 0
            return (
              <article
                key={promo.id}
                onClick={() => openEdit(promo)}
                className="cursor-pointer rounded-lg border border-[#e5e7eb] bg-white p-6 shadow-sm transition hover:border-[#f8d866] hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff9e8] text-[#d5a332]"><Gift className="h-6 w-6" /></div>
                  <div>
                    <h3 className="text-lg font-bold">{promo.code || '-'}</h3>
                    <button
                      onClick={(event) => {
                        event.stopPropagation()
                        togglePromotionActive(promo.id)
                      }}
                      className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${promo.is_active ? 'bg-[#dffbea] text-[#16a34a]' : 'bg-[#dbeafe] text-[#2563eb]'}`}
                    >
                      {promo.is_active ? 'Đang áp dụng' : 'Sắp diễn ra'}
                    </button>
                  </div>
                </div>
                <p className="mt-5 text-[17px] text-[#334155]">{promo.name}</p>
                <p className="mt-4 flex items-center gap-2 text-[#475569]">
                  <Percent className="h-4 w-4" />
                  Giảm giá: {isAmount ? formatVND(Number(promo.discount_value || 0)) : `${promo.discount_value}%`}
                </p>
                <p className="mt-3 flex items-center gap-2 text-[#475569]"><Calendar className="h-4 w-4" />{formatDateVI(promo.start_date)} - {formatDateVI(promo.end_date)}</p>
                <div className="mt-5">
                  <div className="flex justify-between text-sm"><span>Đã sử dụng</span><strong>{used}/{limit || '∞'}</strong></div>
                  <div className="mt-2 h-2 rounded-full bg-[#e5e7eb]"><div className="h-2 rounded-full bg-[#f8d866]" style={{ width: `${percent}%` }} /></div>
                </div>
                <div className="mt-5 flex gap-2">
                  <button
                    onClick={(event) => {
                      event.stopPropagation()
                      openEdit(promo)
                    }}
                    className="flex h-9 flex-1 items-center justify-center gap-1 rounded-lg border border-[#dbe1ea]"
                  >
                    <Edit2 className="h-4 w-4" />
                    Sửa
                  </button>
                  <button
                    onClick={(event) => {
                      event.stopPropagation()
                      handleDelete(promo)
                    }}
                    className="flex h-9 flex-1 items-center justify-center gap-1 rounded-lg bg-[#ff2d3d] font-semibold text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                    Xóa
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
