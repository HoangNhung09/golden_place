import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Crown, Eye, Lock, Mail } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { login, isLoggingIn } = useAuth()
  const [email, setEmail] = useState('admin@goldenplace.com')
  const [password, setPassword] = useState('password123')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Admin Login | Golden Place'
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    try {
      const data = await login({ email, password })
      if ((data as any).user?.role !== 'admin') {
        setError('Tài khoản này không có quyền quản trị.')
        return
      }
      navigate('/admin')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.')
    }
  }

  return (
    <main className="grid min-h-screen bg-white font-sans lg:grid-cols-[42%_58%] [&_h1]:font-sans [&_h2]:font-sans [&_h3]:font-sans">
      <section className="relative hidden overflow-hidden lg:block">
        <img src="/images/admin-login-left.png" alt="Golden Place" className="absolute inset-0 h-full w-full object-fill" />
      </section>

      <section className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-[418px]">
          <form onSubmit={handleSubmit} className="rounded-xl border border-[#e5e7eb] bg-white px-8 py-8 shadow-xl">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Crown className="h-9 w-9 text-[#f2ca47]" />
                <span className="text-[28px] font-bold">Golden Place</span>
              </div>
              <h2 className="mt-5 text-[20px] font-bold">Admin Login</h2>
              <p className="mt-4 text-sm text-[#64748b]">Đăng nhập để truy cập hệ thống quản lý khách sạn</p>
            </div>

            {error && <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

            <label className="mt-7 block text-sm font-semibold text-[#334155]">
              Email hoặc Tên đăng nhập
              <span className="relative mt-3 block">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#94a3b8]" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-11 w-full rounded-lg border border-[#d8dee8] pl-12 pr-4 font-normal outline-none focus:border-[#f2ca47]"
                  placeholder="Nhập email hoặc username"
                  required
                />
              </span>
            </label>

            <label className="mt-5 block text-sm font-semibold text-[#334155]">
              Mật khẩu
              <span className="relative mt-3 block">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#94a3b8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-11 w-full rounded-lg border border-[#d8dee8] pl-12 pr-12 font-normal outline-none focus:border-[#f2ca47]"
                  placeholder="Nhập mật khẩu"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" aria-label="Hiện mật khẩu">
                  <Eye className="h-5 w-5" />
                </button>
              </span>
            </label>

            <button disabled={isLoggingIn} className="mt-6 h-11 w-full rounded-lg bg-[#f7d96b] font-bold text-black hover:bg-[#f2ca47] disabled:opacity-60">
              {isLoggingIn ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-[#64748b]">© 2026 Golden Place Hotel. All rights reserved.</p>
        </div>
      </section>
    </main>
  )
}
