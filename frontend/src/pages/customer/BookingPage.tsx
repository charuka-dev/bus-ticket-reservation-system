import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowLeft, CreditCard, CheckCircle } from 'lucide-react';
import { bookingService, type CreateBookingInput } from '../../services/bookingService';
import { paymentService, type PaymentMethod } from '../../services/paymentService';
import { authService } from '../../services/authService';
import { useToast } from '../../contexts/ToastContext';
import type { TripWithSeats, Seat } from '../../types/firebase';

// ─── Seat Button ──────────────────────────────────────────────────────────────

function SeatButton({ seat, isSelected, onToggle }: {
    seat: Seat;
    isSelected: boolean;
    onToggle: (seatNo: string) => void;
}) {
    const base = 'w-10 h-10 rounded-lg text-xs font-bold transition-all duration-150 flex items-center justify-center border-2';

    if (seat.status === 'booked') {
        return (
            <div className={`${base} bg-red-100 border-red-300 text-red-400 cursor-not-allowed`}>
                {seat.seatNo}
            </div>
        );
    }
    if (isSelected) {
        return (
            <button
                onClick={() => onToggle(seat.seatNo)}
                className={`${base} bg-orange-500 border-orange-600 text-white shadow-lg scale-105`}
            >
                {seat.seatNo}
            </button>
        );
    }
    return (
        <button
            onClick={() => onToggle(seat.seatNo)}
            className={`${base} bg-green-50 border-green-300 text-green-700 hover:bg-green-500 hover:text-white hover:border-green-600`}
        >
            {seat.seatNo}
        </button>
    );
}

// ─── Payment Form ─────────────────────────────────────────────────────────────

function PaymentForm({ amount, onSubmit, onBack, loading }: {
    amount: number;
    onSubmit: (method: PaymentMethod) => void;
    onBack: () => void;
    loading: boolean;
}) {
    const [method, setMethod] = useState<PaymentMethod>('CREDIT_CARD');

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-lg mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-500" />
                Payment Details
            </h2>

            <div className="space-y-4 mb-8">
                <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-3xl font-bold text-orange-600">LKR {amount.toLocaleString()}</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                    <div className="grid grid-cols-2 gap-3">
                        {(['CREDIT_CARD', 'DEBIT_CARD', 'WALLET', 'CASH'] as PaymentMethod[]).map(m => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => setMethod(m)}
                                className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                                    method === m
                                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                }`}
                            >
                                {m.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Simulated card fields — visual only */}
                {(method === 'CREDIT_CARD' || method === 'DEBIT_CARD') && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-3"
                    >
                        <input
                            type="text"
                            placeholder="Card Number (demo only)"
                            maxLength={19}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-orange-300"
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                placeholder="MM/YY"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-orange-300"
                            />
                            <input
                                type="text"
                                placeholder="CVV"
                                maxLength={4}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-orange-300"
                            />
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onBack}
                    disabled={loading}
                    className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:border-gray-300 transition disabled:opacity-50"
                >
                    Back
                </button>
                <button
                    onClick={() => onSubmit(method)}
                    disabled={loading}
                    className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-200 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                    {loading ? 'Processing...' : 'Confirm & Pay'}
                </button>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BookingPage() {
    const { tripId } = useParams<{ tripId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { success, error: showError } = useToast();

    // searchDate is passed from SearchTrips via router state
    const searchDate: string = (location.state as any)?.searchDate ?? '';

    const [trip, setTrip] = useState<TripWithSeats | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState<'seats' | 'payment'>('seats');
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

    // Load trip data — use dynamic seat grid for the requested travel date
    useEffect(() => {
        if (!tripId) return;
        if (!searchDate) {
            showError('No travel date provided. Please search again.');
            navigate('/customer/search');
            return;
        }
        setLoading(true);
        bookingService.getTripWithSeatsForDate(tripId, searchDate)
            .then(data => {
                if (!data) { showError('Trip not found.'); navigate(-1); return; }
                setTrip(data);
            })
            .catch(() => showError('Failed to load trip data.'))
            .finally(() => setLoading(false));
    }, [tripId, searchDate]);

    const toggleSeat = (seatNo: string) => {
        setSelectedSeats(prev =>
            prev.includes(seatNo) ? prev.filter(s => s !== seatNo) : [...prev, seatNo]
        );
    };

    const totalAmount = selectedSeats.length * (trip?.price ?? 0);

    const handlePayment = async (method: PaymentMethod) => {
        if (!trip || !tripId || selectedSeats.length === 0) return;
        setSubmitting(true);

        try {
            const customer = await authService.getCurrentCustomerProfile();
            if (!customer) throw new Error('You must be logged in to book.');

            const input: CreateBookingInput = {
                customerId: customer.uid,
                customerName: customer.name,
                tripId,
                date: searchDate,
                seatNumbers: selectedSeats,
                totalAmount,
            };

            // 1. Create booking document (date-scoped, no static seat mutation)
            const bookingId = await bookingService.createBooking(input);

            // 2. Record payment
            await paymentService.createPayment(bookingId, customer.uid, totalAmount, method);

            success('Booking confirmed! Redirecting to your ticket...');
            setTimeout(() => navigate(`/customer/ticket/${bookingId}`), 1200);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Booking failed. Please try again.';
            showError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!trip) return null;

    // Arrange seats in rows of 4 (2+aisle+2 layout)
    const rows: Seat[][] = [];
    for (let i = 0; i < trip.seats.length; i += 4) {
        rows.push(trip.seats.slice(i, i + 4));
    }

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => step === 'payment' ? setStep('seats') : navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {step === 'payment' ? 'Back to Seats' : 'Back to Search'}
                </button>

                <h1 className="text-2xl font-bold text-gray-900">
                    {step === 'seats' ? 'Select Your Seats' : 'Confirm Payment'}
                </h1>
                <p className="text-gray-500">
                    {trip.from} → {trip.to} &nbsp;·&nbsp; {trip.busNumber} &nbsp;·&nbsp;{' '}
                    {searchDate ? new Date(searchDate + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric'
                    }) : 'Date unknown'}
                </p>
            </div>

            {/* Steps */}
            <AnimatePresence mode="wait">
                {step === 'seats' && (
                    <motion.div
                        key="seats"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col lg:flex-row gap-8"
                    >
                        {/* Seat Grid */}
                        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            {/* Legend */}
                            <div className="flex items-center gap-6 mb-6 text-sm">
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded bg-green-100 border-2 border-green-300 inline-block" />
                                    Available
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded bg-red-100 border-2 border-red-300 inline-block" />
                                    Booked
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded bg-orange-500 border-2 border-orange-600 inline-block" />
                                    Selected
                                </span>
                            </div>

                            {/* Bus front indicator */}
                            <div className="flex items-center justify-center mb-6">
                                <div className="px-6 py-2 bg-gray-800 text-white text-xs font-bold rounded-full tracking-widest">
                                    FRONT — DRIVER
                                </div>
                            </div>

                            {/* Seat rows: 2 | aisle | 2 */}
                            <div className="space-y-2">
                                {rows.map((row, ri) => (
                                    <div key={ri} className="flex items-center justify-center gap-2">
                                        {row.slice(0, 2).map(seat => (
                                            <SeatButton
                                                key={seat.seatNo}
                                                seat={seat}
                                                isSelected={selectedSeats.includes(seat.seatNo)}
                                                onToggle={toggleSeat}
                                            />
                                        ))}
                                        <div className="w-6" /> {/* aisle */}
                                        {row.slice(2).map(seat => (
                                            <SeatButton
                                                key={seat.seatNo}
                                                seat={seat}
                                                isSelected={selectedSeats.includes(seat.seatNo)}
                                                onToggle={toggleSeat}
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Booking Summary */}
                        <div className="lg:w-80">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8 space-y-4">
                                <h3 className="text-lg font-bold text-gray-900">Booking Summary</h3>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Route</span>
                                        <span className="font-medium">{trip.from} → {trip.to}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Bus</span>
                                        <span className="font-medium">{trip.busNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Departure</span>
                                        <span className="font-medium">
                                            {new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Price/seat</span>
                                        <span className="font-medium">LKR {trip.price.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Selected</span>
                                        <span className="font-medium">
                                            {selectedSeats.length > 0 ? selectedSeats.join(', ') : '—'}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                                    <span className="font-bold text-gray-900">Total</span>
                                    <span className="text-xl font-bold text-orange-600">
                                        LKR {totalAmount.toLocaleString()}
                                    </span>
                                </div>

                                <button
                                    onClick={() => setStep('payment')}
                                    disabled={selectedSeats.length === 0}
                                    className={`w-full py-3 rounded-xl font-bold transition-all ${
                                        selectedSeats.length > 0
                                            ? 'bg-gray-900 text-white hover:bg-black shadow-lg'
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
                    >
                        <PaymentForm
                            amount={totalAmount}
                            onSubmit={handlePayment}
                            onBack={() => setStep('seats')}
                            loading={submitting}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
