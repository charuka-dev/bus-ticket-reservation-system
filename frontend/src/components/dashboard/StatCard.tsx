import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color: string; // Tailwind color class prefix (e.g., 'blue', 'orange')
    delay?: number;
}

export default function StatCard({ title, value, icon: Icon, color, delay = 0 }: StatCardProps) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        orange: 'bg-orange-50 text-orange-600',
        purple: 'bg-purple-50 text-purple-600',
        red: 'bg-red-50 text-red-600',
    } as const;

    // Fallback if color is not in the map, though TypeScript should catch it if typed strictly.
    // Simplifying for flexibility: user passes base color name.
    const iconClass = colorClasses[color as keyof typeof colorClasses] || 'bg-gray-50 text-gray-600';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
        >
            <div>
                <p className="text-gray-500 text-sm font-medium">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
            </div>
            <div className={`p-4 rounded-xl ${iconClass}`}>
                <Icon className="w-6 h-6" />
            </div>
        </motion.div>
    );
}
