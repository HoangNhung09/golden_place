import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1'

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Request interceptor – attach Bearer token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const stored = localStorage.getItem('auth-storage')
      if (stored) {
        const parsed = JSON.parse(stored)
        const token = parsed?.state?.accessToken
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
    } catch {
      // ignore parse errors
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor – handle 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const stored = localStorage.getItem('auth-storage')
        if (stored) {
          const parsed = JSON.parse(stored)
          const refreshToken = parsed?.state?.refreshToken

          if (refreshToken) {
            const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
              refresh_token: refreshToken,
            })

            const newAccessToken = data.access_token

            // Update store
            const newParsed = JSON.parse(localStorage.getItem('auth-storage') || '{}')
            if (newParsed?.state) {
              newParsed.state.accessToken = newAccessToken
              localStorage.setItem('auth-storage', JSON.stringify(newParsed))
            }

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            return apiClient(originalRequest)
          }
        }
      } catch {
        // Refresh failed – clear storage
        localStorage.removeItem('auth-storage')
        window.location.href = '/auth/login'
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
