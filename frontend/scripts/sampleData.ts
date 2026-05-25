export const conductors = [
    {
        uid: "con001",
        name: "Sunil Perera",
        email: "con1@gmail.com",
        phone: "0773333333",
        ownerId: "owner001",
        busId: "bus001",
        createdAt: Date.now()
    },
    {
        uid: "con002",
        name: "Amal Fernando",
        email: "con2@gmail.com",
        phone: "0774444444",
        ownerId: "owner002",
        busId: "bus002",
        createdAt: Date.now()
    }
];

export const trips = [
    {
        tripId: "trip001",
        busId: "bus001",
        routeId: "route001",
        date: "2026-04-28",
        departureTime: "08:00 AM",
        arrivalTime: "11:30 AM",
        availableSeats: 40,
        status: "scheduled"
    },
    {
        tripId: "trip002",
        busId: "bus002",
        routeId: "route002",
        date: "2026-04-28",
        departureTime: "02:00 PM",
        arrivalTime: "04:00 PM",
        availableSeats: 38,
        status: "scheduled"
    }
];

export const bookings = [
    {
        bookingId: "book001",
        customerId: "cust001",
        tripId: "trip001",
        busId: "bus001",
        routeId: "route001",
        seatNo: "A1",
        price: 1200,
        qrCode: "QR_BOOK_001",
        status: "confirmed",
        createdAt: Date.now()
    },
    {
        bookingId: "book002",
        customerId: "cust001",
        tripId: "trip002",
        busId: "bus002",
        routeId: "route002",
        seatNo: "B2",
        price: 850,
        qrCode: "QR_BOOK_002",
        status: "pending",
        createdAt: Date.now()
    }
];

export const payments = [
    {
        paymentId: "pay001",
        bookingId: "book001",
        customerId: "cust001",
        amount: 1200,
        method: "card",
        status: "paid",
        paidAt: Date.now()
    }
];

export const notifications = [
    {
        notificationId: "noti001",
        userId: "cust001",
        title: "Booking Confirmed",
        message: "Your seat A1 is confirmed for trip001",
        read: false,
        createdAt: Date.now()
    }
];

export const settings = {
    convenienceFee: 50,
    paymentEnabled: true,
    currency: "LKR"
};