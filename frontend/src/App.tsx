import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Customer Routes */}
        <Route path="/customer" element={<CustomerLayout />}>
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="search" element={<SearchTrips />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="payments" element={<PaymentsHistory />} />
          <Route path="track" element={<TrackBus />} />
          <Route path="wallet" element={<WalletPage />} />
          <Route path="profile" element={<ProfileSettings />} />
          <Route path="book/:tripId" element={<BookingPage />} />
          <Route path="ticket/:bookingId" element={<TicketPage />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
        <Route path="/conductor/dashboard" element={<div>Conductor Dashboard (Placeholder)</div>} />
        <Route path="/owner/dashboard" element={<div>Owner Dashboard (Placeholder)</div>} />

        {/* Redirect root to login for now */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
