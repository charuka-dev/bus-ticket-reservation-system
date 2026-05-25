import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    query, 
    where, 
    runTransaction,
    orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Customer, WalletTransaction } from '../types/firebase';

export async function getNextTxnId(): Promise<string> {
    const snap = await getDocs(collection(db, 'walletTransactions'));
    let max = 0;
    snap.forEach(d => {
        if (d.id.startsWith('txn')) {
            const num = parseInt(d.id.slice(3), 10);
            if (!isNaN(num) && num > max) max = num;
        }
    });
    return 'txn' + String(max + 1).padStart(3, '0');
}

export const walletService = {

    /**
     * Get the current wallet balance of the customer
     */
    async getWalletBalance(customerId: string): Promise<number> {
        const customerRef = doc(db, 'customers', customerId);
        const snap = await getDoc(customerRef);
        if (snap.exists()) {
            const data = snap.data() as Customer;
            return data.walletBalance || 0;
        }
        return 0;
    },

    /**
     * Top-up the wallet using an atomic transaction to ensure balance consistency
     */
    async topUpWallet(customerId: string, amount: number, method: WalletTransaction['method']): Promise<string> {
        const newTxnId = await getNextTxnId();
        const customerRef = doc(db, 'customers', customerId);
        const txnRef = doc(db, 'walletTransactions', newTxnId);

        await runTransaction(db, async (transaction) => {
            const customerSnap = await transaction.get(customerRef);
            if (!customerSnap.exists()) {
                throw new Error("Customer not found.");
            }

            const currentBalance = customerSnap.data().walletBalance || 0;
            const newBalance = currentBalance + amount;

            // Update customer document
            transaction.update(customerRef, { walletBalance: newBalance });

            // Create transaction document
            const txnData: WalletTransaction = {
                id: newTxnId,
                customerId,
                amount,
                method,
                status: 'SUCCESS',
                timestamp: new Date().toISOString(),
                type: 'TOP_UP'
            };
            transaction.set(txnRef, txnData);
        });

        return newTxnId;
    },

    /**
     * Get transaction history sorted by newest first
     */
    async getWalletTransactions(customerId: string): Promise<WalletTransaction[]> {
        const q = query(
            collection(db, 'walletTransactions'),
            where('customerId', '==', customerId)
        );
        const snapshot = await getDocs(q);
        
        const txns: WalletTransaction[] = [];
        snapshot.forEach(docSnap => {
            txns.push(docSnap.data() as WalletTransaction);
        });

        // Sort descending by timestamp locally since we might not have a composite index right away
        return txns.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
};
