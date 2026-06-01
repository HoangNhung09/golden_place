import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft, Send } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const forgotSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
})

type ForgotForm = z.infer<typeof forgotSchema>

export default function ForgotPasswordPage() {
  const { forgotPassword, isSendingForgot } = useAuth()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    document.title = 'Quên Mật Khẩu | GoldenPlace Hotel'
  }, [])

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  })

  const onSubmit = async (data: ForgotForm) => {
    setError('')
    try {
      await forgotPassword(data)
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Gửi yêu cầu thất bại. Vui lòng thử lại.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-24 pb-20">
      
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 w-full mb-8 text-xs uppercase tracking-wider text-gray-500">
        <Link to="/" className="hover:text-gray-900 transition-colors">
          Trang chủ
        </Link>
        <span className="text-gray-300 mx-2">/</span>
        <span className="text-[#c9a84c] font-bold">Quên mật khẩu</span>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 md:p-10 border border-gray-100 rounded-lg shadow-sm space-y-6">
          <div className="flex items-center space-x-2 border-b border-gray-100 pb-4">
            <Link to="/auth/login" className="text-gray-400 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-lg font-serif font-bold text-gray-900 uppercase tracking-wider">Quên Mật Khẩu</h1>
          </div>

          {success ? (
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto w-12 h-12 bg-yellow-50 border border-[#c9a84c]/20 rounded-full flex items-center justify-center text-[#c9a84c]">
                <Send className="h-5 w-5" />
              </div>
              <h3 className="text-base font-serif font-bold text-gray-900 uppercase tracking-wider">Yêu Cầu Đã Gửi</h3>
              <p className="text-xs text-gray-500">
                Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư đến.
              </p>
              <div className="pt-4">
                <Link
                  to="/auth/login"
                  className="inline-block bg-[#c9a84c] hover:bg-[#b08f39] text-white font-bold py-2.5 px-6 rounded text-xs transition-colors uppercase tracking-widest"
                >
                  Quay lại đăng nhập
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider leading-relaxed">
                Nhập địa chỉ email đã đăng ký của bạn. Chúng tôi sẽ gửi một liên kết để bạn đặt lại mật khẩu mới.
              </p>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Email của bạn *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c9a84c]" />
                    <input
                      type="email"
                      {...register('email')}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 placeholder-gray-400 text-gray-900 rounded focus:outline-none focus:ring-1 focus:ring-[#c9a84c] focus:border-[#c9a84c] text-sm transition-colors"
                      placeholder="nhap email cua ban"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSendingForgot}
                  className="w-full flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#b08f39] text-white font-bold py-3.5 px-4 rounded transition-all duration-300 disabled:opacity-50 uppercase tracking-widest text-xs shadow-sm"
                >
                  {isSendingForgot ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Gửi link đặt lại mật khẩu
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
