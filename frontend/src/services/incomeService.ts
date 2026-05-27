import { db } from "../firebase";
import { collection, getDocs, onSnapshot } from "firebase/firestore";

// existing (unchanged)
export const getAllPayments = async () => {
  // 📥 Fetch all payment documents once from Firestore
  const snap = await getDocs(collection(db, "payments"));

  // 🔄 Convert documents into plain data array
  return snap.docs.map((doc) => doc.data());
};

// 🔥 NEW: realtime listener for live payment updates
export const listenToPayments = (callback: (data: any[]) => void) => {
  // 👂 Listen to real-time changes in "payments" collection
  return onSnapshot(collection(db, "payments"), (snapshot) => {
    // 🔄 Convert snapshot documents into plain data array
    const data = snapshot.docs.map((doc) => doc.data());

    // 📤 Send updated data to the provided callback function
    callback(data);
  });
};