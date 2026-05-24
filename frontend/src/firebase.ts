import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyALjiMQTYRGLHCVPv0rHlqNSQWJO9eoLDU",
  authDomain: "bus-ticket-reservation-s-71179.firebaseapp.com",
  projectId: "bus-ticket-reservation-s-71179",
  storageBucket: "bus-ticket-reservation-s-71179.appspot.com",
  messagingSenderId: "764718566915",
  appId: "1:764718566915:web:b73e155c7e98cfa1208836"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;