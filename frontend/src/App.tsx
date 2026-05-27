import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Shared pages
import Login from './pages/Login';
import Register from './pages/Register';

// Customer module
import CustomerLayout from './layouts/CustomerLayout';
import DashboardHome from './pages/customer/DashboardHome';
import SearchTrips from './pages/customer/SearchTrips';
import MyBookings from './pages/customer/MyBookings';
import PaymentsHistory from './pages/customer/PaymentsHistory';
import TrackBus from './pages/customer/TrackBus';
import ProfileSettings from './pages/customer/ProfileSettings';
import BookingPage from './pages/customer/BookingPage';
import TicketPage from './pages/customer/TicketPage';
import WalletPage from './pages/customer/WalletPage';

// Conductor module (self-contained)
import ConductorApp from './conductor/App';

// Owner module
import OwnerDashboard from './pages/owner/OwnerDashboard';

// Admin module — uses the existing working admin dashboard
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Customer Routes — protected */}
          <Route
            path="/customer"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CustomerLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard"            element={<DashboardHome />} />
            <Route path="search"               element={<SearchTrips />} />
            <Route path="bookings"             element={<MyBookings />} />
            <Route path="payments"             element={<PaymentsHistory />} />
            <Route path="track"                element={<TrackBus />} />
            <Route path="wallet"               element={<WalletPage />} />
            <Route path="profile"              element={<ProfileSettings />} />
            <Route path="book/:tripId"         element={<BookingPage />} />
            <Route path="ticket/:bookingId"    element={<TicketPage />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Conductor Routes — protected */}
          <Route
            path="/conductor/*"
            element={
              <ProtectedRoute allowedRoles={['CONDUCTOR']}>
                <ConductorApp />
              </ProtectedRoute>
            }
          />

          {/* Owner Routes — protected */}
          <Route
            path="/owner/*"
            element={
              <ProtectedRoute allowedRoles={['OWNER']}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes — protected, state-based navigation inside AdminDashboard */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
