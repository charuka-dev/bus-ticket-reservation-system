import { collection, doc, setDoc, getDoc, getDocs, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { type Payment } from '../types/firebase';

export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'WALLET' | 'CASH';

// ─── Sequential ID generator ─────────────────────────────────────────────────
async function getNextPaymentId(): Promise<string> {
    const snap = await getDocs(collection(db, 'payments'));
    let max = 0;
    snap.forEach(d => {
        if (d.id.startsWith('pay')) {
            const num = parseInt(d.id.slice(3), 10);
            if (!isNaN(num) && num > max) max = num;
        }
    });
    return 'pay' + String(max + 1).padStart(3, '0');
}

export const paymentService = {

    /**
     * Record a successful payment for a booking.
     * Uses a sequential human-readable ID (pay001, pay002, …).
     */
    async createPayment(
        bookingId: string,
        customerId: string,
        amount: number,
        method: PaymentMethod,
        busId?: string,
        ownerId?: string
    ): Promise<string> {
        const paymentId = await getNextPaymentId();
        const paymentRef = doc(db, 'payments', paymentId);

        const payment: Payment = {
            id:          paymentId,
            bookingId,
            customerId,
            amount,
            method,
            status:      'paid',
            paymentDate: new Date().toISOString(),
            ...(busId && { busId }),
            ...(ownerId && { ownerId }),
        };

        await setDoc(paymentRef, {
            ...payment,
            createdAt: serverTimestamp(),
        });

        // Mark the booking as PAID
        await setDoc(doc(db, 'bookings', bookingId), { paymentStatus: 'PAID' }, { merge: true });

        return paymentId;
    },

    /** Fetch a single payment by ID */
    async getPayment(paymentId: string): Promise<Payment | null> {
        const snap = await getDoc(doc(db, 'payments', paymentId));
        if (!snap.exists()) return null;
        const data = snap.data() as Payment;
        data.id = snap.id;
        return data;
    },

    /** Fetch all payments for a customer by customerId */
    async getPaymentsByCustomerId(customerId: string): Promise<Payment[]> {
        const trimmedId = customerId.trim();
        console.log('--- paymentService.getPaymentsByCustomerId ---');
        console.log('customerId:', JSON.stringify(trimmedId));

        const q = query(
            collection(db, 'payments'),
            where('customerId', '==', trimmedId),
        );
        const snapshot = await getDocs(q);
        console.log(`Returned doc count: ${snapshot.size}`);

        const payments: Payment[] = [];
        snapshot.forEach(docSnap => {
            const data = docSnap.data() as Payment;
            data.id = docSnap.id;
            payments.push(data);
        });

        return payments.sort(
            (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
        );
    },
};
