import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, differenceInDays, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1')
  .replace(/\/api\/v1\/?$/, '')

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// VND currency formatting
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

// Short VND (e.g., 1.5M)
export function formatVNDShort(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)}B ₫`
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M ₫`
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}K ₫`
  }
  return formatVND(amount)
}

// Date formatting (Vietnamese)
export function formatDateVI(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd/MM/yyyy', { locale: vi })
  } catch {
    return dateStr
  }
}

export function formatDateLong(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "EEEE, dd 'tháng' MM, yyyy", { locale: vi })
  } catch {
    return dateStr
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'HH:mm dd/MM/yyyy', { locale: vi })
  } catch {
    return dateStr
  }
}

// Calculate number of nights
export function calcNights(checkIn: string, checkOut: string): number {
  try {
    return Math.max(1, differenceInDays(parseISO(checkOut), parseISO(checkIn)))
  } catch {
    return 1
  }
}

// Convert Date to ISO date string (YYYY-MM-DD)
export function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

// Booking status label in Vietnamese
export function bookingStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    CHECKED_IN: 'Đã check-in',
    CHECKED_OUT: 'Đã check-out',
    CANCELLED: 'Đã hủy',
    NO_SHOW: 'Không đến',
  }
  return labels[status] || status
}

export function paymentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Chưa thanh toán',
    PAID: 'Đã thanh toán',
    REFUNDED: 'Đã hoàn tiền',
    PARTIAL: 'Thanh toán một phần',
  }
  return labels[status] || status
}

export function bookingStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    CONFIRMED: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    CHECKED_IN: 'text-green-400 bg-green-400/10 border-green-400/30',
    CHECKED_OUT: 'text-gray-400 bg-gray-400/10 border-gray-400/30',
    CANCELLED: 'text-red-400 bg-red-400/10 border-red-400/30',
    NO_SHOW: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  }
  return colors[status] || 'text-gray-400 bg-gray-400/10'
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Generate avatar initials
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Get primary image from room
export function getRoomPrimaryImage(images: Array<string> | Array<{ url: string; is_primary: boolean }>): string {
  const resolveImageUrl = (url: string) => {
    if (!url) return 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'
    if (/^(https?:|data:|blob:)/.test(url)) return url
    if (url.startsWith('/static/')) return `${API_ORIGIN}${url}`
    return url
  }

  if (!images || images.length === 0) {
    return 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'
  }

  if (typeof images[0] === 'string') {
    return resolveImageUrl(images[0] as string)
  }

  const primaryImage = (images as Array<{ url: string; is_primary: boolean }> ).find((img) => img.is_primary)
  return resolveImageUrl(primaryImage?.url || (images as Array<{ url: string; is_primary: boolean }>)[0]?.url || '')
}

// Nationality list
export const NATIONALITIES = [
  'Việt Nam',
  'Mỹ',
  'Anh',
  'Pháp',
  'Đức',
  'Nhật Bản',
  'Hàn Quốc',
  'Trung Quốc',
  'Singapore',
  'Thái Lan',
  'Úc',
  'Canada',
  'Ý',
  'Tây Ban Nha',
  'Nga',
  'Ấn Độ',
  'Indonesia',
  'Malaysia',
  'Philippines',
  'Khác',
]

// Check-in time options
export const CHECK_IN_TIMES = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00',
]
