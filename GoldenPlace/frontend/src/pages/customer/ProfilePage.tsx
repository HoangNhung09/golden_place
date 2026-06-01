import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Bell,
  Calendar,
  Camera,
  Check,
  Edit3,
  Gift,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Phone,
  User,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import apiClient from '../../lib/axios'
import { formatDateVI, formatVND } from '../../lib/utils'
import type { UserResponse } from '../../types'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  phone: z.string().regex(/^[0-9\s]{10,13}$/, 'Số điện thoại không hợp lệ'),
  avatar_url: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  nationality: z.string().optional(),
  id_number: z.string().optional(),
})

const passwordSchema = z.object({
  old_password: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  new_password: z.string().min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự'),
  confirm_new_password: z.string(),
}).refine((data) => data.new_password === data.confirm_new_password, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirm_new_password'],
})

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, isAuthenticated, updateProfile, isUpdatingProfile, changePassword, isChangingPassword, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPass, setIsChangingPass] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    document.title = 'Thông tin tài khoản | Golden Place'
    window.scrollTo(0, 0)
  }, [])

  const { data: profile, isLoading: isLoadingProfile, refetch: refetchProfile } = useQuery({
    queryKey: ['auth-profile'],
    queryFn: async () => {
      const { data } = await apiClient.get<UserResponse>('/auth/profile')
      return data
    },
    enabled: isAuthenticated,
  })

  const currentUser = profile || user
  const displayName = currentUser?.full_name || 'Chưa cập nhật'
  const email = currentUser?.email || 'Chưa cập nhật'
  const phone = currentUser?.phone || 'Chưa cập nhật'
  const avatarUrl = currentUser?.avatar_url
  const memberSince = currentUser?.created_at ? formatDateVI(currentUser.created_at) : 'Chưa cập nhật'
  const updatedAt = currentUser?.updated_at ? formatDateVI(currentUser.updated_at) : 'Chưa cập nhật'
  const birthDate = currentUser?.date_of_birth ? formatDateVI(currentUser.date_of_birth) : 'Chưa cập nhật'
  const roleLabel = currentUser?.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'
  const verifiedLabel = currentUser?.is_email_verified ? 'Đã xác thực' : 'Chưa xác thực'
  const tier = currentUser?.membership_tier || 'Gold'
  const rewardPoints = currentUser?.reward_points || 0
  const totalPoints = currentUser?.total_points || rewardPoints
  const usedPoints = currentUser?.used_points || 0
  const bookingCount = currentUser?.booking_count || 0
  const totalSpent = currentUser?.total_spent || 0
  const optionalValue = (value?: string | null) => (value && value.trim() ? value : 'Chưa cập nhật')

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: {
      full_name: currentUser?.full_name || '',
      phone: currentUser?.phone || '',
      avatar_url: currentUser?.avatar_url || '',
      date_of_birth: currentUser?.date_of_birth || '',
      gender: currentUser?.gender || '',
      address: currentUser?.address || '',
      nationality: currentUser?.nationality || '',
      id_number: currentUser?.id_number || '',
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  const onProfileSubmit = async (data: ProfileForm) => {
    setProfileMessage('')
    setErrorMessage('')

    try {
      await updateProfile({
        ...data,
        phone: data.phone.replace(/\s/g, ''),
        date_of_birth: data.date_of_birth || undefined,
      })
      await refetchProfile()
      setProfileMessage('Cập nhật thông tin thành công.')
      setIsEditing(false)
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Không thể cập nhật thông tin.')
    }
  }

  const onPasswordSubmit = async (data: PasswordForm) => {
    setPasswordMessage('')
    setErrorMessage('')

    try {
      await changePassword({
        old_password: data.old_password,
        new_password: data.new_password,
      })
      setPasswordMessage('Đổi mật khẩu thành công.')
      setIsChangingPass(false)
      resetPassword()
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Không thể đổi mật khẩu.')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (isLoadingProfile && !currentUser) {
    return (
      <div className="min-h-screen bg-[#f7f7f8] px-4 py-24 text-center text-sm text-gray-500">
        Đang tải thông tin tài khoản...
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="min-h-screen bg-[#f7f7f8]">
        <main className="mx-auto max-w-[1000px] px-4 pb-24 pt-8">
          <div className="mb-8 flex items-start gap-4">
            <button
              onClick={() => setIsEditing(false)}
              className="mt-3 flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-900"
              aria-label="Quay lại"
            >
              ←
            </button>
            <div>
              <h1 className="text-[32px] font-bold leading-10 text-gray-950">Chỉnh sửa thông tin</h1>
              <p className="mt-2 text-[16px] text-gray-600">Cập nhật thông tin cá nhân của bạn</p>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-5 max-w-[768px] rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="max-w-[768px] space-y-6">
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-7 text-[18px] font-semibold text-gray-950">Thông tin cơ bản</h2>
              <div className="grid gap-5 md:grid-cols-2">
                <ProfileInput label="Họ và tên *" register={registerProfile('full_name')} error={profileErrors.full_name?.message} />
                <ProfileInput label="Ngày sinh" type="date" register={registerProfile('date_of_birth')} />
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-900">Giới tính</span>
                  <select {...registerProfile('gender')} className="h-11 w-full rounded-lg border border-gray-200 bg-[#f3f3f5] px-4 text-sm outline-none focus:border-[#f5b400] focus:bg-white">
                    <option value="">Chọn giới tính</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Nam">Nam</option>
                    <option value="Khác">Khác</option>
                  </select>
                </label>
                <ProfileInput label="Quốc tịch" register={registerProfile('nationality')} />
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-7 text-[18px] font-semibold text-gray-950">Thông tin liên hệ</h2>
              <div className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-900">Email *</span>
                  <input value={email} readOnly className="h-11 w-full rounded-lg border border-transparent bg-[#f3f3f5] px-4 text-sm text-gray-700 outline-none" />
                  <span className="mt-2 block text-sm text-gray-500">Email đã được xác thực</span>
                </label>
                <ProfileInput label="Số điện thoại *" register={registerProfile('phone')} error={profileErrors.phone?.message} />
                <ProfileInput label="CCCD/Hộ chiếu" register={registerProfile('id_number')} />
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-900">Địa chỉ</span>
                  <input {...registerProfile('address')} className="h-11 w-full rounded-lg border border-transparent bg-[#f3f3f5] px-4 text-sm outline-none focus:border-[#f5b400] focus:bg-white" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-900">Ảnh đại diện URL</span>
                  <input {...registerProfile('avatar_url')} className="h-11 w-full rounded-lg border border-transparent bg-[#f3f3f5] px-4 text-sm outline-none focus:border-[#f5b400] focus:bg-white" />
                </label>
              </div>
            </section>

            <div className="rounded-lg border border-[#f6d766] bg-[#fffbe8] px-4 py-4 text-[14px] text-[#9a6500]">
              <strong>Lưu ý:</strong> Thay đổi email hoặc số điện thoại sẽ yêu cầu xác thực lại thông tin.
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <button type="button" onClick={() => setIsEditing(false)} className="h-11 rounded-lg border border-gray-200 bg-white text-[15px] font-semibold text-gray-900">
                Hủy
              </button>
              <button disabled={isUpdatingProfile} className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#f5b400] text-[15px] font-bold text-white disabled:opacity-60">
                <Check className="h-4 w-4" />
                {isUpdatingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      <main className="mx-auto max-w-[1000px] px-4 pb-24 pt-8">
        <div className="mb-7">
          <h1 className="text-[32px] font-bold leading-10 text-gray-950">Thông tin tài khoản</h1>
          <p className="mt-2 text-[16px] text-gray-600">Quản lý thông tin cá nhân và bảo mật</p>
        </div>

        {(profileMessage || passwordMessage || errorMessage) && (
          <div className={`mb-5 rounded-lg border px-4 py-3 text-sm ${errorMessage ? 'border-red-200 bg-red-50 text-red-600' : 'border-green-200 bg-green-50 text-green-700'}`}>
            {errorMessage || profileMessage || passwordMessage}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_315px]">
          <div className="space-y-6">
            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-6 md:flex-row md:items-center">
                <div className="relative mx-auto h-[128px] w-[128px] flex-shrink-0 overflow-hidden rounded-full bg-gray-200 md:mx-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#d9d9d9] text-4xl font-bold text-white">
                      {displayName.charAt(0)}
                    </div>
                  )}
                  <button className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#f5b400] text-white" aria-label="Đổi ảnh đại diện">
                    <Camera className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-[27px] font-bold leading-8 text-gray-950">{displayName}</h2>
                  <p className="mt-2 text-[16px] text-gray-600">Thành viên từ {memberSince}</p>

                  <div className="mt-5 grid grid-cols-3 gap-4">
                    <InfoStat value={String(bookingCount)} label="Đặt phòng" />
                    <InfoStat value={String(rewardPoints)} label="Điểm thưởng" />
                    <InfoStat value={formatVND(totalSpent).replace(/\s/g, '')} label="Tổng chi tiêu" />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-7 flex items-center justify-between gap-4">
                <h2 className="text-[18px] font-semibold text-gray-950">Thông tin cá nhân</h2>
                <button
                  onClick={() => setIsEditing((value) => !value)}
                  className="flex h-10 items-center gap-2 rounded-md border border-gray-200 px-4 text-[14px] font-semibold text-gray-950"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>{isEditing ? 'Hủy' : 'Chỉnh sửa'}</span>
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="grid gap-4 md:grid-cols-2">
                  <ProfileInput label="Họ và tên" register={registerProfile('full_name')} error={profileErrors.full_name?.message} />
                  <ProfileInput label="Số điện thoại" register={registerProfile('phone')} error={profileErrors.phone?.message} />
                  <ProfileInput label="Ngày sinh" type="date" register={registerProfile('date_of_birth')} />
                  <label className="block">
                    <span className="mb-2 block text-sm text-gray-600">Giới tính</span>
                    <select {...registerProfile('gender')} className="h-11 w-full rounded-md border border-gray-200 px-4 text-sm outline-none focus:border-[#f5b400]">
                      <option value="">Chọn giới tính</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Nam">Nam</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </label>
                  <ProfileInput label="Quốc tịch" register={registerProfile('nationality')} />
                  <ProfileInput label="CCCD/Hộ chiếu" register={registerProfile('id_number')} />
                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm text-gray-600">Địa chỉ</span>
                    <input {...registerProfile('address')} className="h-11 w-full rounded-md border border-gray-200 px-4 text-sm outline-none focus:border-[#f5b400]" />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm text-gray-600">Ảnh đại diện URL</span>
                    <input {...registerProfile('avatar_url')} className="h-11 w-full rounded-md border border-gray-200 px-4 text-sm outline-none focus:border-[#f5b400]" />
                  </label>
                  <div className="md:col-span-2">
                    <button disabled={isUpdatingProfile} className="h-11 rounded-md bg-[#f5b400] px-6 text-sm font-bold text-white disabled:opacity-60">
                      {isUpdatingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid gap-x-16 gap-y-7 md:grid-cols-2">
                  <InfoItem icon={<User />} label="Họ và tên" value={displayName} />
                  <InfoItem icon={<Calendar />} label="Ngày sinh" value={birthDate} />
                  <InfoItem icon={<Mail />} label="Email" value={email} />
                  <InfoItem icon={<Phone />} label="Số điện thoại" value={phone} />
                  <InfoItem icon={<User />} label="Giới tính" value={optionalValue(currentUser?.gender)} />
                  <InfoItem icon={<MapPin />} label="Địa chỉ" value={optionalValue(currentUser?.address)} />
                  <InfoItem icon={<User />} label="Quốc tịch" value={optionalValue(currentUser?.nationality)} />
                  <InfoItem icon={<User />} label="CCCD/Hộ chiếu" value={optionalValue(currentUser?.id_number)} />
                </div>
              )}
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-7 flex items-center justify-between gap-4">
                <h2 className="text-[18px] font-semibold text-gray-950">Bảo mật</h2>
                <button
                  onClick={() => setIsChangingPass((value) => !value)}
                  className="flex h-10 items-center gap-2 rounded-md border border-gray-200 px-4 text-[14px] font-semibold text-gray-950"
                >
                  <Lock className="h-4 w-4" />
                  <span>{isChangingPass ? 'Hủy' : 'Đổi mật khẩu'}</span>
                </button>
              </div>

              {isChangingPass ? (
                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                  <PasswordInput label="Mật khẩu hiện tại" register={registerPassword('old_password')} error={passwordErrors.old_password?.message} />
                  <PasswordInput label="Mật khẩu mới" register={registerPassword('new_password')} error={passwordErrors.new_password?.message} />
                  <PasswordInput label="Nhập lại mật khẩu mới" register={registerPassword('confirm_new_password')} error={passwordErrors.confirm_new_password?.message} />
                  <button disabled={isChangingPassword} className="h-11 rounded-md bg-[#f5b400] px-6 text-sm font-bold text-white disabled:opacity-60">
                    {isChangingPassword ? 'Đang đổi...' : 'Lưu mật khẩu'}
                  </button>
                </form>
              ) : (
                <div className="divide-y divide-gray-200">
                  <SecurityRow icon={<Lock />} title="Mật khẩu" subtitle="Được bảo vệ bằng mã hóa" status="Đang dùng" />
                  <SecurityRow icon={<Mail />} title="Xác thực email" subtitle={email} status={currentUser?.is_email_verified ? 'Đã xác thực' : 'Chưa xác thực'} />
                  <SecurityRow icon={<Phone />} title="Xác thực số điện thoại" subtitle={phone} status={currentUser?.phone ? 'Đã cập nhật' : 'Chưa cập nhật'} />
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-lg bg-[#e5a000] p-6 text-white shadow-sm">
              <h2 className="text-[18px] font-semibold">Ưu đãi thành viên {tier}</h2>
              <div className="mt-7 space-y-5 text-[15px]">
                {['Giảm 10% mọi đặt phòng', 'Ưu tiên check-in/out', 'Miễn phí nâng cấp phòng', 'Điểm thưởng x2', 'Bữa sáng miễn phí'].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <Check className="h-4 w-4" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-[18px] font-semibold text-gray-950">Điểm thưởng</h2>
              <div className="py-7 text-center">
                <strong className="block text-[42px] leading-none text-[#d98a00]">{rewardPoints}</strong>
                <span className="mt-3 block text-[15px] text-gray-500">Điểm khả dụng</span>
              </div>
              <div className="space-y-3 border-t border-gray-200 py-5 text-[14px]">
                <div className="flex justify-between"><span className="text-gray-600">Điểm tích lũy:</span><strong>{totalPoints}</strong></div>
                <div className="flex justify-between"><span className="text-gray-600">Điểm đã dùng:</span><strong>{usedPoints}</strong></div>
                <div className="flex justify-between"><span className="text-gray-600">Cập nhật:</span><strong>{updatedAt}</strong></div>
              </div>
              <div className="rounded-lg bg-[#eaf3ff] p-4 text-[14px] text-[#0f4bd9]">
                <Gift className="mb-2 h-4 w-4" />
                Còn {Math.max(0, 5000 - rewardPoints)} điểm nữa để lên hạng Platinum!
              </div>
              <button className="mt-4 h-11 w-full rounded-md bg-[#f5b400] text-[14px] font-bold text-white">Đổi điểm thưởng</button>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-[18px] font-semibold text-gray-950">Tài khoản</h2>
              <div className="space-y-2">
                <SideLink to="/bookings" icon={<Calendar />} label="Lịch sử đặt phòng" />
                <SideLink to="/profile" icon={<Bell />} label="Thông báo" />
                <button onClick={handleLogout} className="flex h-10 w-full items-center gap-3 rounded-md border border-gray-200 px-4 text-left text-[14px] font-semibold text-red-600">
                  <LogOut className="h-4 w-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  )
}

function InfoStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg bg-[#f7f7f8] px-4 py-4 text-center">
      <strong className="block text-[18px] leading-7 text-[#d98a00]">{value}</strong>
      <span className="mt-1 block text-[14px] text-gray-600">{label}</span>
    </div>
  )
}

function InfoItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <span className="mt-1 text-gray-400 [&_svg]:h-5 [&_svg]:w-5">{icon}</span>
      <div>
        <p className="text-[14px] text-gray-500">{label}</p>
        <p className="mt-1 text-[16px] font-semibold text-gray-950">{value}</p>
      </div>
    </div>
  )
}

function SecurityRow({ icon, title, subtitle, status }: { icon: ReactNode; title: string; subtitle: string; status: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div className="flex items-center gap-4">
        <span className="text-gray-400 [&_svg]:h-5 [&_svg]:w-5">{icon}</span>
        <div>
          <p className="text-[16px] font-semibold text-gray-950">{title}</p>
          <p className="mt-1 text-[14px] text-gray-500">{subtitle}</p>
        </div>
      </div>
      <span className="rounded-md bg-[#04c56a] px-3 py-1 text-[12px] font-semibold text-white">{status}</span>
    </div>
  )
}

function ProfileInput({ label, register, error, type = 'text' }: { label: string; register: any; error?: string; type?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-gray-600">{label}</span>
      <input type={type} {...register} className="h-11 w-full rounded-md border border-gray-200 px-4 text-sm outline-none focus:border-[#f5b400]" />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </label>
  )
}

function PasswordInput({ label, register, error }: { label: string; register: any; error?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-gray-600">{label}</span>
      <input type="password" {...register} className="h-11 w-full rounded-md border border-gray-200 px-4 text-sm outline-none focus:border-[#f5b400]" />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </label>
  )
}

function SideLink({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <Link to={to} className="flex h-10 items-center gap-3 rounded-md border border-gray-200 px-4 text-[14px] font-semibold text-gray-950">
      <span className="[&_svg]:h-4 [&_svg]:w-4">{icon}</span>
      <span>{label}</span>
    </Link>
  )
}
