import { motion } from 'framer-motion';
import { Armchair } from 'lucide-react';
import type { Seat } from '../../types/booking';

interface SeatGridProps {
    seats: Seat[];
    selectedSeats: string[];
    onToggleSeat: (seatId: string) => void;
}

export default function SeatGrid({ seats, selectedSeats, onToggleSeat }: SeatGridProps) {
    const getSeatColor = (seat: Seat) => {
        if (seat.status === 'booked') return 'text-red-300 cursor-not-allowed bg-red-50';
        if (selectedSeats.includes(seat.id)) return 'text-blue-600 bg-blue-100 ring-2 ring-blue-500';
        return 'text-green-500 hover:text-green-600 bg-green-50 hover:bg-green-100 cursor-pointer';
    };

    return (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 w-full max-w-sm mx-auto">
            <div className="mb-8 text-center">
                <div className="w-full h-12 bg-gray-100 rounded-lg mb-2 flex items-center justify-center text-gray-400 text-sm font-medium border-2 border-gray-200 border-dashed">
                    Driver's Area
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {seats.map((seat, index) => (
                    <motion.button
                        key={seat.id}
                        whileTap={seat.status !== 'booked' ? { scale: 0.9 } : {}}
                        onClick={() => seat.status !== 'booked' && onToggleSeat(seat.id)}
                        disabled={seat.status === 'booked'}
                        className={`p-2 rounded-lg flex flex-col items-center justify-center transition-all ${getSeatColor(seat)} ${index % 4 === 1 ? 'mr-8' : ''}`}
                        title={`Seat ${seat.seatNo} - ${seat.status}`}
                    >
                        <Armchair className="w-8 h-8" />
                        <span className="text-xs font-bold mt-1">{seat.seatNo}</span>
                    </motion.button>
                ))}
            </div>

            <div className="mt-8 flex justify-center space-x-6">
                <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-50 rounded border border-green-200"></div>
                    <span className="text-xs text-gray-500">Available</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-50 rounded border border-red-200"></div>
                    <span className="text-xs text-gray-500">Booked</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-100 rounded border border-blue-500"></div>
                    <span className="text-xs text-gray-500">Selected</span>
                </div>
            </div>
        </div>
    );
}
