import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '../lib/axios'
import {
  BookingCreate,
  BookingResponse,
  ReviewCreate,
  ReviewResponse,
  ServiceResponse
} from '../types'

export function useBookings() {
  const queryClient = useQueryClient()

  // 1. Tạo đơn đặt phòng mới
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: BookingCreate) => {
      const { data } = await apiClient.post<BookingResponse>('/bookings', bookingData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    }
  })

  // 2. Danh sách booking cá nhân
  const useGetMyBookings = (status?: string) => {
    return useQuery({
      queryKey: ['bookings', status],
      queryFn: async () => {
        const { data } = await apiClient.get<BookingResponse[]>('/bookings/me', {
          params: status ? { status } : {}
        })
        return data
      }
    })
  }

  // 3. Chi tiết đơn đặt phòng
  const useGetBookingDetail = (bookingCode: string) => {
    return useQuery({
      queryKey: ['booking', bookingCode],
      queryFn: async () => {
        const { data } = await apiClient.get<BookingResponse>(`/bookings/${bookingCode}`)
        return data
      },
      enabled: !!bookingCode
    })
  }

  // 4. Hủy đặt phòng
  const cancelBookingMutation = useMutation({
    mutationFn: async ({ bookingCode, reason }: { bookingCode: string; reason: string }) => {
      const { data } = await apiClient.patch<BookingResponse>(`/bookings/${bookingCode}/cancel?reason=${encodeURIComponent(reason)}`)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['booking', data.booking_code] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    }
  })

  // 5. Gửi đánh giá review
  const createReviewMutation = useMutation({
    mutationFn: async (reviewData: ReviewCreate) => {
      const { data } = await apiClient.post<ReviewResponse>('/reviews', reviewData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    }
  })

  // 6. Xem reviews của phòng
  const useGetRoomReviews = (roomId: string) => {
    return useQuery({
      queryKey: ['room-reviews', roomId],
      queryFn: async () => {
        const { data } = await apiClient.get<ReviewResponse[]>(`/reviews/room/${roomId}`)
        return data
      },
      enabled: !!roomId
    })
  }

  // 7. Lấy danh sách dịch vụ khách sạn (public)
  const useGetServices = () => {
    return useQuery({
      queryKey: ['services'],
      queryFn: async () => {
        const { data } = await apiClient.get<ServiceResponse[]>('/services')
        return data
      }
    })
  }

  return {
    createBooking: createBookingMutation.mutateAsync,
    isCreatingBooking: createBookingMutation.isPending,
    useGetMyBookings,
    useGetBookingDetail,
    cancelBooking: cancelBookingMutation.mutateAsync,
    isCancelling: cancelBookingMutation.isPending,
    createReview: createReviewMutation.mutateAsync,
    isCreatingReview: createReviewMutation.isPending,
    useGetRoomReviews,
    useGetServices
  }
}
