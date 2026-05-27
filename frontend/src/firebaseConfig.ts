import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyALjiMQTYRGLHCVPv0rHlqNSQWJO9eoLDU",
  authDomain: "bus-ticket-reservation-s-71179.firebaseapp.com",
  projectId: "bus-ticket-reservation-s-71179",
  storageBucket: "bus-ticket-reservation-s-71179.firebasestorage.app",
  messagingSenderId: "764718566915",
  appId: "1:764718566915:web:b73e155c7e98cfa1208836"
};

// 1. Main App (Admin වැඩ වලට)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// 2. Secondary App (Conductor රෙජිස්ටර් කරන වැඩේට විතරක්)
const secondaryApp = initializeApp(firebaseConfig, "secondaryAuth");

export const db = getFirestore(app);
export const auth = getAuth(app); // මේක Dashboard එකේ Owner වැඩ වලට
export const secondaryAuth = getAuth(secondaryApp); // Conductor රෙජිස්ටර් කරන්න මේක පාවිච්චි කරන්න
export const rtdb = getDatabase(app); // මේක තියෙනවාද බලන්න

export default app;