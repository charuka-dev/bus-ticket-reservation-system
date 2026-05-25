import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { bookingService } from '../../services/bookingService';
import type { Booking } from '../../types/firebase';
import { CreditCard, Calendar, BarChart3 } from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import UpcomingTripCard from '../../components/dashboard/UpcomingTripCard';
import NotificationCard from '../../components/dashboard/NotificationCard';

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
    const [userName, setUserName] = useState<string>('Customer');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log("DashboardHome: Fetching current customer profile...");
                const user = await authService.getCurrentCustomerProfile();
                console.log("DashboardHome: Current customer profile result:", user);
                if (user) {
                    setUserName(user.name);
                    console.log(`DashboardHome: Fetching bookings for customerId (user.uid): "${user.uid}"`);
                    const myBookings = await bookingService.getMyBookings(user.uid);
                    console.log(`DashboardHome: Fetched ${myBookings.length} bookings.`);
                    setBookings(myBookings);
                } else {
                    console.warn("DashboardHome: No authenticated customer profile found!");
                }
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Derived statistics
    const upcomingTripsList = bookings.filter(b => b.status === 'CONFIRMED');
    const totalBookings = bookings.length;
    const rewardPoints = totalBookings * 10;
    
    // Find the latest payment amount by checking recent bookings (mocking 'last payment' stat)
    const latestBooking = bookings.length > 0 ? bookings[0] : null;
    const lastPaymentVal = latestBooking ? `LKR ${latestBooking.totalAmount}` : 'LKR 0';

    const stats = [
        { title: 'Total Bookings', value: totalBookings, icon: Calendar, color: 'blue', delay: 0 },
        { title: 'Last Payment', value: lastPaymentVal, icon: CreditCard, color: 'green', delay: 0.1 },
        { title: 'Reward Points', value: rewardPoints, icon: BarChart3, color: 'orange', delay: 0.2 },
    ];

    // Get the most imminent upcoming trip if any
    const nextTripData = upcomingTripsList.length > 0 ? upcomingTripsList[upcomingTripsList.length - 1] : null;
    const upcomingTrip = nextTripData && nextTripData.tripDetails ? {
        id: nextTripData.id || 'N/A',
        route: `${nextTripData.tripDetails.from} → ${nextTripData.tripDetails.to}`,
        date: new Date(nextTripData.tripDetails.departureTime).toLocaleDateString(),
        time: new Date(nextTripData.tripDetails.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        seatNo: `${nextTripData.seatCount} Seat(s)`,
        busNo: 'TBD'
    } : null;

    const notifications = [
        { id: 1, message: 'Welcome to the Bus Ticket Reservation System!', type: 'info' as const },
        ...(upcomingTrip ? [{ id: 2, message: `Your next trip to ${nextTripData?.tripDetails?.to} is confirmed.`, type: 'info' as const }] : []),
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
                <p className="text-gray-500">Welcome back, {userName}! Here's your travel summary.</p>
            </motion.div>

            {loading ? (
                <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
            ) : (
                <>
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
                                {upcomingTrip ? (
                                    <UpcomingTripCard trip={upcomingTrip} />
                                ) : (
                                    <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center shadow-sm">
                                        <p className="text-gray-500">No upcoming trips at the moment.</p>
                                    </div>
                                )}
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
                </>
            )}
        </motion.div>
    );
}
