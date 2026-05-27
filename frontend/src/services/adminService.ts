import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const auth = getAuth();

// 🔥 Login function using username instead of email
export const adminLoginWithUsername = async (
  username: string,
  password: string
) => {
  // 1️⃣ Firestore එකෙන් username match වෙන admin document එක හොයනවා
  const q = query(
    collection(db, "admins"),
    where("username", "==", username)
  );

  const querySnapshot = await getDocs(q);

  // ❌ username එකක් match නොවුනොත් error throw කරනවා
  if (querySnapshot.empty) {
    throw new Error("User not found");
  }

  // 📄 matched user data එක ගන්නවා
  const userData = querySnapshot.docs[0].data();

  // 📧 document ID එක email එක විදිහට භාවිතා කරනවා
  const email = querySnapshot.docs[0].id;

  // 2️⃣ Firebase Authentication එකෙන් login කරනවා (email + password)
  await signInWithEmailAndPassword(auth, email, password);

  // 🔐 role check කරනවා (admin විතරක් allow කරන්න)
  if (userData.role !== "admin") {
    throw new Error("Not an admin");
  }

  // ✅ login success නම් true return කරනවා
  return true;
};