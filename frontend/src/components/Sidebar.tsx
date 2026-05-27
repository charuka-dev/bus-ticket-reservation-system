import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Search,
    Ticket,
    History,
    MapPin,
    User,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Bus,
    Wallet
} from 'lucide-react';
import clsx from 'clsx';
import { authService } from '../services/authService';

const menuItems = [
    { path: '/customer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/customer/search', label: 'Search Trips', icon: Search },
    { path: '/customer/bookings', label: 'My Bookings', icon: Ticket },
    { path: '/customer/payments', label: 'Payments', icon: History },
    { path: '/customer/track', label: 'Track Bus', icon: MapPin },
    { path: '/customer/wallet', label: 'Wallet', icon: Wallet },
    { path: '/customer/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await authService.logoutUser();
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            navigate('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <motion.div
            initial={{ width: 256 }}
            animate={{ width: isCollapsed ? 80 : 256 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 100 }}
            className="h-screen bg-white border-r border-gray-200 flex flex-col sticky top-0 z-20 shadow-sm"
        >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="min-w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Bus className="w-5 h-5 text-white" />
                    </div>
                    <AnimatePresence mode='wait'>
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="font-bold text-gray-900 text-lg whitespace-nowrap"
                            >
                                Customer Panel
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors hidden md:block"
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Menu */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/customer/dashboard'}
                    // className logic moved to children function or style handling below
                    >
                        {({ isActive }) => (
                            <div className="relative">
                                {isActive && (
                                    <motion.div
                                        layoutId="active-nav"
                                        className="absolute inset-0 bg-blue-50 rounded-xl border-l-4 border-blue-600"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <div
                                    className={clsx(
                                        "relative flex items-center px-3 py-3 rounded-xl transition-colors duration-200",
                                        isActive ? "text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <item.icon size={22} className={clsx("min-w-[22px]", isActive ? "text-blue-600" : "text-gray-400")} />

                                    {!isCollapsed && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="ml-3 whitespace-nowrap"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </div>
                            </div>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer / Logout */}
            <div className="p-3 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-3 text-red-600 rounded-xl hover:bg-red-50 transition-colors group"
                >
                    <LogOut size={22} className="min-w-[22px] group-hover:scale-110 transition-transform" />
                    {!isCollapsed && (
                        <span className="ml-3 font-medium whitespace-nowrap">Logout</span>
                    )}
                </button>
            </div>
        </motion.div>
    );
}
