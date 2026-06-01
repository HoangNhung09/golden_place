import { createBrowserRouter } from 'react-router-dom'
import App from './App'

// Layouts
import AdminLayout from './components/layout/AdminLayout'

// Guards
import PrivateRoute from './components/common/PrivateRoute'
import AdminRoute from './components/common/AdminRoute'

// Lazy Pages - Customer
import { lazy, Suspense } from 'react'
import LoadingSpinner from './components/common/LoadingSpinner'

const HomePage = lazy(() => import('./pages/customer/HomePage'))
const AboutPage = lazy(() => import('./pages/customer/AboutPage'))
const RoomsPage = lazy(() => import('./pages/customer/RoomsPage'))
const RoomDetailPage = lazy(() => import('./pages/customer/RoomDetailPage'))
const CheckoutPage = lazy(() => import('./pages/customer/CheckoutPage'))
const BookingsPage = lazy(() => import('./pages/customer/BookingsPage'))
const BookingDetailPage = lazy(() => import('./pages/customer/BookingDetailPage'))
const ProfilePage = lazy(() => import('./pages/customer/ProfilePage'))
const CartPage = lazy(() => import('./pages/customer/CartPage'))

// Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'))

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/DashboardPage'))
const AdminRoomsPage = lazy(() => import('./pages/admin/RoomsPage'))
const AdminRoomTypesPage = lazy(() => import('./pages/admin/RoomTypesPage'))
const AdminBookingsPage = lazy(() => import('./pages/admin/BookingsPage'))
const AdminCustomersPage = lazy(() => import('./pages/admin/CustomersPage'))
const AdminServicesPage = lazy(() => import('./pages/admin/ServicesPage'))
const AdminPromotionsPage = lazy(() => import('./pages/admin/PromotionsPage'))
const AdminReviewsPage = lazy(() => import('./pages/admin/ReviewsPage'))
const AdminReportsPage = lazy(() => import('./pages/admin/ReportsPage'))
const AdminUsersPage = lazy(() => import('./pages/admin/UsersPage'))
const AdminHistoryPage = lazy(() => import('./pages/admin/HistoryPage'))
const AdminInvoicesPage = lazy(() => import('./pages/admin/InvoicesPage'))
const AdminAccountPage = lazy(() => import('./pages/admin/AccountPage'))
const AdminPermissionsPage = lazy(() => import('./pages/admin/PermissionsPage'))

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingSpinner fullPage />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <SuspenseWrapper><HomePage /></SuspenseWrapper> },
      { path: 'about', element: <SuspenseWrapper><AboutPage /></SuspenseWrapper> },
      { path: 'rooms', element: <SuspenseWrapper><RoomsPage /></SuspenseWrapper> },
      { path: 'rooms/:roomId', element: <SuspenseWrapper><RoomDetailPage /></SuspenseWrapper> },
      { path: 'cart', element: <SuspenseWrapper><CartPage /></SuspenseWrapper> },
      
      // Auth Pages (no guard)
      { path: 'auth/login', element: <SuspenseWrapper><LoginPage /></SuspenseWrapper> },
      { path: 'auth/register', element: <SuspenseWrapper><RegisterPage /></SuspenseWrapper> },
      { path: 'auth/forgot-password', element: <SuspenseWrapper><ForgotPasswordPage /></SuspenseWrapper> },

      // Protected Customer Pages
      {
        element: <PrivateRoute />,
        children: [
          { path: 'checkout', element: <SuspenseWrapper><CheckoutPage /></SuspenseWrapper> },
          { path: 'bookings', element: <SuspenseWrapper><BookingsPage /></SuspenseWrapper> },
          { path: 'bookings/:bookingCode', element: <SuspenseWrapper><BookingDetailPage /></SuspenseWrapper> },
          { path: 'profile', element: <SuspenseWrapper><ProfilePage /></SuspenseWrapper> },
        ]
      }
    ]
  },
  { path: '/admin/login', element: <SuspenseWrapper><AdminLoginPage /></SuspenseWrapper> },
  // Admin area (separate layout, no Navbar/Footer)
  {
    path: '/admin',
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <SuspenseWrapper><AdminDashboard /></SuspenseWrapper> },
          { path: 'rooms', element: <SuspenseWrapper><AdminRoomsPage /></SuspenseWrapper> },
          { path: 'room-types', element: <SuspenseWrapper><AdminRoomTypesPage /></SuspenseWrapper> },
          { path: 'bookings', element: <SuspenseWrapper><AdminBookingsPage /></SuspenseWrapper> },
          { path: 'history', element: <SuspenseWrapper><AdminHistoryPage /></SuspenseWrapper> },
          { path: 'customers', element: <SuspenseWrapper><AdminCustomersPage /></SuspenseWrapper> },
          { path: 'services', element: <SuspenseWrapper><AdminServicesPage /></SuspenseWrapper> },
          { path: 'promotions', element: <SuspenseWrapper><AdminPromotionsPage /></SuspenseWrapper> },
          { path: 'reviews', element: <SuspenseWrapper><AdminReviewsPage /></SuspenseWrapper> },
          { path: 'reports', element: <SuspenseWrapper><AdminReportsPage /></SuspenseWrapper> },
          { path: 'invoices', element: <SuspenseWrapper><AdminInvoicesPage /></SuspenseWrapper> },
          { path: 'account', element: <SuspenseWrapper><AdminAccountPage /></SuspenseWrapper> },
          { path: 'permissions', element: <SuspenseWrapper><AdminPermissionsPage /></SuspenseWrapper> },
          { path: 'users', element: <SuspenseWrapper><AdminUsersPage /></SuspenseWrapper> },
        ]
      }
    ]
  }
])
