import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
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
import { secondaryAuth } from "../firebaseConfig";

interface ApproveRejectProps {
  currentOwnerId?: string;
}

const ApproveReject = ({ currentOwnerId = "" }: ApproveRejectProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedBus, setSelectedBus] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const [conductors, setConductors] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);

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

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getNextConId = async () => {
    const snapshot = await getDocs(collection(db, "conductors"));
    return `con${String(snapshot.size + 1).padStart(3, '0')}`;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBus) { showToast("Please select a bus first!", "error"); return; }

    setLoading(true);
    try {
      const nextConId = await getNextConId();
      const authToUse = secondaryAuth || (await import("firebase/auth")).getAuth();
      const userCred = await createUserWithEmailAndPassword(authToUse, email, password);

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

      await updateDoc(doc(db, "buses", selectedBus), { conductorId: nextConId });

      showToast(`${nextConId} registered successfully!`, "success");
      setName(""); setEmail(""); setPassword(""); setPhone(""); setSelectedBus("");
    } catch (err: any) {
      showToast("Registration Error: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Delete conductor ${id}?`)) return;
    try {
      await deleteDoc(doc(db, "conductors", id));
      showToast("Conductor deleted successfully!", "success");
    } catch {
      showToast("Failed to delete conductor.", "error");
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', 'Inter', sans-serif", minHeight: "100vh", background: "#f4f6fb" }}>

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          padding: "12px 24px", borderRadius: "8px", color: "white",
          background: toast.type === "success" ? "#16a34a" : "#dc2626",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          fontSize: "0.9rem", fontWeight: 500,
          animation: "fadeIn 0.3s ease"
        }}>
          {toast.msg}
        </div>
      )}

      {/* Blue header banner */}
      <div style={{
        background: "linear-gradient(90deg, #3b6fd4 0%, #4a80f5 100%)",
        padding: "18px 32px",
        borderRadius: "10px",
        margin: "0 0 28px 0",
        boxShadow: "0 4px 16px rgba(59,111,212,0.18)"
      }}>
        <h1 style={{
          color: "white", margin: 0,
          fontSize: "1.25rem", fontWeight: 700, letterSpacing: "0.01em"
        }}>
          Manage Conductor Accounts
        </h1>
      </div>

      {/* Add New Conductor Card */}
      <div style={{
        background: "white",
        borderRadius: "12px",
        border: "1px solid #e8ecf4",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        padding: "28px 32px",
        marginBottom: "24px"
      }}>
        <h3 style={{
          margin: "0 0 20px 0", fontSize: "0.95rem",
          fontWeight: 600, color: "#374151"
        }}>
          Add New Conductor
        </h3>

        <form onSubmit={handleRegister}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
            <input
              type="text"
              placeholder="Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={inputStyle}
            />
          </div>

          <select
            required
            value={selectedBus}
            onChange={(e) => setSelectedBus(e.target.value)}
            style={{ ...inputStyle, marginBottom: "20px", cursor: "pointer" }}
          >
            <option value="">Assign Bus</option>
            {buses.map(bus => (
              <option key={bus.id} value={bus.id}>{bus.busNo}</option>
            ))}
          </select>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? "#86efac" : "#16a34a",
              color: "white",
              border: "none",
              padding: "11px 24px",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: loading ? "not-allowed" : "pointer",
              letterSpacing: "0.03em",
              transition: "background 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)",
                  borderTopColor: "white", borderRadius: "50%",
                  display: "inline-block", animation: "spin 0.7s linear infinite"
                }} />
                PROCESSING...
              </>
            ) : "ADD NEW CONDUCTOR +"}
          </button>
        </form>
      </div>

      {/* Registered Conductors Table Card */}
      <div style={{
        background: "white",
        borderRadius: "12px",
        border: "1px solid #e8ecf4",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        overflow: "hidden"
      }}>
        <div style={{ padding: "20px 28px", borderBottom: "1px solid #f0f2f8" }}>
          <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: "#374151" }}>
            Registered Conductors ({conductors.length})
          </h3>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8faff" }}>
              {["ID", "Name", "Email", "Action"].map(col => (
                <th key={col} style={{
                  padding: "13px 20px", textAlign: "left",
                  fontSize: "0.8rem", fontWeight: 700,
                  color: "#3b6fd4", textTransform: "uppercase",
                  letterSpacing: "0.06em", borderBottom: "1px solid #eef0f8"
                }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {conductors.length === 0 ? (
              <tr>
                <td colSpan={4} style={{
                  padding: "32px", textAlign: "center",
                  color: "#94a3b8", fontSize: "0.9rem"
                }}>
                  No conductors registered yet.
                </td>
              </tr>
            ) : conductors.map((c, i) => (
              <tr key={c.id} style={{ background: i % 2 === 0 ? "white" : "#fafbff" }}>
                <td style={{ ...tdStyle, fontWeight: 700, color: "#1e293b" }}>
                  {c.conductorId || c.id}
                </td>
                <td style={tdStyle}>{c.name}</td>
                <td style={tdStyle}>{c.email}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => handleDelete(c.id)}
                    style={{
                      background: "none", border: "none",
                      color: "#dc2626", fontWeight: 700,
                      cursor: "pointer", fontSize: "0.875rem",
                      padding: "4px 8px", borderRadius: "4px",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#fee2e2")}
                    onMouseLeave={e => (e.currentTarget.style.background = "none")}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  border: "1px solid #dde4f4",
  borderRadius: "8px",
  fontSize: "0.9rem",
  color: "#1e293b",
  background: "white",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
  fontFamily: "inherit"
};

const tdStyle: React.CSSProperties = {
  padding: "14px 20px",
  fontSize: "0.875rem",
  color: "#374151",
  borderBottom: "1px solid #f0f2f8"
};

export default ApproveReject;
