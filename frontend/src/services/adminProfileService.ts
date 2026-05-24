import { db, auth } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "firebase/auth";

// 🔹 Firestore document reference (admins collection එකේ email එක document ID එක ලෙස භාවිතා කරනවා)
const getDocRef = (email: string) => {
  return doc(db, "admins", email);
};

// ⚡ Image එක compress කරලා Base64 string එකක් බවට convert කරන function එක
// (Firebase Storage නැතුව Firestore එකට save කරන්න)
const convertAndCompressToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // file එක read කරලා base64 format එකට convert කරනවා
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const result = event.target?.result;

      if (typeof result !== "string") {
        reject(new Error("Failed to read file"));
        return;
      }

      const img = new Image();
      img.src = result;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Canvas context failed"));
          return;
        }

        let width = img.width;
        let height = img.height;

        // image size reduce කිරීම (Firestore optimize කරන්න)
        const maxWidth = 400;

        if (width > maxWidth) {
          const scale = maxWidth / width;
          width = maxWidth;
          height = Math.round(height * scale);
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        // image quality reduce කරලා base64 generate කරනවා
        const base64Url = canvas.toDataURL("image/jpeg", 0.6);

        resolve(base64Url);
      };

      img.onerror = () => reject(new Error("Image load error"));
    };

    reader.onerror = () => reject(new Error("File read error"));
  });
};

// 🚀 Admin profile image එක Firestore එකට upload කරන function එක
export const uploadProfileImage = async (email: string, file: File) => {
  try {
    const base64Image = await convertAndCompressToBase64(file);

    // Firestore admins collection එක update කරනවා (merge: true නිසා existing data නැති වෙන්නේ නෑ)
    await setDoc(
      getDocRef(email),
      { profileImage: base64Image },
      { merge: true }
    );

    return base64Image;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

// 📥 Admin profile image එක Firestore එකෙන් fetch කරන function එක
export const getAdminProfileImage = async (email: string) => {
  try {
    const snap = await getDoc(getDocRef(email));

    // document එක තිබ්බොත් image return කරනවා
    return snap.exists() ? snap.data().profileImage || null : null;
  } catch (error) {
    console.error("Get image error:", error);
    return null;
  }
};

// 🔐 Admin profile update කරන function එක (username + password)
export const updateAdminProfile = async (
  email: string,
  username?: string,
  currentPassword?: string,
  newPassword?: string
) => {
  // 🟢 Username update කිරීම
  if (username && username.trim() !== "") {
    await setDoc(getDocRef(email), { username }, { merge: true });
  }

  // 🔑 Password update කිරීම (Firebase security requirement: re-authentication)
  if (
    currentPassword &&
    newPassword &&
    auth.currentUser &&
    auth.currentUser.email
  ) {
    // user verify කරන්න credential create කරනවා
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      currentPassword
    );

    // user එක re-authenticate කරනවා (security step)
    await reauthenticateWithCredential(auth.currentUser, credential);

    // password update කරනවා
    await updatePassword(auth.currentUser, newPassword);
  }
};