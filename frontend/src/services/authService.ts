import { db, auth } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";

export const adminLoginWithUsername = async (
  username: string,
  password: string
) => {
  try {
    // 🔍 Find the admin document by matching the username in Firestore
    const q = query(
      collection(db, "admins"),
      where("username", "==", username.trim())
    );

    const snap = await getDocs(q);

    // ❌ If no matching user is found, throw an error
    if (snap.empty) {
      throw new Error("User not found");
    }

    // 📧 Get the email from the matched Firestore document
    const email = snap.docs[0].data().email;

    // 🔐 Authenticate using Firebase Auth with email and password
    await signInWithEmailAndPassword(
      auth,
      email,
      password.trim()
    );

    // ✅ Return success if login is successful
    return true;

  } catch (error) {
    // ⚠️ Log the error for debugging and throw a user-friendly message
    console.error(error);
    throw new Error("Invalid User Name or Password");
  }
};