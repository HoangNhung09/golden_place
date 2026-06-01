// ============================================================
// CORE ENTITIES
// ============================================================

export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  nationality?: string
  id_number?: string
  avatar_url?: string
  date_of_birth?: string
  gender?: string
  address?: string
  membership_tier?: string
  reward_points?: number
  total_points?: number
  used_points?: number
  booking_count?: number
  total_spent?: number
  role: 'customer' | 'admin' | 'staff'
  is_active: boolean
  is_email_verified?: boolean
  created_at: string
  updated_at: string
}

export interface UserResponse extends User {}

export interface UserCreate {
  email: string
  password: string
  full_name: string
  phone?: string
}

export interface UserUpdate {
  full_name?: string
  phone?: string
  avatar_url?: string
  date_of_birth?: string
  gender?: string
  address?: string
  nationality?: string
  id_number?: string
}

export interface UserPasswordUpdate {
  old_password: string
  new_password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: UserResponse
}

export interface ResetPasswordRequest {
  email: string
}

export interface ResetPasswordSubmit {
  token: string
  new_password: string
  confirm_password: string
}

export interface RoomType {
  id: string
  name: string
  description: string
  base_price: number
  max_guests: number
  amenities: string[]
  created_at: string
}

export interface RoomTypeResponse extends RoomType {}

export interface Room {
  id: string
  room_number: string
  room_type: RoomType
  room_type_id: string
  floor: number
  area?: number
  area_sqm?: number
  max_adults: number
  max_children: number
  base_price: number
  weekend_price?: number
  description: string
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'CLEANING' | 'BLOCKED'
  amenities: string[]
  images: string[]
  average_rating?: number
  total_reviews?: number
  created_at: string
  updated_at: string
}

export interface RoomResponse extends Room {}

export interface RoomCreate {
  room_number: string
  room_type_id: string
  floor: number
  max_adults: number
  max_children: number
  area_sqm?: number
  base_price: number
  weekend_price?: number
  description?: string
  images: string[]
  status: Room['status']
}

export interface RoomUpdate extends Partial<RoomCreate> {
  is_active?: boolean
}

export interface RoomTypeCreate {
  name: string
  description?: string
  amenities: string[]
}

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED'
  | 'NO_SHOW'

export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'PARTIAL'
export type PaymentMethod = 'PAY_AT_HOTEL' | 'BANK_TRANSFER' | 'VISA' | 'MOMO'

export interface Promotion {
  id: string
  code: string
  name: string
  description: string
  discount_type: 'PERCENTAGE' | 'FIXED'
  discount_value: number
  min_booking_amount: number
  max_discount_amount?: number
  start_date: string
  end_date: string
  usage_limit: number
  used_count?: number
  is_active: boolean
}

export interface PromotionResponse extends Promotion {}

export interface PromotionCreate {
  code: string
  name: string
  description: string
  discount_type?: Promotion['discount_type']
  discount_value?: number
  discount_percent?: number
  min_booking_amount?: number
  max_discount_amount?: number
  start_date: string
  end_date: string
  usage_limit?: number
  is_active?: boolean
}

export interface PromotionUpdate extends Partial<PromotionCreate> {}

export interface Service {
  id: string
  name: string
  description: string
  price: number
  unit: string
  category?: string
  is_active: boolean
  image_url?: string
}

export interface ServiceResponse extends Service {}

export interface ServiceCreate {
  name: string
  description?: string
  price: number
  unit: string
  category?: string
  is_active?: boolean
  image_url?: string
}

export interface ServiceUpdate extends Partial<ServiceCreate> {}

export interface BookingService {
  id: string
  booking_id: string
  service_id: string
  quantity: number
  unit_price: number
  subtotal: number
  service?: Service
}

export interface BookingStatusLog {
  id: string
  changed_by?: string
  old_status?: string
  new_status: string
  note?: string
  created_at: string
}

export interface Booking {
  id: string
  booking_code: string
  user_id: string
  room: Room
  room_id: string
  check_in_date: string
  check_out_date: string
  adults: number
  children: number
  guest_name: string
  guest_email: string
  guest_phone: string
  guest_nationality: string
  guest_id_number: string
  expected_checkin_time?: string
  special_requests?: string
  cancellation_reason?: string
  status: BookingStatus
  room_price_snapshot: number
  discount_amount: number
  services_amount: number
  total_amount: number
  payment_method: PaymentMethod
  payment_status: 'UNPAID' | 'PAID' | 'REFUNDED' | 'PARTIAL'
  invoice_requested: boolean
  invoice_company_name?: string
  invoice_tax_code?: string
  invoice_company_address?: string
  promotion?: Promotion
  promotion_id?: string
  booking_services: BookingService[]
  status_logs?: BookingStatusLog[]
  created_at: string
  updated_at: string
}

export interface BookingResponse extends Booking {}

export interface BookingCreate {
  guest_name: string
  guest_email: string
  guest_phone: string
  guest_nationality: string
  guest_id_number: string
  special_requests?: string
  expected_checkin_time?: string
  payment_method?: PaymentMethod
  invoice_requested?: boolean
  invoice_company_name?: string
  invoice_tax_code?: string
  invoice_company_address?: string
  services: Array<{
    service_id: string
    quantity: number
  }>
}

export interface Review {
  id: string
  booking_id: string
  user_id: string
  room_id: string
  rating_room: number
  rating_service: number
  rating_cleanliness: number
  rating_location: number
  rating_value: number
  rating_overall?: number
  comment?: string
  images?: string[]
  status?: string
  admin_reply?: string
  admin_reply_at?: string
  user?: User
  room?: Room
  created_at: string
  updated_at: string
}

export interface ReviewResponse extends Review {}

export interface ReviewCreate {
  booking_id: string
  rating_room: number
  rating_service: number
  rating_cleanliness: number
  rating_location: number
  rating_value: number
  comment?: string
  images?: string[]
}

export interface Cart {
  id: string
  user_id: string
  room_id?: string
  promotion_id?: string
  discount_amount?: number
  check_in_date?: string
  check_out_date?: string
  adults: number
  children: number
  is_expired: boolean
  expires_at?: string
  created_at: string
  updated_at: string
  room?: Room
  promotion?: Promotion
}

export interface CartResponse extends Cart {}

export interface CartUpdate {
  room_id: string
  check_in_date: string
  check_out_date: string
  adults: number
  children: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface ApiError {
  message: string
  detail?: string | Record<string, string[]>
  status_code: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  full_name: string
  phone?: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface AuthResponse {
  user: User
  access_token: string
  refresh_token: string
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  new_password: string
  confirm_password: string
}

export interface CartItem {
  id: string
  room: Room
  check_in_date: string
  check_out_date: string
  adults: number
  children: number
  nights: number
  price_per_night: number
  subtotal: number
}

export interface CartSummary {
  items: CartItem[]
  coupon?: Promotion
  discount_amount: number
  subtotal: number
  total: number
}

export interface GuestInfoForm {
  full_name: string
  email: string
  phone: string
  nationality: string
  id_number: string
  special_requests?: string
  expected_check_in_time?: string
}

export interface CheckoutServiceItem {
  service_id: string
  quantity: number
}

export interface CheckoutData {
  guest_info: GuestInfoForm
  services: CheckoutServiceItem[]
  promotion_code?: string
}

export interface RoomFilters {
  check_in?: string
  check_out?: string
  adults?: number
  children?: number
  room_type_ids?: string[]
  min_price?: number
  max_price?: number
  amenities?: string[]
  page?: number
  page_size?: number
}

export interface BookingFilters {
  status?: BookingStatus
  payment_status?: PaymentStatus
  check_in_from?: string
  check_in_to?: string
  search?: string
  page?: number
  page_size?: number
}

export interface CustomerFilters {
  search?: string
  is_active?: boolean
  page?: number
  page_size?: number
}

export interface DashboardStats {
  bookings_today: number
  revenue_today: number
  occupancy_rate: number
  guests_currently: number
  bookings_this_month: number
  revenue_this_month: number
  pending_bookings: number
  available_rooms: number
}

export interface RevenueChartData {
  date: string
  revenue: number
  bookings: number
}

export interface BookingsByStatus {
  status: BookingStatus
  count: number
}

export interface OccupancyData {
  date: string
  occupancy_rate: number
  occupied_rooms: number
  total_rooms: number
}

export interface RoomFormData {
  room_number: string
  room_type_id: string
  floor: number
  area: number
  max_adults: number
  max_children: number
  base_price: number
  description: string
  amenities: string[]
  status: Room['status']
}

export interface RoomTypeFormData {
  name: string
  description: string
  base_price: number
  max_guests: number
  amenities: string[]
}

export interface ServiceFormData {
  name: string
  description: string
  price: number
  unit: string
  category: string
  is_active: boolean
}

export interface PromotionFormData {
  code: string
  name: string
  description: string
  discount_type: 'PERCENTAGE' | 'FIXED'
  discount_value: number
  min_booking_amount: number
  max_discount_amount?: number
  start_date: string
  end_date: string
  usage_limit: number
  is_active: boolean
}
