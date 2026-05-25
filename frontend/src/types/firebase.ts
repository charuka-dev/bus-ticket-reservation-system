import { FieldValue, Timestamp } from 'firebase/firestore';

// ─── Auth / Customer ─────────────────────────────────────────────────────────

export interface Customer {
    uid: string;
    name: string;
    email: string;
    phone: string;
    nic: string;
    role: 'CUSTOMER' | 'CONDUCTOR' | 'OWNER';
    walletBalance?: number;
    createdAt: number | FieldValue | Timestamp | Date;
}

export interface Owner {
    uid: string;
    ownerCustomId: string; // e.g. "owner009"
    name: string;
    email: string;
    companyName: string;
    phone: string;
    role: 'OWNER';
    approved: 'pending' | 'approved' | 'rejected';
    createdAt: string; // ISO string for date and time
}

// ─── Seat ────────────────────────────────────────────────────────────────────

export interface Seat {
    seatNo: string;               // e.g. "1", "2", "A1"
    status: 'available' | 'booked';
}

// ─── Trip ────────────────────────────────────────────────────────────────────

export interface Trip {
    id: string;
    routeId: string;
    busId: string;
    busNumber: string;            // e.g. "NB-4587"
    from: string;
    to: string;
    departureTime: string;        // ISO string
    arrivalTime: string;          // ISO string
    price: number;                // price per seat
    totalSeats: number;
    availableSeats: number;
    date?: string;                // e.g. "2026-05-25"
    capacity?: number;
    dynamicAvailableSeats?: number;
    routeDetails?: any;
    searchDate?: string;
}

/** Trip document with the embedded seats array loaded */
export interface TripWithSeats extends Trip {
    seats: Seat[];
}

// ─── Booking ─────────────────────────────────────────────────────────────────

export interface Booking {
    id?: string;
    customerId: string;
    customerName: string;
    tripId: string;
    routeId?: string;             // stored on the booking for denormalised lookups
    busId?: string;               // stored on the booking for denormalised lookups
    date?: string;                // travel date e.g. "2026-05-25" (separate from bookingDate)
    seatNumbers: string[];        // e.g. ["3","4","7"]
    seatCount: number;
    totalAmount: number;
    bookingDate: string;          // ISO string — when the booking was created
    status: 'CONFIRMED' | 'CANCELLED' | 'PENDING';
    paymentStatus: 'PAID' | 'UNPAID' | 'REFUNDED';
    qrCode?: string;              // encoded QR payload string persisted after ticket generation
    tripDetails?: {
        from: string;
        to: string;
        departureTime: string;
        arrivalTime: string;
        busNumber: string;
    };
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export interface Payment {
    id?: string;
    bookingId: string;
    customerId: string;
    amount: number;
    paymentDate: string;          // ISO string
    method: 'CREDIT_CARD' | 'DEBIT_CARD' | 'WALLET' | 'CASH';
    status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED';
}

// ─── Wallet ──────────────────────────────────────────────────────────────────

export interface WalletTransaction {
    id: string;
    customerId: string;
    amount: number;
    method: 'CARD' | 'BANK_TRANSFER' | 'CASH' | 'WALLET';
    status: 'SUCCESS' | 'FAILED';
    timestamp: string; // ISO string
    type: 'TOP_UP' | 'PAYMENT' | 'REFUND';
}
