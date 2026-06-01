import { useMutation, useQuery } from '@tanstack/react-query'
import apiClient from '../lib/axios'
import { useAuthStore } from '../stores/authStore'
import {
  LoginRequest,
  TokenResponse,
  UserCreate,
  UserResponse,
  UserUpdate,
  UserPasswordUpdate,
  ResetPasswordRequest,
  ResetPasswordSubmit
} from '../types'

export function useAuth() {
  const { login, logout, updateUser, user, isAuthenticated } = useAuthStore()

  // 1. Đăng ký tài khoản
  const registerMutation = useMutation({
    mutationFn: async (userData: UserCreate) => {
      const { data } = await apiClient.post<UserResponse>('/auth/register', userData)
      return data
    }
  })

  // 2. Đăng nhập
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const { data } = await apiClient.post<TokenResponse>('/auth/login', credentials)
      return data
    },
    onSuccess: (data) => {
      login(data.user, data.access_token, data.refresh_token)
    }
  })

  // 3. Quên mật khẩu
  const forgotPasswordMutation = useMutation({
    mutationFn: async (req: ResetPasswordRequest) => {
      const { data } = await apiClient.post('/auth/forgot-password', req)
      return data
    }
  })

  // 4. Đặt lại mật khẩu
  const resetPasswordMutation = useMutation({
    mutationFn: async (req: ResetPasswordSubmit) => {
      const { data } = await apiClient.post('/auth/reset-password', req)
      return data
    }
  })

  // 5. Xác thực email
  const verifyEmailMutation = useMutation({
    mutationFn: async (token: string) => {
      const { data } = await apiClient.get(`/auth/verify-email?token=${token}`)
      return data
    }
  })

  // 6. Cập nhật thông tin cá nhân
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: UserUpdate) => {
      const { data } = await apiClient.put<UserResponse>('/auth/profile', profileData)
      return data
    },
    onSuccess: (data) => {
      updateUser(data)
    }
  })

  // 7. Đổi mật khẩu
  const changePasswordMutation = useMutation({
    mutationFn: async (passwordData: UserPasswordUpdate) => {
      const { data } = await apiClient.patch('/auth/change-password', passwordData)
      return data
    }
  })

  return {
    user,
    isAuthenticated,
    isAdmin: user?.role === 'admin',
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    isSendingForgot: forgotPasswordMutation.isPending,
    resetPassword: resetPasswordMutation.mutateAsync,
    isResetting: resetPasswordMutation.isPending,
    verifyEmail: verifyEmailMutation.mutateAsync,
    isVerifying: verifyEmailMutation.isPending,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    logout
  }
}
