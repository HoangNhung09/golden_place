import { useQuery } from '@tanstack/react-query'
import apiClient from '../lib/axios'
import { RoomResponse, RoomTypeResponse } from '../types'

interface GetRoomsParams {
  room_type_id?: string
  min_price?: number
  max_price?: number
  amenities?: string[]
  check_in?: string
  check_out?: string
  adults?: number
  children?: number
  sort_by?: string
  page?: number
  limit?: number
}

interface GetRoomsResponse {
  rooms: RoomResponse[]
  total: number
  page: number
  limit: number
  pages: number
}

export function useRooms() {
  // 1. Lấy danh sách phòng (với bộ lọc)
  const useGetRooms = (params: GetRoomsParams = {}) => {
    return useQuery({
      queryKey: ['rooms', params],
      queryFn: async () => {
        const queryParams = new URLSearchParams()
        if (params.room_type_id) queryParams.append('room_type_id', params.room_type_id)
        if (params.min_price !== undefined) queryParams.append('min_price', String(params.min_price))
        if (params.max_price !== undefined) queryParams.append('max_price', String(params.max_price))
        if (params.sort_by) queryParams.append('sort_by', params.sort_by)
        if (params.page) queryParams.append('page', String(params.page))
        if (params.limit) queryParams.append('limit', String(params.limit))
        if (params.amenities && params.amenities.length > 0) {
          params.amenities.forEach((amenity) => queryParams.append('amenities', amenity))
        }
        if (params.check_in) queryParams.append('check_in', params.check_in)
        if (params.check_out) queryParams.append('check_out', params.check_out)
        if (params.adults !== undefined) queryParams.append('adults', String(params.adults))
        if (params.children !== undefined) queryParams.append('children', String(params.children))

        const { data } = await apiClient.get<GetRoomsResponse>(`/rooms?${queryParams.toString()}`)
        return data
      }
    })
  }

  // 2. Tìm kiếm phòng trống theo ngày
  const useSearchRooms = (checkIn: string, checkOut: string, adults: number, children: number, enabled = false) => {
    return useQuery({
      queryKey: ['rooms-search', checkIn, checkOut, adults, children],
      queryFn: async () => {
        const { data } = await apiClient.get<RoomResponse[]>('/rooms/search', {
          params: {
            check_in: checkIn,
            check_out: checkOut,
            adults,
            children
          }
        })
        return data
      },
      enabled: enabled && !!checkIn && !!checkOut
    })
  }

  // 3. Chi tiết phòng
  const useGetRoomDetail = (roomId: string) => {
    return useQuery({
      queryKey: ['room', roomId],
      queryFn: async () => {
        const { data } = await apiClient.get<RoomResponse>(`/rooms/${roomId}`)
        return data
      },
      enabled: !!roomId
    })
  }

  // 4. Danh sách các Room Type
  const useGetRoomTypes = () => {
    return useQuery({
      queryKey: ['room-types'],
      queryFn: async () => {
        const { data } = await apiClient.get<RoomTypeResponse[]>('/room-types')
        return data
      }
    })
  }

  return {
    useGetRooms,
    useSearchRooms,
    useGetRoomDetail,
    useGetRoomTypes
  }
}
