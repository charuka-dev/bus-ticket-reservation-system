import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Search } from 'lucide-react';

interface TripSearchFormProps {
    onSearch: (searchParams: { from: string; to: string; date: string }) => void;
}

export default function TripSearchForm({ onSearch }: TripSearchFormProps) {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [date, setDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (from && to && date) {
            onSearch({ from, to, date });
        }
    };

    const locations = ['Colombo', 'Kandy', 'Galle', 'Jaffna', 'Matara', 'Trincomalee'];

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
        >
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all appearance-none"
                            required
                        >
                            <option value="">Select Origin</option>
                            {locations.map(loc => (
                                <option key={loc} value={loc} disabled={loc === to}>{loc}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all appearance-none"
                            required
                        >
                            <option value="">Select Destination</option>
                            {locations.map(loc => (
                                <option key={loc} value={loc} disabled={loc === from}>{loc}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                            required
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                </div>

                <div className="md:col-span-1">
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center space-x-2"
                    >
                        <Search className="w-5 h-5" />
                        <span>Search Buses</span>
                    </button>
                </div>
            </form>
        </motion.div>
    );
}
