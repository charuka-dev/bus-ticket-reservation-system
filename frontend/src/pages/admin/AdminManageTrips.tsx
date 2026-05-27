import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { motion } from 'framer-motion';
import { Bus, Search, MapPin, Clock } from 'lucide-react';

export default function AdminManageTrips() {
    const [trips, setTrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        getDocs(collection(db, 'trips'))
            .then(snap => setTrips(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = trips.filter(t =>
        t.id?.toLowerCase().includes(search.toLowerCase()) ||
        t.from?.toLowerCase().includes(search.toLowerCase()) ||
        t.to?.toLowerCase().includes(search.toLowerCase()) ||
        t.busId?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white mb-1">Manage Trips</h2>
                <p className="text-white/50 text-sm">{trips.length} trips in the system</p>
            </div>

            <div className="relative max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by route, bus or trip ID..."
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-500/50"
                />
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900 overflow-hidden">
                {loading ? (
                    <div className="py-20 text-center text-white/40">Loading trips...</div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 text-center text-white/40">
                        <Bus size={32} className="mx-auto mb-3 opacity-30" />
                        No trips found
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    {['Trip ID', 'Route', 'Date', 'Departure', 'Bus', 'Seats', 'Price', 'Status'].map(h => (
                                        <th key={h} className="text-left px-5 py-4 text-white/50 text-xs font-semibold uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filtered.map((trip, i) => (
                                    <motion.tr
                                        key={trip.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="hover:bg-white/3 transition-colors"
                                    >
                                        <td className="px-5 py-4 text-purple-400 text-xs font-mono">{trip.id}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5 text-sm text-white font-medium">
                                                <MapPin size={13} className="text-orange-400 shrink-0" />
                                                {trip.from || '?'} → {trip.to || '?'}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-white/60 text-sm">{trip.date || '—'}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5 text-sm text-white/60">
                                                <Clock size={13} className="text-blue-400" />
                                                {trip.departureTime || '—'}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-white/60 text-sm font-mono">{trip.busId || '—'}</td>
                                        <td className="px-5 py-4 text-white/60 text-sm">{trip.totalSeats || trip.capacity || '—'}</td>
                                        <td className="px-5 py-4 text-green-400 text-sm font-semibold">
                                            {trip.price ? `Rs. ${trip.price}` : '—'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                trip.status === 'ACTIVE'
                                                    ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                                                    : 'bg-white/10 text-white/50'
                                            }`}>
                                                {trip.status || 'N/A'}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
