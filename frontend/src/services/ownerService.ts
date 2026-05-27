import { db } from "../firebase";
import { doc, deleteDoc } from "firebase/firestore";

export const deleteOwnerById = async (ownerId: string) => {
  // 📄 Create a reference to the specific owner document in Firestore
  const ref = doc(db, "owners", ownerId);

  // 🗑️ Delete the owner document from the "owners" collection
  await deleteDoc(ref);
};