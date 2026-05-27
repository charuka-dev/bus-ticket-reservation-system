import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Search } from 'lucide-react';

interface Owner {
    id: string;
    name: string;
    email: string;
    companyName: string;
    phone: string;
    approved: string | boolean;
    createdAt: string;
}

const StatusBadge = ({ status }: { status: string | boolean }) => {
    const s = String(status).toLowerCase();
    if (s === 'approved' || s === 'true') return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/15 text-green-400 border border-green-500/25">
            <CheckCircle size={12} /> Approved
        </span>
    );
    if (s === 'rejected') return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/25">
            <XCircle size={12} /> Rejected
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/15 text-yellow-400 border border-yellow-500/25">
            <Clock size={12} /> Pending
        </span>
    );
};

export default function AdminApproveOwners() {
    const [owners, setOwners] = useState<Owner[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [updating, setUpdating] = useState<string | null>(null);

    const fetchOwners = async () => {
        try {
            const snap = await getDocs(collection(db, 'owners'));
            setOwners(snap.docs.map(d => ({ id: d.id, ...d.data() } as Owner)));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOwners(); }, []);

    const updateStatus = async (ownerId: string, status: 'approved' | 'rejected') => {
        setUpdating(ownerId);
        try {
            await updateDoc(doc(db, 'owners', ownerId), { approved: status });
            setOwners(prev => prev.map(o => o.id === ownerId ? { ...o, approved: status } : o));
        } catch (e) {
            console.error(e);
        } finally {
            setUpdating(null);
        }
    };

    const filtered = owners.filter(o =>
        o.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.email?.toLowerCase().includes(search.toLowerCase()) ||
        o.companyName?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white mb-1">Approve Owners</h2>
                <p className="text-white/50 text-sm">Review and approve or reject owner registrations</p>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name, email or company..."
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-500/50"
                />
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-white/10 bg-slate-900 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-white/40">Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="flex items-center justify-center py-20 text-white/40">No owners found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/3">
                                    <th className="text-left px-6 py-4 text-white/50 text-xs font-semibold uppercase tracking-wider">Owner</th>
                                    <th className="text-left px-6 py-4 text-white/50 text-xs font-semibold uppercase tracking-wider">Company</th>
                                    <th className="text-left px-6 py-4 text-white/50 text-xs font-semibold uppercase tracking-wider">Phone</th>
                                    <th className="text-left px-6 py-4 text-white/50 text-xs font-semibold uppercase tracking-wider">Status</th>
                                    <th className="text-left px-6 py-4 text-white/50 text-xs font-semibold uppercase tracking-wider">Registered</th>
                                    <th className="text-left px-6 py-4 text-white/50 text-xs font-semibold uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filtered.map((owner, i) => (
                                    <motion.tr
                                        key={owner.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.04 }}
                                        className="hover:bg-white/3 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white text-sm">{owner.name}</div>
                                            <div className="text-white/40 text-xs">{owner.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-white/70 text-sm">{owner.companyName || '—'}</td>
                                        <td className="px-6 py-4 text-white/70 text-sm">{owner.phone || '—'}</td>
                                        <td className="px-6 py-4"><StatusBadge status={owner.approved} /></td>
                                        <td className="px-6 py-4 text-white/50 text-xs">
                                            {owner.createdAt ? new Date(owner.createdAt).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    disabled={updating === owner.id}
                                                    onClick={() => updateStatus(owner.id, 'approved')}
                                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-500/15 text-green-400 hover:bg-green-500/25 border border-green-500/20 transition-all disabled:opacity-50"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    disabled={updating === owner.id}
                                                    onClick={() => updateStatus(owner.id, 'rejected')}
                                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/20 transition-all disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                            </div>
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
