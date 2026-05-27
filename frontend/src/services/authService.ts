import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    type User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase';
import type { Customer, Owner } from '../types/firebase';

export type RegisterData = {
    name: string;
    email: string;
    phone: string;
    nic: string;
    password: string;
    role: 'CUSTOMER';
}

export type RegisterOwnerData = {
    name: string;
    email: string;
    phone: string;
    companyName: string;
    password: string;
    role: 'OWNER';
}

async function getNextOwnerId(): Promise<string> {
    const snap = await getDocs(collection(db, 'owners'));
    let max = 8; // So the next one generated is 9 (owner009)
    snap.forEach(d => {
        if (d.data().ownerCustomId?.startsWith('owner')) {
            const num = parseInt(d.data().ownerCustomId.slice(5), 10);
            if (!isNaN(num) && num > max) max = num;
        }
    });
    return 'owner' + String(max + 1).padStart(3, '0');
}

export const authService = {
    async registerCustomer(data: RegisterData): Promise<Customer> {
        // 1. Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;

        // 2. Create customer document in Firestore
        const customerData: Customer = {
            uid: user.uid,
            name: data.name,
            email: data.email,
            phone: data.phone,
            nic: data.nic,
            role: data.role,
            createdAt: Date.now(), // Store as number (timestamp) to match existing schema
        };

        await setDoc(doc(db, 'customers', user.uid), customerData);

        return customerData;
    },

    async registerOwner(data: RegisterOwnerData): Promise<Owner> {
        // 1. Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;

        // 2. Generate custom ID
        const customId = await getNextOwnerId();

        // 3. Create owner document in Firestore
        const ownerData: Owner = {
            uid: user.uid,
            ownerCustomId: customId,
            name: data.name,
            email: data.email,
            companyName: data.companyName,
            phone: data.phone,
            role: data.role,
            approved: 'pending',
            createdAt: new Date().toISOString(), // User requested Date and Time format
        };

        await setDoc(doc(db, 'owners', user.uid), ownerData);

        return ownerData;
    },

    async loginUser(email: string, password: string, role: 'CUSTOMER' | 'CONDUCTOR' | 'OWNER' | 'ADMIN'): Promise<Customer | Owner | any> {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const uid = user.uid;
        // Always merge uid so AuthContext can store it
        const withUid = (data: any) => ({ uid, ...data });

        if (role === 'CUSTOMER') {
            let customerSnap = await getDoc(doc(db, 'customers', uid));
            if (customerSnap.exists()) return withUid(customerSnap.data() as Customer);
            const q = query(collection(db, 'customers'), where('email', '==', email));
            const querySnap = await getDocs(q);
            if (!querySnap.empty) return withUid(querySnap.docs[0].data() as Customer);

        } else if (role === 'CONDUCTOR') {
            let conductorSnap = await getDoc(doc(db, 'conductors', uid));
            if (conductorSnap.exists()) return withUid({ ...conductorSnap.data(), role: 'CONDUCTOR' });
            const q = query(collection(db, 'conductors'), where('email', '==', email));
            const querySnap = await getDocs(q);
            if (!querySnap.empty) return withUid({ ...querySnap.docs[0].data(), role: 'CONDUCTOR' });

        } else if (role === 'OWNER') {
            let ownerData: Owner | null = null;
            const ownerSnap = await getDoc(doc(db, 'owners', uid));
            if (ownerSnap.exists()) {
                ownerData = ownerSnap.data() as Owner;
            } else {
                const q = query(collection(db, 'owners'), where('email', '==', email));
                const querySnap = await getDocs(q);
                if (!querySnap.empty) ownerData = querySnap.docs[0].data() as Owner;
            }
            if (ownerData) {
                const approved = String(ownerData.approved).toLowerCase();
                if (approved === 'pending') {
                    await authService.logoutUser();
                    throw new Error('Your account is pending approval.');
                } else if (approved === 'rejected') {
                    await authService.logoutUser();
                    throw new Error('Your account has been rejected.');
                }
                return withUid(ownerData);
            }
        } else if (role === 'ADMIN') {
            const adminSnap = await getDoc(doc(db, 'admins', uid));
            if (adminSnap.exists()) return withUid({ ...adminSnap.data(), role: 'ADMIN' });
            const q = query(collection(db, 'admins'), where('email', '==', email));
            const qs = await getDocs(q);
            if (!qs.empty) return withUid({ ...qs.docs[0].data(), role: 'ADMIN' });
        }

        // If the user document was not found in the correct table
        await authService.logoutUser();
        throw new Error('Incorrect email or password for the selected role.');
    },

    async logoutUser(): Promise<void> {
        await signOut(auth);
    },

    getCurrentUser(): Promise<FirebaseUser | null> {
        return new Promise((resolve, reject) => {
            const unsubscribe = onAuthStateChanged(
                auth,
                (user) => {
                    unsubscribe();
                    resolve(user);
                },
                reject
            );
        });
    },

    async getCurrentCustomerProfile(): Promise<Customer | null> {
        const user = await this.getCurrentUser();
        if (!user) return null;

        const docRef = doc(db, 'customers', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as Customer;
        }
        return null;
    }
};

// Admin login (separate from shared login — uses username instead of email)
export const adminLoginWithUsername = async (
  username: string,
  password: string
) => {
  try {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const { collection, query, where, getDocs } = await import('firebase/firestore');

    const q = query(
      collection(db, "admins"),
      where("username", "==", username.trim())
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      throw new Error("User not found");
    }

    const email = snap.docs[0].data().email;

    await signInWithEmailAndPassword(auth, email, password.trim());

    return true;
  } catch (error) {
    console.error(error);
    throw new Error("Invalid User Name or Password");
  }
};
