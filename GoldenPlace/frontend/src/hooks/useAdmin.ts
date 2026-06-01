import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '../lib/axios'
import {
  BookingResponse,
  RoomResponse,
  RoomCreate,
  RoomUpdate,
  RoomTypeResponse,
  RoomTypeCreate,
  ServiceResponse,
  ServiceCreate,
  ServiceUpdate,
  PromotionResponse,
  PromotionCreate,
  PromotionUpdate,
  ReviewResponse,
  UserResponse,
  UserCreate
} from '../types'

export function useAdmin() {
  const queryClient = useQueryClient()

  // ==========================================
  // 1. DASHBOARD
  // ==========================================
  const useGetDashboardSummary = () => {
    return useQuery({
      queryKey: ['admin-dashboard-summary'],
      queryFn: async () => {
        const { data } = await apiClient.get('/admin/dashboard/summary')
        return data
      }
    })
  }

  const useGetCheckinsToday = () => {
    return useQuery({
      queryKey: ['admin-checkins-today'],
      queryFn: async () => {
        const { data } = await apiClient.get<BookingResponse[]>('/admin/dashboard/checkin-today')
        return data
      }
    })
  }

  const useGetCheckoutsToday = () => {
    return useQuery({
      queryKey: ['admin-checkouts-today'],
      queryFn: async () => {
        const { data } = await apiClient.get<BookingResponse[]>('/admin/dashboard/checkout-today')
        return data
      }
    })
  }

  // ==========================================
  // 2. ROOMS & ROOM TYPES
  // ==========================================
  const useGetRooms = () => {
    return useQuery({
      queryKey: ['admin-rooms'],
      queryFn: async () => {
        const { data } = await apiClient.get<RoomResponse[]>('/admin/rooms')
        return data
      }
    })
  }

  const createRoomMutation = useMutation({
    mutationFn: async (roomData: RoomCreate) => {
      const { data } = await apiClient.post<RoomResponse>('/admin/rooms', roomData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] })
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
    }
  })

  const updateRoomMutation = useMutation({
    mutationFn: async (payload: { id: string; roomData?: RoomUpdate } & RoomUpdate) => {
      const { id, roomData, ...rest } = payload
      const { data } = await apiClient.put<RoomResponse>(`/admin/rooms/${id}`, roomData || rest)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] })
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
    }
  })

  const updateRoomStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await apiClient.patch<RoomResponse>(`/admin/rooms/${id}/status?status_in=${status}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] })
    }
  })

  const deleteRoomMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/rooms/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] })
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
    }
  })

  const uploadRoomImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await apiClient.post<{ url: string }>('/admin/rooms/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return data.url
    }
  })

  // Room Types
  const useGetRoomTypes = () => {
    return useQuery({
      queryKey: ['admin-room-types'],
      queryFn: async () => {
        const { data } = await apiClient.get<RoomTypeResponse[]>('/admin/room-types')
        return data
      }
    })
  }

  const createRoomTypeMutation = useMutation({
    mutationFn: async (typeData: RoomTypeCreate) => {
      const { data } = await apiClient.post<RoomTypeResponse>('/admin/room-types', typeData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-room-types'] })
      queryClient.invalidateQueries({ queryKey: ['room-types'] })
    }
  })

  const updateRoomTypeMutation = useMutation({
    mutationFn: async (payload: { id: string; typeData?: RoomTypeCreate } & Partial<RoomTypeCreate>) => {
      const { id, typeData, ...rest } = payload
      const { data } = await apiClient.put<RoomTypeResponse>(`/admin/room-types/${id}`, typeData || rest)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-room-types'] })
      queryClient.invalidateQueries({ queryKey: ['room-types'] })
    }
  })

  const deleteRoomTypeMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/room-types/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-room-types'] })
      queryClient.invalidateQueries({ queryKey: ['room-types'] })
    }
  })

  // ==========================================
  // 3. BOOKINGS
  // ==========================================
  const useGetBookings = (params: { status?: string; guest_name?: string; booking_code?: string; search?: string; page?: number; limit?: number } = {}) => {
    return useQuery({
      queryKey: ['admin-bookings', params],
      queryFn: async () => {
        const normalizedParams = { ...params }
        if (params.search && !params.guest_name && !params.booking_code) {
          if (params.search.toUpperCase().startsWith('HBS-')) {
            normalizedParams.booking_code = params.search
          } else {
            normalizedParams.guest_name = params.search
          }
          delete normalizedParams.search
        }
        const { data } = await apiClient.get('/admin/bookings', { params: normalizedParams })
        return {
          ...data,
          items: data.items || data.bookings || [],
        }
      }
    })
  }

  const useGetBookingHistory = (params: { guest_name?: string; booking_code?: string; search?: string; page?: number; limit?: number } = {}) => {
    return useQuery({
      queryKey: ['admin-booking-history', params],
      queryFn: async () => {
        const normalizedParams = { ...params }
        if (params.search && !params.guest_name && !params.booking_code) {
          if (params.search.toUpperCase().startsWith('HBS-') || params.search.toUpperCase().startsWith('GP')) {
            normalizedParams.booking_code = params.search
          } else {
            normalizedParams.guest_name = params.search
          }
          delete normalizedParams.search
        }
        const { data } = await apiClient.get('/admin/bookings/history', { params: normalizedParams })
        return {
          ...data,
          items: data.items || data.bookings || [],
        }
      }
    })
  }

  const useGetCalendarBookings = (startDate: string, endDate: string) => {
    return useQuery({
      queryKey: ['admin-bookings-calendar', startDate, endDate],
      queryFn: async () => {
        const { data } = await apiClient.get<any[]>('/admin/bookings/calendar', {
          params: { start_date: startDate, end_date: endDate }
        })
        return data
      }
    })
  }

  const useGetBookingDetail = (id: string) => {
    return useQuery({
      queryKey: ['admin-booking-detail', id],
      queryFn: async () => {
        const { data } = await apiClient.get<BookingResponse>(`/admin/bookings/${id}`)
        return data
      },
      enabled: !!id
    })
  }

  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: string; note?: string }) => {
      const { data } = await apiClient.patch<BookingResponse>(`/admin/bookings/${id}/status`, { status, note })
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-booking-detail', data.id] })
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['admin-booking-history'] })
      queryClient.invalidateQueries({ queryKey: ['admin-checkins-today'] })
      queryClient.invalidateQueries({ queryKey: ['admin-checkouts-today'] })
    }
  })

  // ==========================================
  // 4. CUSTOMERS
  // ==========================================
  const useGetCustomers = (params: { search?: string; page?: number; limit?: number } = {}) => {
    return useQuery({
      queryKey: ['admin-customers', params],
      queryFn: async () => {
        const { data } = await apiClient.get('/admin/customers', { params })
        return data
      }
    })
  }

  const useGetCustomerDetail = (id: string) => {
    return useQuery({
      queryKey: ['admin-customer-detail', id],
      queryFn: async () => {
        const { data } = await apiClient.get(`/admin/customers/${id}`)
        return data
      },
      enabled: !!id
    })
  }

  const toggleCustomerActiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch<UserResponse>(`/admin/customers/${id}/toggle-active`)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-customer-detail', data.id] })
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
    }
  })

  const updateCustomerNoteMutation = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      const { data } = await apiClient.patch<UserResponse>(`/admin/customers/${id}/note?note=${encodeURIComponent(note)}`)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-customer-detail', data.id] })
    }
  })

  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: UserCreate) => {
      const { data } = await apiClient.post<UserResponse>('/admin/customers', customerData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
    }
  })

  const updateCustomerMutation = useMutation({
    mutationFn: async (payload: { id: string; customerData?: Partial<UserCreate> } & Partial<UserCreate> & { is_active?: boolean }) => {
      const { id, customerData, ...rest } = payload
      const { data } = await apiClient.put<UserResponse>(`/admin/customers/${id}`, customerData || rest)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-customer-detail', data.id] })
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
    }
  })

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/customers/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
    }
  })

  // ==========================================
  // 5. SERVICES
  // ==========================================
  const useGetServices = () => {
    return useQuery({
      queryKey: ['admin-services'],
      queryFn: async () => {
        const { data } = await apiClient.get<ServiceResponse[]>('/admin/services')
        return data
      }
    })
  }

  const createServiceMutation = useMutation({
    mutationFn: async (serviceData: ServiceCreate) => {
      const { data } = await apiClient.post<ServiceResponse>('/admin/services', serviceData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] })
      queryClient.invalidateQueries({ queryKey: ['services'] })
    }
  })

  const updateServiceMutation = useMutation({
    mutationFn: async (payload: { id: string; serviceData?: ServiceUpdate } & ServiceUpdate) => {
      const { id, serviceData, ...rest } = payload
      const { data } = await apiClient.put<ServiceResponse>(`/admin/services/${id}`, serviceData || rest)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] })
      queryClient.invalidateQueries({ queryKey: ['services'] })
    }
  })

  const toggleServiceActiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch<ServiceResponse>(`/admin/services/${id}/toggle-active`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] })
    }
  })

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/services/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] })
      queryClient.invalidateQueries({ queryKey: ['services'] })
    }
  })

  // ==========================================
  // 6. PROMOTIONS
  // ==========================================
  const useGetPromotions = () => {
    return useQuery({
      queryKey: ['admin-promotions'],
      queryFn: async () => {
        const { data } = await apiClient.get<PromotionResponse[]>('/admin/promotions')
        return data
      }
    })
  }

  const createPromotionMutation = useMutation({
    mutationFn: async (promoData: PromotionCreate) => {
      const payload = {
        ...promoData,
        type: (promoData as any).type || 'COUPON',
        discount_type: promoData.discount_type === 'FIXED' ? 'AMOUNT' : promoData.discount_type || 'PERCENT',
        discount_value: promoData.discount_value ?? promoData.discount_percent ?? 0,
        min_order_amount: (promoData as any).min_order_amount ?? promoData.min_booking_amount ?? 0,
        max_uses: (promoData as any).max_uses ?? promoData.usage_limit,
        applicable_to: (promoData as any).applicable_to || 'ALL',
      }
      const { data } = await apiClient.post<PromotionResponse>('/admin/promotions', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promotions'] })
    }
  })

  const updatePromotionMutation = useMutation({
    mutationFn: async (payload: { id: string; promoData?: PromotionUpdate } & PromotionUpdate) => {
      const { id, promoData, ...rest } = payload
      const source = promoData || rest
      const normalized = {
        ...source,
        type: (source as any).type || 'COUPON',
        discount_type: source.discount_type === 'FIXED' ? 'AMOUNT' : source.discount_type || 'PERCENT',
        discount_value: source.discount_value ?? source.discount_percent ?? 0,
        min_order_amount: (source as any).min_order_amount ?? source.min_booking_amount ?? 0,
        max_uses: (source as any).max_uses ?? source.usage_limit,
        applicable_to: (source as any).applicable_to || 'ALL',
      }
      const { data } = await apiClient.put<PromotionResponse>(`/admin/promotions/${id}`, normalized)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promotions'] })
    }
  })

  const togglePromotionActiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch<PromotionResponse>(`/admin/promotions/${id}/toggle-active`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promotions'] })
    }
  })

  const deletePromotionMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/promotions/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promotions'] })
    }
  })

  // ==========================================
  // 7. REVIEWS
  // ==========================================
  const useGetReviews = () => {
    return useQuery({
      queryKey: ['admin-reviews'],
      queryFn: async () => {
        const { data } = await apiClient.get<ReviewResponse[]>('/admin/reviews')
        return data
      }
    })
  }

  const updateReviewStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await apiClient.patch<ReviewResponse>(`/admin/reviews/${id}/status?status_in=${status}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
    }
  })

  const replyReviewMutation = useMutation({
    mutationFn: async (payload: { id?: string; reply?: string; review_id?: string; admin_reply?: string }) => {
      const id = payload.id || payload.review_id
      const reply = payload.reply || payload.admin_reply || ''
      const { data } = await apiClient.post<ReviewResponse>(`/admin/reviews/${id}/reply`, { reply })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
    }
  })

  // ==========================================
  // 8. REPORTS
  // ==========================================
  const useGetRevenueReport = (days = 30) => {
    return useQuery({
      queryKey: ['admin-report-revenue', days],
      queryFn: async () => {
        const { data } = await apiClient.get('/admin/reports/revenue', { params: { days } })
        return data
      }
    })
  }

  const useGetOccupancyReport = (days = 30) => {
    return useQuery({
      queryKey: ['admin-report-occupancy', days],
      queryFn: async () => {
        const { data } = await apiClient.get('/admin/reports/occupancy', { params: { days } })
        return data
      }
    })
  }

  const useGetServicesReport = () => {
    return useQuery({
      queryKey: ['admin-report-services'],
      queryFn: async () => {
        const { data } = await apiClient.get('/admin/reports/services')
        return data
      }
    })
  }

  // ==========================================
  // 9. ADMIN ACCOUNT MANAGEMENT
  // ==========================================
  const useGetAdmins = () => {
    return useQuery({
      queryKey: ['admin-users'],
      queryFn: async () => {
        const { data } = await apiClient.get<UserResponse[]>('/admin/users')
        return data
      }
    })
  }

  const createAdminUserMutation = useMutation({
    mutationFn: async (adminData: UserCreate & { role?: string; is_active?: boolean }) => {
      const { data } = await apiClient.post<UserResponse>('/admin/users', adminData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    }
  })

  const updateAdminUserMutation = useMutation({
    mutationFn: async (payload: { id: string; adminData?: Partial<UserCreate> } & Partial<UserCreate> & { role?: string; is_active?: boolean }) => {
      const { id, adminData, ...rest } = payload
      const { data } = await apiClient.put<UserResponse>(`/admin/users/${id}`, adminData || rest)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    }
  })

  const deleteAdminUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/users/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    }
  })

  return {
    // Dashboard
    useGetDashboardSummary,
    useGetCheckinsToday,
    useGetCheckoutsToday,
    
    // Rooms & RoomTypes
    useGetRooms,
    useGetAdminRooms: (params: { room_type_id?: string; status?: string; page?: number; limit?: number } = {}) => {
      return useQuery({
        queryKey: ['admin-rooms', params],
        queryFn: async () => {
          const { data } = await apiClient.get<RoomResponse[]>('/admin/rooms')
          let items = data
          if (params.room_type_id) items = items.filter((room) => room.room_type_id === params.room_type_id)
          if (params.status) items = items.filter((room) => room.status === params.status)
          const page = params.page || 1
          const limit = params.limit || 10
          const total = items.length
          const start = (page - 1) * limit
          return {
            items: items.slice(start, start + limit),
            total,
            page,
            limit,
            pages: Math.max(1, Math.ceil(total / limit)),
          }
        }
      })
    },
    createRoom: createRoomMutation.mutateAsync,
    isCreatingRoom: createRoomMutation.isPending,
    updateRoom: updateRoomMutation.mutateAsync,
    isUpdatingRoom: updateRoomMutation.isPending,
    updateRoomStatus: updateRoomStatusMutation.mutateAsync,
    isUpdatingRoomStatus: updateRoomStatusMutation.isPending,
    deleteRoom: deleteRoomMutation.mutateAsync,
    uploadRoomImage: uploadRoomImageMutation.mutateAsync,
    isUploadingImage: uploadRoomImageMutation.isPending,
    
    useGetRoomTypes,
    createRoomType: createRoomTypeMutation.mutateAsync,
    updateRoomType: updateRoomTypeMutation.mutateAsync,
    deleteRoomType: deleteRoomTypeMutation.mutateAsync,
    
    // Bookings
    useGetBookings,
    useGetAdminBookings: useGetBookings,
    useGetBookingHistory,
    useGetCalendarBookings,
    useGetBookingDetail,
    updateBookingStatus: updateBookingStatusMutation.mutateAsync,
    isUpdatingBookingStatus: updateBookingStatusMutation.isPending,
    
    // Customers
    useGetCustomers,
    useGetCustomerDetail,
    toggleCustomerActive: toggleCustomerActiveMutation.mutateAsync,
    updateUserStatus: async ({ id }: { id: string; is_active?: boolean }) => toggleCustomerActiveMutation.mutateAsync(id),
    updateCustomerNote: updateCustomerNoteMutation.mutateAsync,
    createCustomer: createCustomerMutation.mutateAsync,
    updateCustomer: updateCustomerMutation.mutateAsync,
    deleteCustomer: deleteCustomerMutation.mutateAsync,
    
    // Services
    useGetServices,
    createService: createServiceMutation.mutateAsync,
    updateService: updateServiceMutation.mutateAsync,
    toggleServiceActive: toggleServiceActiveMutation.mutateAsync,
    deleteService: deleteServiceMutation.mutateAsync,
    
    // Promotions
    useGetPromotions,
    createPromotion: createPromotionMutation.mutateAsync,
    updatePromotion: updatePromotionMutation.mutateAsync,
    togglePromotionActive: togglePromotionActiveMutation.mutateAsync,
    deletePromotion: deletePromotionMutation.mutateAsync,
    
    // Reviews
    useGetReviews,
    updateReviewStatus: updateReviewStatusMutation.mutateAsync,
    replyReview: replyReviewMutation.mutateAsync,
    replyToReview: replyReviewMutation.mutateAsync,
    isReplyingReview: replyReviewMutation.isPending,
    
    // Reports
    useGetReportsSummary: (_startDate?: string, _endDate?: string) => useGetDashboardSummary(),
    useGetRevenueReport,
    useGetOccupancyReport,
    useGetServicesReport,
    
    // Admin management
    useGetAdmins,
    useGetSystemUsers: useGetAdmins,
    createAdminUser: createAdminUserMutation.mutateAsync,
    createSystemUser: createAdminUserMutation.mutateAsync,
    updateAdminUser: updateAdminUserMutation.mutateAsync,
    updateSystemUser: updateAdminUserMutation.mutateAsync,
    deleteAdminUser: deleteAdminUserMutation.mutateAsync
    ,
    deleteSystemUser: deleteAdminUserMutation.mutateAsync
  }
}
