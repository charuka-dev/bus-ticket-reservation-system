import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

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