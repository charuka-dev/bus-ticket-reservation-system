import { motion } from 'framer-motion';
import { CreditCard, Calendar, BarChart3 } from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import UpcomingTripCard from '../../components/dashboard/UpcomingTripCard';
import NotificationCard from '../../components/dashboard/NotificationCard';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function DashboardHome() {
    // Mock Data
    const stats = [
        { title: 'Total Bookings', value: 12, icon: Calendar, color: 'blue', delay: 0 },
        { title: 'Last Payment', value: 'LKR 2,500', icon: CreditCard, color: 'green', delay: 0.1 },
        { title: 'Reward Points', value: 450, icon: BarChart3, color: 'orange', delay: 0.2 },
    ];

    const upcomingTrip = {
        id: 'booking-123',
        route: 'Colombo → Kandy',
        date: '2026-02-25',
        time: '08:30 AM',
        seatNo: 'A3',
        busNo: 'NB-4587'
    };

    const notifications = [
        { id: 1, message: 'Your trip to Kandy starts in 2 hours.', type: 'info' as const },
        { id: 2, message: 'Free cancellation allowed until 10:30 AM.', type: 'warning' as const },
    ];

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Header */}
            <motion.div variants={itemVariants}>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500">Welcome back! Here's your travel summary.</p>
            </motion.div>

            {/* Top Row: Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <StatCard
                        key={index}
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                        color={stat.color}
                        delay={stat.delay}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Upcoming Trip */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div variants={itemVariants}>
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Next Trip</h2>
                        <UpcomingTripCard trip={upcomingTrip} />
                    </motion.div>
                </div>

                {/* Right Sidebar: Notifications */}
                <div className="space-y-6">
                    <motion.div variants={itemVariants}>
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Notifications</h2>
                        <div className="space-y-3">
                            {notifications.map((notification, index) => (
                                <NotificationCard
                                    key={notification.id}
                                    message={notification.message}
                                    type={notification.type}
                                    delay={0.4 + (index * 0.1)}
                                />
                            ))}
                        </div>
                    </motion.div>

                    {/* Quick Actions (Future Expansion) */}
                    <motion.div variants={itemVariants} className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                        <h3 className="text-lg font-bold mb-2">Need Help?</h3>
                        <p className="text-indigo-100 text-sm mb-4">Contact our support team for assistance with your bookings.</p>
                        <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition backdrop-blur-sm">
                            Contact Support
                        </button>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
