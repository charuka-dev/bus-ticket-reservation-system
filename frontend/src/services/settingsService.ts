import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

// ------------------ FEE ------------------

// 📥 Get convenience fee from Firestore
export const getConvenienceFee = async () => {
  const ref = doc(db, "settings", "system");

  // 📄 Fetch the settings document
  const snap = await getDoc(ref);

  // ✅ Return fee if document exists, otherwise return default value 0
  if (snap.exists()) return snap.data().convenienceFee;

  return 0;
};

// ✏️ Update convenience fee (ONLY updates existing document, does NOT create new one)
export const updateConvenienceFee = async (fee: string) => {
  const ref = doc(db, "settings", "system");

  // 📄 Check if settings document exists before updating
  const snap = await getDoc(ref);

  // ❌ Throw error if settings document is missing
  if (!snap.exists()) {
    throw new Error("Settings document not found");
  }

  // 💾 Update convenience fee value in Firestore
  await updateDoc(ref, {
    convenienceFee: Number(fee),
  });
};

// ------------------ PAYMENT ------------------

// 📥 Get payment settings from Firestore
export const getPaymentSettings = async () => {
  const ref = doc(db, "settings", "system");

  // 📄 Fetch settings document
  const snap = await getDoc(ref);

  // ✅ Return payment settings if exists, otherwise return default values
  if (snap.exists()) {
    return snap.data().paymentEnabled || {
      cardPayment: false,
      bankTransfer: false,
    };
  }

  // 🟡 Default fallback values when document does not exist
  return {
    cardPayment: false,
    bankTransfer: false,
  };
};

// ✏️ Update payment settings (card & bank transfer options)
export const updatePaymentSettings = async (
  cardPayment: boolean,
  bankTransfer: boolean
) => {
  const ref = doc(db, "settings", "system");

  // 📄 Check if settings document exists
  const snap = await getDoc(ref);

  // ❌ Prevent update if document is missing
  if (!snap.exists()) {
    throw new Error("Settings document not found");
  }

  // 💾 Update payment configuration in Firestore
  await updateDoc(ref, {
    paymentEnabled: {
      cardPayment,
      bankTransfer,
    },
  });
};