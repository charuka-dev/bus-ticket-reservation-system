interface PaymentStatusBadgeProps {
    status: 'PAID' | 'FAILED' | 'REFUNDED';
}

export default function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
    const styles = {
        PAID: 'bg-green-100 text-green-700 border-green-200',
        FAILED: 'bg-red-100 text-red-700 border-red-200',
        REFUNDED: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[status]}`}>
            {status}
        </span>
    );
}
