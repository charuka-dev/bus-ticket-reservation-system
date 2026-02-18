import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SeatGrid from '../../components/booking/SeatGrid';
import PaymentForm from '../../components/booking/PaymentForm';
import type { Seat, PaymentDetails } from '../../types/booking';

// Mock Seats Data
const generateSeats = (total: number): Seat[] => {
    return Array.from({ length: total }, (_, i) => ({
        id: `seat-${i + 1}`,
        seatNo: `${i + 1}`,
        status: Math.random() > 0.7 ? 'booked' : 'available',
        price: 1500
    }));
};

export default function BookingPage() {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState<'seats' | 'payment'>('seats');
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [seats] = useState<Seat[]>(generateSeats(40));

    const toggleSeat = (seatId: string) => {
        setSelectedSeats(prev =>
            prev.includes(seatId)
                ? prev.filter(id => id !== seatId)
                : [...prev, seatId]
        );
    };

    const totalAmount = selectedSeats.length * 1500;

    const handlePaymentSubmit = (details: PaymentDetails) => {
        // Simulate payment processing
        console.log('Processing payment:', details);
        setTimeout(() => {
            navigate(`/customer/ticket/${Math.floor(Math.random() * 10000)}`);
        }, 1500);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-900 mb-4 transition-colors">
                    ← Back
                </button>
                <h1 className="text-3xl font-bold text-gray-900">
                    {step === 'seats' ? 'Select Your Seats' : 'Payment Details'}
                </h1>
                <p className="text-gray-500">
                    {step === 'seats' ? 'Choose your preferred seats for the journey.' : 'Complete your booking securely.'}
                </p>
            </div>

            <AnimatePresence mode="wait">
                {step === 'seats' && (
                    <motion.div
                        key="seats"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col md:flex-row gap-8"
                    >
                        <div className="flex-1">
                            <SeatGrid
                                seats={seats}
                                selectedSeats={selectedSeats}
                                onToggleSeat={toggleSeat}
                            />
                        </div>
                        <div className="md:w-80">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Booking Summary</h3>
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Trip ID</span>
                                        <span className="font-medium">{tripId}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Selected Seats</span>
                                        <span className="font-medium">{selectedSeats.length > 0 ? selectedSeats.length : '-'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Price per seat</span>
                                        <span className="font-medium">LKR 1,500</span>
                                    </div>
                                    <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                                        <span className="font-bold text-gray-900">Total</span>
                                        <span className="text-xl font-bold text-orange-600">LKR {totalAmount.toLocaleString()}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setStep('payment')}
                                    disabled={selectedSeats.length === 0}
                                    className={`w-full py-3 rounded-xl font-bold transition-all ${selectedSeats.length > 0
                                        ? 'bg-gray-900 text-white hover:bg-black shadow-lg hover:shadow-xl'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    Continue to Payment
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 'payment' && (
                    <motion.div
                        key="payment"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="max-w-2xl mx-auto"
                    >
                        <PaymentForm
                            amount={totalAmount}
                            onSubmit={handlePaymentSubmit}
                            onBack={() => setStep('seats')}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
