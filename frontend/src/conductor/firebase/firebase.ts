import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database"; 

const firebaseConfig = {
  apiKey: "AIzaSyALjiMQTYRGLHCVPv0rHlqNSQWJO9eoLDU",
  authDomain: "bus-ticket-reservation-s-71179.firebaseapp.com",
  projectId: "bus-ticket-reservation-s-71179",
  storageBucket: "bus-ticket-reservation-s-71179.appspot.com",
  messagingSenderId: "764718566915",
  appId: "1:764718566915:web:b73e155c7e98cfa1208836",
  databaseURL: "https://bus-ticket-reservation-s-71179-default-rtdb.asia-southeast1.firebasedatabase.app" 
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app); // Realtime Database instance 