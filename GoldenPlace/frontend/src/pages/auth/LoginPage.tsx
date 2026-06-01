import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, isLoggingIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const message = location.state?.message

  useEffect(() => {
    document.title = 'Đăng nhập | GoldenPlace Hotel'
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const data = await login({ email, password })
      if ((data as any).user?.role === 'admin') {
        navigate('/admin')
      } else {
        const from = (location.state as any)?.from?.pathname || '/'
        navigate(from)
      }
    } catch (err: any) {
      setError(getErrorMessage(err, 'Đăng nhập thất bại. Vui lòng kiểm tra lại.'))
    }
  }

  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-[970px] px-4 py-4 text-[12px] leading-5 text-[#363636]">
        <Link to="/" className="hover:text-[#00a884]">
          Trang chủ
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="font-medium text-[#00a884]">Đăng nhập tài khoản</span>
      </div>

      <section className="mx-auto flex w-full max-w-[970px] flex-col items-center px-4 pb-[42px] pt-[34px]">
        <h1 className="mb-5 text-center font-sans text-[22px] font-normal leading-7 text-[#333]">
          Đăng nhập tài khoản
        </h1>

        <form className="w-full max-w-[468px] space-y-3" onSubmit={handleSubmit}>
          {message && (
            <div className="border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-center text-xs text-emerald-700">
              {message}
            </div>
          )}
          {error && (
            <div className="border border-red-100 bg-red-50 px-4 py-2.5 text-center text-xs text-red-600">
              {error}
            </div>
          )}

          <input
            name="email"
            type="email"
            required
            className="h-[34px] w-full border border-[#e5e5e5] px-4 text-[12px] text-[#333] outline-none transition placeholder:text-[#a6a6a6] focus:border-[#ffc107]"
            placeholder="nguyenthihoa@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            name="password"
            type="password"
            required
            className="h-[34px] w-full border border-[#e5e5e5] px-4 text-[12px] text-[#333] outline-none transition placeholder:text-[#a6a6a6] focus:border-[#ffc107]"
            placeholder="Hoa@123"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex justify-center pt-1">
            <button
              type="submit"
              disabled={isLoggingIn}
              className="h-[38px] bg-[#ffc107] px-8 text-[14px] font-bold text-[#333] transition hover:bg-[#f0b400] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingIn ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </div>
        </form>

        <div className="mt-4 space-y-4 text-center text-[12px] font-semibold leading-4 text-[#363636]">
          <p>
            Bạn chưa có tài khoản đăng ký{' '}
            <Link to="/auth/register" className="hover:text-[#00a884]">
              Tại đây
            </Link>
          </p>
          <p>
            Bạn quên mật khẩu lấy lại{' '}
            <Link to="/auth/forgot-password" className="hover:text-[#00a884]">
              Tại đây
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
