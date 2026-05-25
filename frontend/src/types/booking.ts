export interface Trip {
    id: string;
    busNo: string;
    route: {
        from: string;
        to: string;
    };
    departureTime: string;
    arrivalTime: string;
    date: string;
    price: number;
    availableSeats: number;
    totalSeats: number;
    amenities: string[];
}

export interface Seat {
    id: string;
    seatNo: string;
    status: 'available' | 'booked' | 'selected';
    price: number;
}

export interface BookingDetails {
    tripId: string;
    selectedSeats: Seat[];
    totalAmount: number;
    customerName: string;
    email: string;
    phoneNumber: string;
    paymentStatus: 'pending' | 'completed';
    bookingId?: string;
    status: 'confirmed' | 'cancelled';
    route: {
        from: string;
        to: string;
    };
    date: string;
    time: string;
    busNo: string;
    arrivalTime: string;
    qrCode?: string;       // real QR payload from Firestore
    firebaseBookingId?: string; // raw Firestore doc ID for navigation
}

export interface PaymentDetails {
    cardHolder: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
}

export interface PaymentRecord {
    paymentId: string;
    bookingId: string;
    amount: number;
    dateTime: string;
    status: 'PAID' | 'FAILED' | 'REFUNDED';
    method: 'CARD' | 'CASH' | 'ONLINE';
}

export interface TrackingTicket {
    bookingId: string;
    busId?: string;
    busNo: string;
    route: {
        from: string;
        to: string;
    };
    date: string;
    departureTime: string;
    seatNos: string[];
    status: 'CONFIRMED';
    used: boolean;
}

export interface BusLocation {
    lat: number;
    lng: number;
    updatedAt: string;
    speed: number;
    nextStop: string;
}
