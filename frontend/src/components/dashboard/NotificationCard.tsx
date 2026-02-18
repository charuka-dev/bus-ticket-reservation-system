import { motion } from 'framer-motion';
import { Info, AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

interface NotificationCardProps {
    message: string;
    type: 'info' | 'warning';
    delay?: number;
    onDismiss?: () => void;
}

export default function NotificationCard({ message, type, delay = 0, onDismiss }: NotificationCardProps) {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    const styles = {
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-100',
            text: 'text-blue-800',
            icon: <Info className="w-5 h-5 text-blue-500" />,
        },
        warning: {
            bg: 'bg-orange-50',
            border: 'border-orange-100',
            text: 'text-orange-800',
            icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
        },
    };

    const currentStyle = styles[type];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4, delay }}
            className={`flex items-start p-4 rounded-xl border ${currentStyle.bg} ${currentStyle.border} shadow-sm mb-3 relative`}
        >
            <div className="flex-shrink-0 mt-0.5">
                {currentStyle.icon}
            </div>
            <div className={`ml-3 flex-1 text-sm font-medium ${currentStyle.text}`}>
                {message}
            </div>
            <button
                onClick={() => setIsVisible(false)}
                className="ml-auto flex-shrink-0 -mt-1 -mr-1 p-1 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-black/5 transition"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
}
