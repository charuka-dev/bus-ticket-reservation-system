import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    setDoc,
    runTransaction,
} from 'firebase/firestore';
import { db } from '../firebase';
import { type Trip, type TripWithSeats, type Booking, type Payment, type WalletTransaction } from '../types/firebase';
import { getNextTxnId } from './walletService';

// ─── Input type for creating a booking ───────────────────────────────────────

export type CreateBookingInput = {
    customerId: string;
    customerName: string;
    tripId: string;
    date: string;                // travel date e.g. "2026-05-25"
    seatNumbers: string[];       // e.g. ["3", "7", "12"]
    totalAmount: number;
};

// ─── Sequential ID generator ─────────────────────────────────────────────────
// Fetches all docs whose ID starts with `prefix`, finds the highest numeric
// suffix, and returns the next one zero-padded to `pad` digits.
// e.g. prefix="book", pad=3 → "book003" when book001 & book002 exist.
async function getNextSequentialId(
    collectionName: string,
    prefix: string,
    pad = 3,
): Promise<string> {
    const snap = await getDocs(collection(db, collectionName));
    let max = 0;
    snap.forEach(d => {
        const id = d.id;
        if (id.startsWith(prefix)) {
            const num = parseInt(id.slice(prefix.length), 10);
            if (!isNaN(num) && num > max) max = num;
        }
    });
    const next = max + 1;
    return prefix + String(next).padStart(pad, '0');
}


const toTitleCase = (str: string): string => {
    return str.trim().toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export const bookingService = {

    // 1. Search Trips ─────────────────────────────────────────────────────────
    async searchTrips(from: string, to: string, date: string): Promise<Trip[]> {
        const normalizedFrom = toTitleCase(from);
        const normalizedTo = toTitleCase(to);
        const searchDate = date.trim();

        console.log('--- bookingService.searchTrips debug ---');
        console.log('Original parameters:', { from, to, date });
        console.log('Normalized query parameters:', { normalizedFrom, normalizedTo, searchDate });

        // Step A: Query routes collection to find matching route
        console.log('Step A: Querying routes collection...');
        const routesRef = collection(db, 'routes');
        const routeQuery = query(
            routesRef,
            where('from', '==', normalizedFrom),
            where('to', '==', normalizedTo)
        );
        const routeSnapshot = await getDocs(routeQuery);
        console.log(`Routes query complete. Returned doc count: ${routeSnapshot.size}`);

        if (routeSnapshot.empty) {
            console.log('No matching route found. Returning empty trips array.');
            console.log('----------------------------------------');
            return [];
        }

        const routeDoc = routeSnapshot.docs[0];
        const routeData = routeDoc.data();
        const routeId = routeDoc.id;

        const matchingRoute = {
            id: routeId,
            routeId,
            from: routeData.from || normalizedFrom,
            to: routeData.to || normalizedTo,
            ...routeData
        };
        console.log(`Matching route found. routeId: "${routeId}"`, matchingRoute);

        // Step B: Query trips collection using routeId
        console.log('Step B: Querying trips collection...');
        const tripsRef = collection(db, 'trips');
        const tripsQuery = query(
            tripsRef,
            where('routeId', '==', routeId)
        );
        const tripsSnapshot = await getDocs(tripsQuery);
        console.log(`Trips query complete. Returned doc count: ${tripsSnapshot.size}`);

        const availableTrips: Trip[] = [];

        const tripsPromises = tripsSnapshot.docs.map(async (docSnap) => {
            const tripData = docSnap.data();
            const tripId = docSnap.id;

            // 1. Get total bus capacity (if it's not already saved in the trip document)
            let busCapacity = tripData.capacity || tripData.totalSeats;
            if (!busCapacity && tripData.busId) {
                try {
                    const busRef = doc(db, 'buses', tripData.busId);
                    const busSnap = await getDoc(busRef);
                    if (busSnap.exists()) {
                        const busData = busSnap.data();
                        busCapacity = busData.capacity || busData.totalSeats || 50;
                    }
                } catch (err) {
                    console.error(`Error fetching bus capacity for bus ${tripData.busId}:`, err);
                }
            }
            if (!busCapacity) {
                busCapacity = 50; // Fallback to 50
            }

            // 2. Query bookings for THIS specific trip on the REQUESTED date
            const bookingsRef = collection(db, 'bookings');
            const bookedQuery = query(
                bookingsRef,
                where('tripId', '==', tripId),
                where('date', '==', searchDate),
                where('status', 'in', ['CONFIRMED', 'PENDING']) // Ignore Cancelled or Failed bookings
            );

            const bookedSnapshot = await getDocs(bookedQuery);

            // 3. Calculate dynamic availability (accounting for multi-seat bookings if present, fallback to doc count)
            let bookedSeatsCount = 0;
            bookedSnapshot.forEach(bDoc => {
                const bData = bDoc.data();
                bookedSeatsCount += bData.seatNumbers ? bData.seatNumbers.length : 1;
            });

            const dynamicAvailableSeats = busCapacity - bookedSeatsCount;
            console.log(`Trip ID: ${tripId}, Capacity: ${busCapacity}, Booked Seats: ${bookedSeatsCount}, Dynamic Available Seats: ${dynamicAvailableSeats}`);

            // 4. Only show the trip if there are seats left
            if (dynamicAvailableSeats > 0) {
                availableTrips.push({
                    ...tripData,
                    id: tripId,
                    from: matchingRoute.from,
                    to: matchingRoute.to,
                    // Price lives on the route document; read from routeData directly
                    // (matchingRoute's inferred type doesn't include the spread fields)
                    price: tripData.price || routeData.price || 0,
                    routeDetails: matchingRoute,
                    capacity: busCapacity,
                    availableSeats: dynamicAvailableSeats,
                    dynamicAvailableSeats: dynamicAvailableSeats,
                    searchDate: searchDate
                } as unknown as Trip);
            }
        });

        await Promise.all(tripsPromises);

        console.log(`Returning ${availableTrips.length} available daily trips.`);
        console.log('----------------------------------------');
        return availableTrips;
    },

    // 1b. Get All Trips (Default view before searching) ───────────────────────
    async getAllTrips(date?: string): Promise<Trip[]> {
        const searchDate = date || new Date().toISOString().split('T')[0];
        console.log(`--- bookingService.getAllTrips debug --- date: ${searchDate}`);

        const tripsSnapshot = await getDocs(collection(db, 'trips'));
        const availableTrips: Trip[] = [];

        // Fetch all routes to avoid making a getDoc call for every trip
        const routesSnapshot = await getDocs(collection(db, 'routes'));
        const routeMap: Record<string, any> = {};
        routesSnapshot.forEach(doc => {
            routeMap[doc.id] = doc.data();
        });

        const tripsPromises = tripsSnapshot.docs.map(async (docSnap) => {
            const tripData = docSnap.data();
            const tripId = docSnap.id;

            const routeId = tripData.routeId;
            const routeData = routeMap[routeId];

            if (!routeData) return; // Skip if route doesn't exist

            const matchingRoute = {
                id: routeId,
                routeId,
                ...routeData
            };

            // 1. Get total bus capacity
            let busCapacity = tripData.capacity || tripData.totalSeats;
            if (!busCapacity && tripData.busId) {
                try {
                    const busRef = doc(db, 'buses', tripData.busId);
                    const busSnap = await getDoc(busRef);
                    if (busSnap.exists()) {
                        const busData = busSnap.data();
                        busCapacity = busData.capacity || busData.totalSeats || 50;
                    }
                } catch (err) {
                    console.error(`Error fetching bus capacity for bus ${tripData.busId}:`, err);
                }
            }
            if (!busCapacity) busCapacity = 50;

            // 2. Query bookings for this trip on the default date
            const bookingsRef = collection(db, 'bookings');
            const bookedQuery = query(
                bookingsRef,
                where('tripId', '==', tripId),
                where('date', '==', searchDate),
                where('status', 'in', ['CONFIRMED', 'PENDING'])
            );

            const bookedSnapshot = await getDocs(bookedQuery);

            let bookedSeatsCount = 0;
            bookedSnapshot.forEach(bDoc => {
                const bData = bDoc.data();
                bookedSeatsCount += bData.seatNumbers ? bData.seatNumbers.length : 1;
            });

            const dynamicAvailableSeats = busCapacity - bookedSeatsCount;

            if (dynamicAvailableSeats > 0) {
                availableTrips.push({
                    ...tripData,
                    id: tripId,
                    from: matchingRoute.from,
                    to: matchingRoute.to,
                    price: tripData.price || routeData.price || 0,
                    routeDetails: matchingRoute,
                    capacity: busCapacity,
                    availableSeats: dynamicAvailableSeats,
                    dynamicAvailableSeats: dynamicAvailableSeats,
                    searchDate: searchDate
                } as unknown as Trip);
            }
        });

        await Promise.all(tripsPromises);
        return availableTrips;
    },

    // 2. Get a Single Trip with Seats ─────────────────────────────────────────
    async getTripWithSeats(tripId: string): Promise<TripWithSeats | null> {
        console.log(`--- bookingService.getTripWithSeats debug --- tripId: "${tripId}"`);
        const tripRef = doc(db, 'trips', tripId);
        const tripSnap = await getDoc(tripRef);

        if (!tripSnap.exists()) {
            console.warn(`Trip with ID ${tripId} not found.`);
            return null;
        }

        const data = tripSnap.data() as TripWithSeats;
        data.id = tripSnap.id;

        // Fetch Route details to merge from and to
        if (data.routeId) {
            console.log(`Fetching route details for routeId: "${data.routeId}"`);
            const routeRef = doc(db, 'routes', data.routeId);
            const routeSnap = await getDoc(routeRef);
            if (routeSnap.exists()) {
                const routeData = routeSnap.data();
                data.from = routeData.from || 'Unknown';
                data.to = routeData.to || 'Unknown';
            } else {
                console.warn(`Route details not found for routeId: "${data.routeId}"`);
                data.from = 'Unknown';
                data.to = 'Unknown';
            }
        } else {
            data.from = 'Unknown';
            data.to = 'Unknown';
        }

        console.log(`Returning Trip with Seats:`, data);
        console.log('--------------------------------------------');
        return data;
    },

    // 2b. Get a Trip with Dynamic Seats for a specific travel date ────────────
    // In the daily-schedule model the seats array is NOT stored on the trip;
    // we build it from bus capacity minus bookings that already exist for that date.
    async getTripWithSeatsForDate(tripId: string, travelDate: string): Promise<TripWithSeats | null> {
        console.log(`--- bookingService.getTripWithSeatsForDate --- tripId: "${tripId}", date: "${travelDate}"`);
        const tripRef = doc(db, 'trips', tripId);
        const tripSnap = await getDoc(tripRef);

        if (!tripSnap.exists()) {
            console.warn(`Trip ${tripId} not found.`);
            return null;
        }

        const tripData = tripSnap.data();

        // Resolve route → from / to / price
        let from = 'Unknown';
        let to = 'Unknown';
        let routePrice = 0;
        if (tripData.routeId) {
            const routeSnap = await getDoc(doc(db, 'routes', tripData.routeId));
            if (routeSnap.exists()) {
                const rd = routeSnap.data();
                from = rd.from || 'Unknown';
                to = rd.to || 'Unknown';
                routePrice = rd.price || 0;
                console.log(`Route resolved — from: "${from}", to: "${to}", price: ${routePrice}`);
            }
        }

        // Resolve bus → capacity + busNumber
        let totalSeats = tripData.capacity || tripData.totalSeats || 0;
        let busNumber = tripData.busNumber || '';
        if ((!totalSeats || !busNumber) && tripData.busId) {
            const busSnap = await getDoc(doc(db, 'buses', tripData.busId));
            if (busSnap.exists()) {
                const bd = busSnap.data();
                totalSeats = totalSeats || bd.capacity || bd.totalSeats || 40;
                busNumber = busNumber || bd.busNumber || bd.regNumber || '';
            }
        }
        if (!totalSeats) totalSeats = 40; // absolute fallback

        // Find already-booked seat numbers for this trip on this date
        const bookedQuery = query(
            collection(db, 'bookings'),
            where('tripId', '==', tripId),
            where('date', '==', travelDate),
            where('status', 'in', ['CONFIRMED', 'PENDING'])
        );
        const bookedSnap = await getDocs(bookedQuery);
        const bookedSeatNos = new Set<string>();
        bookedSnap.forEach(bDoc => {
            const bData = bDoc.data();
            if (Array.isArray(bData.seatNumbers)) {
                bData.seatNumbers.forEach((s: string) => bookedSeatNos.add(s));
            }
        });
        console.log(`Booked seats on ${travelDate}:`, [...bookedSeatNos]);

        // Build dynamic seat grid
        const seats: import('../types/firebase').Seat[] = Array.from({ length: totalSeats }, (_, i) => {
            const seatNo = String(i + 1);
            return { seatNo, status: bookedSeatNos.has(seatNo) ? 'booked' : 'available' };
        });

        const result: TripWithSeats = {
            id: tripSnap.id,
            routeId: tripData.routeId || '',
            busId: tripData.busId || '',
            busNumber,
            from,
            to,
            departureTime: tripData.departureTime || '',
            arrivalTime: tripData.arrivalTime || '',
            price: tripData.price || routePrice || 0,
            totalSeats,
            availableSeats: totalSeats - bookedSeatNos.size,
            seats,
        };

        console.log(`Dynamic TripWithSeats built — totalSeats: ${totalSeats}, booked: ${bookedSeatNos.size}`);
        return result;
    },

    // 3. Get a Single Booking by ID ───────────────────────────────────────────
    async getBookingById(bookingId: string): Promise<Booking | null> {
        const bookingRef = doc(db, 'bookings', bookingId);
        const snap = await getDoc(bookingRef);
        if (!snap.exists()) return null;
        const data = snap.data() as Booking;
        data.id = snap.id;
        return data;
    },

    // 3b. Save QR code payload to the booking document ────────────────────────
    async saveQrCode(bookingId: string, qrCode: string): Promise<void> {
        await setDoc(doc(db, 'bookings', bookingId), { qrCode }, { merge: true });
    },

    // 4. Create Booking (date-scoped, sequential ID) ──────────────────────────
    async createBooking(input: CreateBookingInput): Promise<string> {
        const tripRef = doc(db, 'trips', input.tripId);
        const bookingsRef = collection(db, 'bookings');

        // Generate the sequential booking ID BEFORE the transaction
        // (transactions can't run collection queries internally).
        const newBookingId = await getNextSequentialId('bookings', 'book');
        const newBookingRef = doc(bookingsRef, newBookingId);

        await runTransaction(db, async (transaction) => {
            // --- Read trip ---
            const tripSnap = await transaction.get(tripRef);
            if (!tripSnap.exists()) throw new Error('Trip not found.');
            const tripData = tripSnap.data();

            // --- Resolve route for tripDetails ---
            let from = 'Unknown';
            let to = 'Unknown';
            if (tripData.routeId) {
                const routeSnap = await transaction.get(doc(db, 'routes', tripData.routeId));
                if (routeSnap.exists()) {
                    from = routeSnap.data().from || 'Unknown';
                    to = routeSnap.data().to || 'Unknown';
                }
            }

            // --- Build booking document ---
            const booking: Booking = {
                id: newBookingId,
                customerId: input.customerId,
                customerName: input.customerName,
                tripId: input.tripId,
                busId: tripData.busId || '',
                date: input.date,
                seatNumbers: input.seatNumbers,
                seatCount: input.seatNumbers.length,
                totalAmount: input.totalAmount,
                bookingDate: new Date().toISOString(),
                status: 'CONFIRMED',
                paymentStatus: 'UNPAID',
                tripDetails: {
                    from,
                    to,
                    departureTime: tripData.departureTime || '',
                    arrivalTime: tripData.arrivalTime || '',
                    busNumber: tripData.busNumber || '',
                },
            };

            // Write the booking with the pre-generated sequential ID
            transaction.set(newBookingRef, booking);
        });

        return newBookingId;
    },

    // 5. Cancel Booking & Refund ──────────────────────────────────────────────
    async cancelBooking(bookingId: string, customerId: string, refundAmount: number): Promise<void> {
        const bookingRef = doc(db, 'bookings', bookingId);
        const customerRef = doc(db, 'customers', customerId);

        // Generate a new transaction ID for the refund receipt
        const newTxnId = await getNextTxnId();
        const txnRef = doc(db, 'walletTransactions', newTxnId);

        await runTransaction(db, async (transaction) => {
            const bookingSnap = await transaction.get(bookingRef);
            if (!bookingSnap.exists()) throw new Error('Booking not found.');

            const bookingData = bookingSnap.data() as Booking;
            if (bookingData.status === 'CANCELLED') throw new Error('Already cancelled.');

            const customerSnap = await transaction.get(customerRef);
            if (!customerSnap.exists()) throw new Error('Customer not found');

            // 1. Mark booking as cancelled and refunded
            transaction.update(bookingRef, {
                status: 'CANCELLED',
                paymentStatus: bookingData.paymentStatus === 'PAID' ? 'REFUNDED' : 'UNPAID',
            });

            // 2. Refund wallet balance
            const currentBalance = customerSnap.data().walletBalance || 0;
            transaction.update(customerRef, { walletBalance: currentBalance + refundAmount });

            // 3. Create wallet transaction receipt
            const txnData: WalletTransaction = {
                id: newTxnId,
                customerId,
                amount: refundAmount,
                method: 'WALLET', // indicating it's an internal wallet refund
                status: 'SUCCESS',
                timestamp: new Date().toISOString(),
                type: 'REFUND'
            };
            transaction.set(txnRef, txnData);
        });
    },

    // 6. Get My Bookings ──────────────────────────────────────────────────────
    async getMyBookings(customerId: string): Promise<Booking[]> {
        const trimmedCustomerId = customerId.trim();
        console.log('--- bookingService.getMyBookings debug ---');
        console.log('customerId:', JSON.stringify(customerId), 'trimmed:', JSON.stringify(trimmedCustomerId));

        const q = query(
            collection(db, 'bookings'),
            where('customerId', '==', trimmedCustomerId),
        );

        console.log('Executing Firestore query on bookings...');
        const snapshot = await getDocs(q);
        console.log(`Firestore query complete. Returned doc count: ${snapshot.size}`);

        const bookingsPromises = snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data() as Booking;
            data.id = docSnap.id;

            // Fetch nested Trip and Route details
            try {
                if (data.tripId) {
                    const tripRef = doc(db, 'trips', data.tripId);
                    const tripSnap = await getDoc(tripRef);
                    if (tripSnap.exists()) {
                        const tripData = tripSnap.data();
                        let from = 'Unknown';
                        let to = 'Unknown';

                        // Fetch Route if routeId exists on the trip
                        const routeId = tripData.routeId || data.routeId;
                        if (routeId) {
                            const routeRef = doc(db, 'routes', routeId);
                            const routeSnap = await getDoc(routeRef);
                            if (routeSnap.exists()) {
                                const routeData = routeSnap.data();
                                from = routeData.from || 'Unknown';
                                to = routeData.to || 'Unknown';
                            }
                        }

                        data.tripDetails = {
                            from,
                            to,
                            departureTime: tripData.departureTime || '',
                            arrivalTime: tripData.arrivalTime || '',
                            busNumber: tripData.busNumber || '',
                        };
                        data.busId = tripData.busId || data.busId;
                    }
                }
            } catch (err) {
                console.error(`Error resolving nested trip/route details for booking ${data.id}:`, err);
            }

            return data;
        });

        const bookings = await Promise.all(bookingsPromises);

        console.log(`Returning ${bookings.length} bookings.`);
        console.log('------------------------------------------');

        return bookings.sort(
            (a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
        );
    },

    // 7. Get Payment History ──────────────────────────────────────────────────
    async getPaymentHistory(customerId: string): Promise<Payment[]> {
        const trimmedCustomerId = customerId.trim();
        console.log('--- bookingService.getPaymentHistory debug ---');
        console.log('customerId:', JSON.stringify(customerId), 'trimmed:', JSON.stringify(trimmedCustomerId));

        const q = query(
            collection(db, 'payments'),
            where('customerId', '==', trimmedCustomerId),
        );

        console.log('Executing Firestore query on payments...');
        const snapshot = await getDocs(q);
        console.log(`Firestore query complete. Returned doc count: ${snapshot.size}`);

        const payments: Payment[] = [];

        snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Payment;
            data.id = docSnap.id;
            payments.push(data);
        });

        console.log(`Returning ${payments.length} payments.`);
        console.log('----------------------------------------------');

        return payments.sort(
            (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
        );
    },
};

export const getAllBookings = async () => {
    try {
        // 📥 Fetch all documents from the "bookings" collection in Firestore
        const snap = await getDocs(collection(db, "bookings"));

        // 🔄 Convert Firestore documents into a usable array format
        return snap.docs.map((doc) => ({
            id: doc.id,        // document ID
            ...doc.data(),     // document fields
        }));

    } catch (error) {
        // ⚠️ Log any Firestore errors for debugging
        console.error("Firestore error:", error);

        // 🛑 Return empty array if something goes wrong
        return [];
    }
};