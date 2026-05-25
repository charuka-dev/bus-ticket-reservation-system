import { motion } from 'framer-motion';
import { Calendar, MapPin, Bus, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { BookingDetails } from '../../types/booking';

interface TicketViewProps {
    booking: BookingDetails;
    onDownload: () => void;
}

export default function TicketView({ booking, onDownload }: TicketViewProps) {
    // Build a minimal fallback payload if qrCode isn't persisted yet
    const qrValue = booking.qrCode ?? JSON.stringify({
        bookingId: booking.bookingId,
        passenger: booking.customerName,
        seats:     booking.selectedSeats.map(s => s.seatNo).join(', '),
        busNo:     booking.busNo,
        route:     `${booking.route.from} → ${booking.route.to}`,
        date:      booking.date,
        time:      booking.time,
        totalPaid: `LKR ${booking.totalAmount}`,
    });

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden max-w-2xl mx-auto"
        >
            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white text-center">
                <h2 className="text-2xl font-bold mb-1">e-Ticket</h2>
                <p className="text-orange-100 text-sm">Booking ID: {booking.bookingId}</p>
            </div>

            <div className="p-8">
                {/* Passenger + QR row */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-gray-100 pb-8 gap-6">
                    <div className="text-center md:text-left">
                        <p className="text-sm text-gray-500 mb-1">Passenger</p>
                        <h3 className="text-xl font-bold text-gray-900">{booking.customerName}</h3>
                    </div>

                    {/* Real QR code */}
                    <div className="flex flex-col items-center gap-2 shrink-0">
                        <div className="p-3 bg-white border-2 border-gray-100 rounded-xl shadow-sm">
                            <QRCodeSVG
                                value={qrValue}
                                size={110}
                                bgColor="#ffffff"
                                fgColor="#1e293b"
                                level="M"
                            />
                        </div>
                        <p className="text-xs text-gray-400">Scan at boarding</p>
                    </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Route</p>
                        <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                            <span className="font-bold text-gray-900 text-sm">
                                {booking.route.from} → {booking.route.to}
                            </span>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Bus Number</p>
                        <div className="flex items-center space-x-2">
                            <Bus className="w-4 h-4 text-blue-500 shrink-0" />
                            <span className="font-bold text-gray-900">{booking.busNo}</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Travel Date</p>
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-purple-500 shrink-0" />
                            <span className="font-bold text-gray-900">{booking.date}</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Departure</p>
                        <span className="font-bold text-gray-900">{booking.time}</span>
                    </div>
                    <div className="col-span-2">
                        <p className="text-sm text-gray-500 mb-2">Seats</p>
                        <div className="flex flex-wrap gap-2">
                            {booking.selectedSeats.map(seat => (
                                <span
                                    key={seat.id}
                                    className="px-2 py-1 bg-orange-100 text-orange-700 rounded-md text-sm font-bold"
                                >
                                    {seat.seatNo}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Total */}
                <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center mb-6">
                    <span className="text-gray-600 font-medium">Total Paid</span>
                    <span className="text-2xl font-bold text-green-600">
                        LKR {booking.totalAmount.toLocaleString()}
                    </span>
                </div>

                <button
                    onClick={onDownload}
                    className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center space-x-2"
                >
                    <Download className="w-5 h-5" />
                    <span>Download Ticket</span>
                </button>
            </div>

            {/* Perforated edge decoration */}
            <div className="relative h-4 bg-gray-100 -mt-2">
                <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-gray-100" />
                <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-gray-100" />
            </div>
        </motion.div>
    );
}
