import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

function getErrorMessage(error: any, fallback: string) {
  const detail = error?.response?.data?.detail

  if (typeof detail === 'string') return detail

  if (Array.isArray(detail)) {
    return detail
      .map((item) => (typeof item === 'string' ? item : item?.msg))
      .filter(Boolean)
      .join(', ') || fallback
  }

  if (detail && typeof detail === 'object') return detail.msg || fallback

  return fallback
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
  })
  const [error, setError] = useState('')

  const { register, isRegistering } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Đăng ký | GoldenPlace Hotel'
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await register({
        email: formData.email,
        password: formData.password,
        full_name: `${formData.last_name} ${formData.first_name}`.trim(),
        phone: formData.phone,
      })
      navigate('/auth/login', { state: { message: 'Đăng ký thành công! Vui lòng đăng nhập.' } })
    } catch (err: any) {
      setError(getErrorMessage(err, 'Đăng ký thất bại. Vui lòng thử lại.'))
    }
  }

  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-[970px] px-4 py-4 text-[12px] leading-5 text-[#363636]">
        <Link to="/" className="hover:text-[#00a884]">
          Trang chủ
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="font-medium text-[#00a884]">Đăng ký tài khoản</span>
      </div>

      <section className="mx-auto flex w-full max-w-[970px] flex-col items-center px-4 pb-[26px] pt-[34px]">
        <h1 className="mb-5 text-center font-sans text-[22px] font-normal leading-7 text-[#333]">
          Đăng ký tài khoản
        </h1>

        <form className="w-full max-w-[468px] space-y-3" onSubmit={handleSubmit}>
          {error && (
            <div className="border border-red-100 bg-red-50 px-4 py-2.5 text-center text-xs text-red-600">
              {error}
            </div>
          )}

          <input
            name="last_name"
            type="text"
            required
            className="h-[34px] w-full border border-[#e5e5e5] px-4 text-[12px] text-[#333] outline-none transition placeholder:text-[#a6a6a6] focus:border-[#ffc107]"
            placeholder="Họ*"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
          />

          <input
            name="first_name"
            type="text"
            required
            className="h-[34px] w-full border border-[#e5e5e5] px-4 text-[12px] text-[#333] outline-none transition placeholder:text-[#a6a6a6] focus:border-[#ffc107]"
            placeholder="Tên*"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
          />

          <input
            name="email"
            type="email"
            required
            className="h-[34px] w-full border border-[#e5e5e5] px-4 text-[12px] text-[#333] outline-none transition placeholder:text-[#a6a6a6] focus:border-[#ffc107]"
            placeholder="Email*"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <input
            name="phone"
            type="tel"
            required
            className="h-[34px] w-full border border-[#e5e5e5] px-4 text-[12px] text-[#333] outline-none transition placeholder:text-[#a6a6a6] focus:border-[#ffc107]"
            placeholder="Số điện thoại*"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <input
            name="password"
            type="password"
            required
            className="h-[34px] w-full border border-[#e5e5e5] px-4 text-[12px] text-[#333] outline-none transition placeholder:text-[#a6a6a6] focus:border-[#ffc107]"
            placeholder="Mật khẩu*"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={isRegistering}
              className="h-[38px] bg-[#ffc107] px-7 text-[14px] font-bold text-[#333] transition hover:bg-[#f0b400] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRegistering ? 'Đang xử lý...' : 'Đăng ký ngay'}
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-[12px] font-semibold leading-4 text-[#363636]">
          Bạn đã có tài khoản hãy đăng nhập{' '}
          <Link to="/auth/login" className="hover:text-[#00a884]">
            Tại đây
          </Link>
        </p>
      </section>
    </div>
  )
}
