/**
 * seedFirestore.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * ONE-TIME seed script to populate Firestore with sample data.
 *
 * HOW TO USE:
 *   1. Import and call `seedFirestore()` once from any component or a
 *      temporary button in your app while logged in as a customer.
 *   2. Check Firebase Console to confirm the documents were created.
 *   3. Remove the call — you don't need to run this again.
 *
 * Example (temporary button in DashboardHome):
 *   import { seedFirestore } from '../../scripts/seedFirestore';
 *   <button onClick={seedFirestore}>Seed DB</button>
 */

import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import type { Seat } from '../types/firebase';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Generate `count` seats all set to 'available' */
const generateSeats = (count: number): Seat[] =>
    Array.from({ length: count }, (_, i) => ({
        seatNo: String(i + 1),
        status: 'available' as const,
    }));

// ─── Sample Data ─────────────────────────────────────────────────────────────

const routes = [
    { id: 'route-01', from: 'Colombo', to: 'Kandy' },
    { id: 'route-02', from: 'Galle',   to: 'Colombo' },
    { id: 'route-03', from: 'Jaffna',  to: 'Colombo' },
];

const buses = [
    { id: 'bus-01', busNumber: 'NB-4587', totalSeats: 40 },
    { id: 'bus-02', busNumber: 'WP-1234', totalSeats: 36 },
    { id: 'bus-03', busNumber: 'NP-9988', totalSeats: 44 },
];

const trips = [
    {
        id: 'trip-01',
        routeId: 'route-01',
        busId: 'bus-01',
        busNumber: 'NB-4587',
        from: 'Colombo',
        to: 'Kandy',
        departureTime: '2026-05-10T08:30:00Z',
        arrivalTime:   '2026-05-10T11:45:00Z',
        price: 1500,
        totalSeats: 40,
        availableSeats: 40,
        seats: generateSeats(40),
    },
    {
        id: 'trip-02',
        routeId: 'route-02',
        busId: 'bus-02',
        busNumber: 'WP-1234',
        from: 'Galle',
        to: 'Colombo',
        departureTime: '2026-05-10T09:00:00Z',
        arrivalTime:   '2026-05-10T11:00:00Z',
        price: 1200,
        totalSeats: 36,
        availableSeats: 36,
        seats: generateSeats(36),
    },
    {
        id: 'trip-03',
        routeId: 'route-03',
        busId: 'bus-03',
        busNumber: 'NP-9988',
        from: 'Jaffna',
        to: 'Colombo',
        departureTime: '2026-05-10T20:00:00Z',
        arrivalTime:   '2026-05-11T04:00:00Z',
        price: 2500,
        totalSeats: 44,
        availableSeats: 44,
        seats: generateSeats(44),
    },
    // Add a second Colombo→Kandy trip on the same date for fuller search testing
    {
        id: 'trip-04',
        routeId: 'route-01',
        busId: 'bus-02',
        busNumber: 'WP-1234',
        from: 'Colombo',
        to: 'Kandy',
        departureTime: '2026-05-10T14:00:00Z',
        arrivalTime:   '2026-05-10T17:30:00Z',
        price: 1500,
        totalSeats: 36,
        availableSeats: 36,
        seats: generateSeats(36),
    },
];

// ─── Seed Function ────────────────────────────────────────────────────────────

export async function seedFirestore(): Promise<void> {
    const batch = writeBatch(db);

    // Routes
    routes.forEach(route => {
        batch.set(doc(collection(db, 'routes'), route.id), route);
    });

    // Buses
    buses.forEach(bus => {
        batch.set(doc(collection(db, 'buses'), bus.id), bus);
    });

    // Trips (seats embedded in the document)
    trips.forEach(trip => {
        batch.set(doc(collection(db, 'trips'), trip.id), trip);
    });

    await batch.commit();
    console.log('✅ Firestore seeded successfully!');
    alert('✅ Firestore seeded! Check your Firebase Console.');
}
