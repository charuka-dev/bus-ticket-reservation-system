import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users, Bus, CheckSquare, Settings, LogOut, ChevronLeft, ChevronRight, ShieldCheck
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { useAuthContext } from '../../contexts/AuthContext';

const menu = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users',     label: 'Manage Users', icon: Users },
    { path: '/admin/trips',     label: 'Manage Trips', icon: Bus },
    { path: '/admin/approve',   label: 'Approve Owners', icon: CheckSquare },
    { path: '/admin/settings',  label: 'Settings', icon: Settings },
];

export default function AdminSidebarNav() {
    const [collapsed, setCollapsed] = useState(false);
    const { logout } = useAuthContext();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <motion.div
            initial={{ width: 260 }}
            animate={{ width: collapsed ? 72 : 260 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 120 }}
            className="h-screen bg-slate-900 flex flex-col sticky top-0 z-20 shadow-xl overflow-hidden"
        >
            {/* Brand */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="min-w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                        <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <AnimatePresence mode="wait">
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="font-bold text-white text-base whitespace-nowrap"
                            >
                                Admin Panel
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors hidden md:flex"
                >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            {/* Menu */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {menu.map((item) => (
                    <NavLink key={item.path} to={item.path} end={item.path === '/admin/dashboard'}>
                        {({ isActive }) => (
                            <div className={clsx(
                                'flex items-center px-3 py-3 rounded-xl transition-all duration-200 group',
                                isActive
                                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                    : 'text-white/60 hover:bg-white/8 hover:text-white'
                            )}>
                                <item.icon size={20} className="min-w-[20px]" />
                                <AnimatePresence mode="wait">
                                    {!collapsed && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="ml-3 text-sm font-medium whitespace-nowrap"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-white/10">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-3 text-red-400 rounded-xl hover:bg-red-500/10 transition-colors"
                >
                    <LogOut size={20} className="min-w-[20px]" />
                    <AnimatePresence mode="wait">
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="ml-3 text-sm font-medium whitespace-nowrap"
                            >
                                Logout
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </motion.div>
    );
}
