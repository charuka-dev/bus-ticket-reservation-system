import { db, rtdb } from "../src/firebase.ts";
import { doc, setDoc } from "firebase/firestore";
import { ref, set } from "firebase/database";

import {
    conductors,
    trips,
    bookings,
    payments,
    notifications,
    settings
} from "./sampleData.ts";


// ================= FIRESTORE SEED =================
async function seedFirestore() {
    console.log("Seeding Firestore...");

    // Conductors
    for (const conductor of conductors) {
        await setDoc(doc(db, "conductors", conductor.uid), conductor);
    }

    // Trips
    for (const trip of trips) {
        await setDoc(doc(db, "trips", trip.tripId), trip);
    }

    // Bookings
    for (const booking of bookings) {
        await setDoc(doc(db, "bookings", booking.bookingId), booking);
    }

    // Payments
    for (const payment of payments) {
        await setDoc(doc(db, "payments", payment.paymentId), payment);
    }

    // Notifications
    for (const notification of notifications) {
        await setDoc(doc(db, "notifications", notification.notificationId), notification);
    }

    // System Settings
    await setDoc(doc(db, "settings", "system"), settings);

    console.log("Firestore Seed Completed.");
}


// ================= REALTIME DB =================
async function seedRealtimeDB() {
    console.log("Seeding Realtime Database...");

    await set(ref(rtdb, "busLocations/bus001"), {
        lat: 7.2906,
        lng: 80.6337,
        speed: 55,
        updatedAt: Date.now()
    });

    await set(ref(rtdb, "busLocations/bus002"), {
        lat: 7.8731,
        lng: 80.7718,
        speed: 48,
        updatedAt: Date.now()
    });

    await set(ref(rtdb, "busStatus/bus001"), {
        online: true,
        tripId: "trip001"
    });

    await set(ref(rtdb, "busStatus/bus002"), {
        online: true,
        tripId: "trip002"
    });

    console.log("Realtime DB Seed Completed.");
}


// ================= RUN =================
async function runSeed() {
    try {
        await seedFirestore();
        await seedRealtimeDB();

        console.log("All New Data Seeded Successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Seed Failed:", error);
        process.exit(1);
    }
}

runSeed();