import { useEffect, useState } from 'react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '../../firebase';
import { motion } from 'framer-motion';
import { Users, Bus, Ticket, TrendingUp } from 'lucide-react';

interface StatCard {
    label: string;
    value: number | string;
    icon: React.ElementType;
    color: string;
    bg: string;
}

export default function AdminDashboardHome() {
    const [stats, setStats] = useState({ customers: 0, owners: 0, conductors: 0, trips: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [c, o, co, t] = await Promise.all([
                    getCountFromServer(collection(db, 'customers')),
                    getCountFromServer(collection(db, 'owners')),
                    getCountFromServer(collection(db, 'conductors')),
                    getCountFromServer(collection(db, 'trips')),
                ]);
                setStats({
                    customers: c.data().count,
                    owners: o.data().count,
                    conductors: co.data().count,
                    trips: t.data().count,
                });
            } catch (e) {
                console.error('Stats fetch error:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const cards: StatCard[] = [
        { label: 'Total Customers', value: stats.customers, icon: Users,       color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
        { label: 'Bus Owners',      value: stats.owners,    icon: TrendingUp,   color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
        { label: 'Conductors',      value: stats.conductors, icon: Users,       color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20' },
        { label: 'Active Trips',    value: stats.trips,     icon: Bus,          color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-1">Overview</h2>
                <p className="text-white/50 text-sm">System-wide statistics at a glance</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {cards.map((card, i) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`rounded-2xl border p-6 ${card.bg}`}
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${card.bg}`}>
                            <card.icon size={20} className={card.color} />
                        </div>
                        <p className="text-white/60 text-sm font-medium mb-1">{card.label}</p>
                        <p className={`text-3xl font-bold ${card.color}`}>
                            {loading ? '—' : card.value.toLocaleString()}
                        </p>
                    </motion.div>
                ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
                <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'Approve Owners', href: '/admin/approve' },
                        { label: 'View Users',     href: '/admin/users' },
                        { label: 'Manage Trips',   href: '/admin/trips' },
                        { label: 'Settings',       href: '/admin/settings' },
                    ].map((action) => (
                        <a
                            key={action.label}
                            href={action.href}
                            className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white text-sm font-medium transition-all text-center"
                        >
                            {action.label}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
