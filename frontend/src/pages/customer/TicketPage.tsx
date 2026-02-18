import { useParams, useNavigate } from 'react-router-dom';
import TicketView from '../../components/booking/TicketView';
import type { BookingDetails } from '../../types/booking';

export default function TicketPage() {
    const { bookingId } = useParams();
    const navigate = useNavigate();

    // Mock Booking Data
    const mockBooking: BookingDetails = {
        bookingId: bookingId,
        tripId: 'trip-1',
        customerName: 'John Doe',
        selectedSeats: [{ id: 's1', seatNo: '3', status: 'booked', price: 1500 }, { id: 's2', seatNo: '4', status: 'booked', price: 1500 }],
        totalAmount: 3000,
        email: 'john@example.com',
        phoneNumber: '0771234567',
        paymentStatus: 'completed'
    };

    const handleDownload = () => {
        alert('Downloading ticket... (Feature to be implemented)');
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
                <p className="text-gray-500">Your ticket has been sent to your email.</p>
            </div>

            <TicketView booking={mockBooking} onDownload={handleDownload} />

            <div className="mt-8 text-center">
                <button
                    onClick={() => navigate('/customer/dashboard')}
                    className="text-orange-600 font-bold hover:text-orange-700 transition-colors"
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
    );
}
