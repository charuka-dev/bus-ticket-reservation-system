import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyALjiMQTYRGLHCVPv0rHlqNSQWJO9eoLDU",
    authDomain: "bus-ticket-reservation-s-71179.firebaseapp.com",
    projectId: "bus-ticket-reservation-s-71179",
    storageBucket: "bus-ticket-reservation-s-71179.firebasestorage.app",
    messagingSenderId: "764718566915",
    appId: "1:764718566915:web:b73e155c7e98cfa1208836",

    // Add this from Realtime Database page
    databaseURL: "https://bus-ticket-reservation-s-71179-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const storage = getStorage(app);

export default app;