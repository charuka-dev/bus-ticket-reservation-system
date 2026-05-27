import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { motion } from 'framer-motion';
import { Search, Users } from 'lucide-react';

type UserRole = 'customers' | 'conductors' | 'owners';

const tabConfig: { key: UserRole; label: string; color: string }[] = [
    { key: 'customers',  label: 'Customers',  color: 'text-blue-400 border-blue-400' },
    { key: 'owners',     label: 'Owners',     color: 'text-orange-400 border-orange-400' },
    { key: 'conductors', label: 'Conductors', color: 'text-green-400 border-green-400' },
];

export default function AdminManageUsers() {
    const [tab, setTab] = useState<UserRole>('customers');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        setLoading(true);
        getDocs(collection(db, tab))
            .then(snap => setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [tab]);

    const filtered = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white mb-1">Manage Users</h2>
                <p className="text-white/50 text-sm">View all registered users across roles</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-slate-800 rounded-xl w-fit">
                {tabConfig.map(t => (
                    <button
                        key={t.key}
                        onClick={() => { setTab(t.key); setSearch(''); }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            tab === t.key
                                ? 'bg-slate-700 text-white shadow'
                                : 'text-white/50 hover:text-white'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-blue-500/50"
                />
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-white/10 bg-slate-900 overflow-hidden">
                {loading ? (
                    <div className="py-20 text-center text-white/40">Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 text-center text-white/40">
                        <Users size={32} className="mx-auto mb-3 opacity-30" />
                        No {tab} found
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left px-6 py-4 text-white/50 text-xs font-semibold uppercase tracking-wider">Name</th>
                                    <th className="text-left px-6 py-4 text-white/50 text-xs font-semibold uppercase tracking-wider">Email</th>
                                    <th className="text-left px-6 py-4 text-white/50 text-xs font-semibold uppercase tracking-wider">Phone</th>
                                    {tab === 'customers' && <th className="text-left px-6 py-4 text-white/50 text-xs font-semibold uppercase tracking-wider">NIC</th>}
                                    {tab === 'owners' && <th className="text-left px-6 py-4 text-white/50 text-xs font-semibold uppercase tracking-wider">Company</th>}
                                    {tab === 'conductors' && <th className="text-left px-6 py-4 text-white/50 text-xs font-semibold uppercase tracking-wider">Bus ID</th>}
                                    <th className="text-left px-6 py-4 text-white/50 text-xs font-semibold uppercase tracking-wider">ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filtered.map((user, i) => (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="hover:bg-white/3 transition-colors"
                                    >
                                        <td className="px-6 py-4 text-white text-sm font-medium">{user.name || '—'}</td>
                                        <td className="px-6 py-4 text-white/60 text-sm">{user.email || '—'}</td>
                                        <td className="px-6 py-4 text-white/60 text-sm">{user.phone || '—'}</td>
                                        {tab === 'customers' && <td className="px-6 py-4 text-white/60 text-sm">{user.nic || '—'}</td>}
                                        {tab === 'owners' && <td className="px-6 py-4 text-white/60 text-sm">{user.companyName || '—'}</td>}
                                        {tab === 'conductors' && <td className="px-6 py-4 text-white/60 text-sm">{user.busId || '—'}</td>}
                                        <td className="px-6 py-4 text-white/40 text-xs font-mono">{user.id}</td>
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
