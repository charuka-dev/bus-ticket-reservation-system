<<<<<<< HEAD
import { useEffect, useState } from "react";
import "../styles/approveReject.css";

import {
  subscribeOwners,
  approveOwnerService,
  rejectOwnerService
} from "../services/ApproveRejectService";

import type { Owner } from "../services/ApproveRejectService"; 

const ApproveReject = () => {
  // State to store list of owners
  const [owners, setOwners] = useState<Owner[]>([]);

  // Load owners in real-time when component mounts
  useEffect(() => {
    const unsubscribe = subscribeOwners((data: Owner[]) => {
      setOwners(data);
    });

    // Cleanup subscription when component unmounts
    return () => {
      if (unsubscribe) unsubscribe(); 
    };
  }, []);

  // Function to return CSS class based on owner status
  const getStatusClass = (status: string | undefined) => {
    if (!status) return "pending";
    if (status.toLowerCase() === "approved") return "approved";
    if (status.toLowerCase() === "rejected") return "rejected";
    return "pending";
=======
import { useState, useEffect } from "react";
import "../styles/dashboard.css";
import { db, secondaryAuth } from "../firebaseConfig"; // 🟢 secondaryAuth import කරගන්න
import {
  collection,
  setDoc,
  doc,
  getDocs,
  query,
  where,
  deleteDoc,
  onSnapshot,
  updateDoc
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

interface ApproveRejectProps {
  currentOwnerId: string;
}

const ApproveReject = ({ currentOwnerId }: ApproveRejectProps) => {
  // --- States ---
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedBus, setSelectedBus] = useState("");
  const [loading, setLoading] = useState(false);

  const [conductors, setConductors] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);

  // --- Initial Data Load ---
  useEffect(() => {
    if (!currentOwnerId) return;

    const qConductors = query(collection(db, "conductors"), where("ownerId", "==", currentOwnerId));
    const unsubCon = onSnapshot(qConductors, (snap) => {
      setConductors(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const qBuses = query(collection(db, "buses"), where("ownerId", "==", currentOwnerId));
    const unsubBus = onSnapshot(qBuses, (snap) => {
      setBuses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubCon(); unsubBus(); };
  }, [currentOwnerId]);

  // --- Handlers ---
  const getNextConId = async () => {
    const snapshot = await getDocs(collection(db, "conductors"));
    return `con${String(snapshot.size + 1).padStart(3, '0')}`;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBus) return alert("Please select a bus first!");

    setLoading(true);
    try {
      const nextConId = await getNextConId();
      
      // 🟢 Secondary Auth පාවිච්චි කරලා Conductor ව create කරනවා (Main Auth එකට කිසිම බලපෑමක් නෑ)
      const userCred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      
      // Database Entry
      await setDoc(doc(db, "conductors", nextConId), {
        uid: userCred.user.uid,
        conductorId: nextConId,
        name,
        email,
        phone,
        busId: selectedBus,
        ownerId: currentOwnerId,
        status: "Active",
        createdAt: new Date().toISOString()
      });

      // Assign Bus
      await updateDoc(doc(db, "buses", selectedBus), { conductorId: nextConId });

      alert(`Success! ${nextConId} registered.`);
      
      // Reset Form
      setName(""); setEmail(""); setPassword(""); setPhone(""); setSelectedBus("");
    } catch (err: any) {
      alert("Registration Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Delete ${id}?`)) return;
    try {
      await deleteDoc(doc(db, "conductors", id));
      alert("Deleted successfully!");
    } catch {
      alert("Failed to delete.");
    }
>>>>>>> feature/owner
  };

  return (
    <>
<<<<<<< HEAD
      {/* Top header */}
      <header className="topbar">
        <h2>Manage Owner Accounts</h2>
      </header>

      <main className="dashboard-container">

        {/* Main card section */}
        <section className="card">
          <h3>Registered Owners</h3>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status & Actions</th>
              </tr>
            </thead>

            <tbody>

              {/* If no owners found */}
              {owners.length === 0 ? (
                <tr>
                  <td colSpan={3} className="no-data">
                    No owners found
                  </td>
                </tr>
              ) : (
                // Loop through owners list
                owners.map((o) => (
                  <tr key={o.id}>
                    <td>{o.name}</td>
                    <td>{o.email}</td>

                    <td>
                      <div className="action-container">

                        {/* Status badge */}
                        <span className={`status-badge ${getStatusClass(o.approved)}`}>
                          {o.approved ?? "pending"}
                        </span>

                        {/* Approve button */}
                        <button
                          className="approve-btn"
                          onClick={() => approveOwnerService(o.id)}
                        >
                          Approve
                        </button>

                        {/* Reject button */}
                        <button
                          className="reject-btn"
                          onClick={() => rejectOwnerService(o.id)}
                        >
                          Reject
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}

            </tbody>
          </table>

=======
      <header className="topbar">
        <h2>Manage Conductor Accounts</h2>
      </header>

      <main className="content">
        <section className="card">
          <h3 style={{ marginBottom: "15px" }}>Add New Conductor</h3>
          <form onSubmit={handleRegister}>
            <input type="text" placeholder="Full Name" required value={name} onChange={(e) => setName(e.target.value)} />
            <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <input type="text" placeholder="Phone" required value={phone} onChange={(e) => setPhone(e.target.value)} />
            
            <select required value={selectedBus} onChange={(e) => setSelectedBus(e.target.value)}>
              <option value="">Assign Bus</option>
              {buses.map(bus => (
                <option key={bus.id} value={bus.id}>{bus.busNo}</option>
              ))}
            </select>

            <button type="submit" className="add-btn" disabled={loading}>
              {loading ? "PROCESSING..." : "ADD NEW CONDUCTOR +"}
            </button>
          </form>
        </section>

        <section className="card" style={{ marginTop: "20px" }}>
          <h3>Registered Conductors ({conductors.length})</h3>
          <table>
            <thead>
              <tr><th>ID</th><th>Name</th><th>Email</th><th>Action</th></tr>
            </thead>
            <tbody>
              {conductors.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.id}</strong></td>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>
                    <button onClick={() => handleDelete(c.id)} className="delete-btn">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
>>>>>>> feature/owner
        </section>
      </main>
    </>
  );
};

export default ApproveReject;