import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc
} from "firebase/firestore";

export type Owner = {
  id: string;
  name: string;
  email: string;
  approved?: string;
};

// 🔥 realtime fetch
export const subscribeOwners = (callback: (owners: Owner[]) => void) => {
  return onSnapshot(collection(db, "owners"), (snapshot) => {
    const data: Owner[] = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<Owner, "id">)
    }));

    callback(data);
  });
};

// ✅ approve
export const approveOwnerService = async (id: string) => {
  await updateDoc(doc(db, "owners", id), {
    approved: "approved"
  });
};

// ❌ reject
export const rejectOwnerService = async (id: string) => {
  await updateDoc(doc(db, "owners", id), {
    approved: "rejected"
  });
};