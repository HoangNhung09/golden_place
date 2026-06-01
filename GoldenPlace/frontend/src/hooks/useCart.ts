import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '../lib/axios'
import { useAuthStore } from '../stores/authStore'
import { CartResponse, CartUpdate } from '../types'

export function useCart() {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuthStore()

  // 1. Lấy thông tin giỏ hàng
  const useGetCart = () => {
    return useQuery({
      queryKey: ['cart'],
      queryFn: async () => {
        const { data } = await apiClient.get<CartResponse>('/cart')
        return data
      },
      enabled: isAuthenticated
    })
  }

  // 2. Cập nhật giỏ hàng (Thêm phòng)
  const updateCartMutation = useMutation({
    mutationFn: async (cartData: CartUpdate) => {
      const { data } = await apiClient.post<CartResponse>('/cart', cartData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    }
  })

  // 3. Xóa giỏ hàng
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.delete<CartResponse>('/cart')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    }
  })

  // 4. Áp dụng mã giảm giá
  const applyPromoMutation = useMutation({
    mutationFn: async (code: string) => {
      const { data } = await apiClient.post<CartResponse>(`/cart/apply-promotion?code=${code}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    }
  })

  // 5. Gỡ bỏ mã giảm giá
  const removePromoMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.delete<CartResponse>('/cart/remove-promotion')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    }
  })

  return {
    useGetCart,
    updateCart: updateCartMutation.mutateAsync,
    isUpdatingCart: updateCartMutation.isPending,
    clearCart: clearCartMutation.mutateAsync,
    isClearingCart: clearCartMutation.isPending,
    applyPromo: applyPromoMutation.mutateAsync,
    isApplyingPromo: applyPromoMutation.isPending,
    removePromo: removePromoMutation.mutateAsync,
    isRemovingPromo: removePromoMutation.isPending
  }
}
