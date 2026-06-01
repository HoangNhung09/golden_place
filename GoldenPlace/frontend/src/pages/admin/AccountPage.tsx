import { Camera, Mail, MapPin, Phone, Save, User } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function AccountPage() {
  const { user } = useAuth()
  const address = (user as any)?.address || ''

  return (
    <div>
      <h1 className="text-[26px] font-bold">Tài khoản</h1>
      <h2 className="mt-8 text-[22px] font-bold">Tài khoản</h2>
      <div className="mt-8 flex gap-8 border-b border-[#e5e7eb] text-[17px]">
        <button className="border-b-2 border-[#f8d000] px-3 pb-4 text-[#f0c400]">Thông tin cá nhân</button>
        <button className="px-3 pb-4 text-[#475569]">Bảo mật</button>
      </div>
      <section className="mt-6 rounded-lg border border-[#e5e7eb] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-5 border-b border-[#edf0f4] pb-6">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#ffc400] text-white">
            <User className="h-12 w-12" />
            <span className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#f8d000] text-black">
              <Camera className="h-4 w-4" />
            </span>
          </div>
          <div>
            <h3 className="text-xl font-bold">{user?.full_name || '-'}</h3>
            <p className="mt-1 text-[#475569] uppercase">{user?.role || '-'}</p>
            <p className="mt-1 text-[#64748b]">{user?.email || '-'}</p>
          </div>
        </div>
        <div className="mt-6 max-w-[850px] space-y-5">
          <label className="block font-medium">
            Họ và tên
            <div className="relative mt-2">
              <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#94a3b8]" />
              <input className="h-12 w-full rounded-lg border border-[#d9e0ea] pl-12" defaultValue={user?.full_name || ''} />
            </div>
          </label>
          <label className="block font-medium">
            Email
            <div className="relative mt-2">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#94a3b8]" />
              <input className="h-12 w-full rounded-lg border border-[#d9e0ea] pl-12" defaultValue={user?.email || ''} />
            </div>
          </label>
          <label className="block font-medium">
            Số điện thoại
            <div className="relative mt-2">
              <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#94a3b8]" />
              <input className="h-12 w-full rounded-lg border border-[#d9e0ea] pl-12" defaultValue={user?.phone || ''} />
            </div>
          </label>
          <label className="block font-medium">
            Địa chỉ
            <div className="relative mt-2">
              <MapPin className="absolute left-4 top-4 h-5 w-5 text-[#94a3b8]" />
              <textarea className="h-24 w-full rounded-lg border border-[#d9e0ea] pl-12 pt-3" defaultValue={address} />
            </div>
          </label>
        </div>
        <div className="mt-8 flex justify-end">
          <button className="flex h-12 items-center gap-2 rounded-lg bg-[#ffd000] px-7 font-semibold">
            <Save className="h-5 w-5" />
            Lưu thay đổi
          </button>
        </div>
      </section>
    </div>
  )
}
