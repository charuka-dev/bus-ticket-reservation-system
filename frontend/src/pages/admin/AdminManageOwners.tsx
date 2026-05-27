import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

interface Owner {
  id: string;
  name: string;
  email: string;
  approved?: boolean | string;
  status?: string;
}

const isApproved = (o: Owner) =>
  o.approved === true ||
  String(o.approved).toLowerCase() === "approved" ||
  String(o.status).toLowerCase() === "approved";

export default function AdminManageOwners() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "owners"), (snap) => {
      setOwners(snap.docs.map(d => ({ id: d.id, ...d.data() } as Owner)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, "owners", id), { approved: true, status: "Approved" });
      showToast("Owner approved successfully!", "success");
    } catch {
      showToast("Failed to approve owner.", "error");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateDoc(doc(db, "owners", id), { approved: false, status: "Rejected" });
      showToast("Owner rejected.", "success");
    } catch {
      showToast("Failed to reject owner.", "error");
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', Arial, sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          padding: "12px 24px", borderRadius: 8, color: "white",
          background: toast.type === "success" ? "#16a34a" : "#dc2626",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          fontSize: "0.9rem", fontWeight: 500
        }}>
          {toast.msg}
        </div>
      )}

      {/* Blue banner header */}
      <div style={{
        background: "linear-gradient(90deg, #3b6fd4 0%, #4a80f5 100%)",
        padding: "18px 28px",
        borderRadius: 10,
        marginBottom: 24,
        boxShadow: "0 4px 16px rgba(59,111,212,0.18)"
      }}>
        <h1 style={{ color: "white", margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>
          Manage Owner Accounts
        </h1>
      </div>

      {/* Table card */}
      <div style={{
        background: "white",
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        overflow: "hidden"
      }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #f0f2f8" }}>
          <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: "#374151" }}>
            Registered Owners
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
            Loading owners…
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8faff" }}>
                {["Name", "Email", "Status & Actions"].map(col => (
                  <th key={col} style={{
                    padding: "12px 20px", textAlign: "left",
                    fontSize: "0.8rem", fontWeight: 700,
                    color: "#3b6fd4", letterSpacing: "0.05em",
                    borderBottom: "1px solid #eef0f8"
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {owners.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>
                    No owners registered yet.
                  </td>
                </tr>
              ) : owners.map((owner, i) => (
                <tr key={owner.id} style={{ background: i % 2 === 0 ? "white" : "#fafbff" }}>
                  <td style={tdStyle}>{owner.name || "—"}</td>
                  <td style={tdStyle}>{owner.email || "—"}</td>
                  <td style={{ ...tdStyle, display: "flex", alignItems: "center", gap: 10 }}>
                    {/* Status badge */}
                    <span style={{
                      padding: "3px 10px",
                      borderRadius: 4,
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      background: isApproved(owner) ? "#dcfce7" : "#fee2e2",
                      color: isApproved(owner) ? "#15803d" : "#991b1b",
                      letterSpacing: "0.04em"
                    }}>
                      {isApproved(owner) ? "APPROVED" : "PENDING"}
                    </span>

                    {/* Approve button */}
                    <button
                      onClick={() => handleApprove(owner.id)}
                      style={{
                        background: "#16a34a", color: "white",
                        border: "none", borderRadius: 5,
                        padding: "5px 14px", fontWeight: 700,
                        fontSize: "0.8rem", cursor: "pointer",
                        transition: "background 0.2s"
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#15803d")}
                      onMouseLeave={e => (e.currentTarget.style.background = "#16a34a")}
                    >
                      Approve
                    </button>

                    {/* Reject button */}
                    <button
                      onClick={() => handleReject(owner.id)}
                      style={{
                        background: "#dc2626", color: "white",
                        border: "none", borderRadius: 5,
                        padding: "5px 14px", fontWeight: 700,
                        fontSize: "0.8rem", cursor: "pointer",
                        transition: "background 0.2s"
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#b91c1c")}
                      onMouseLeave={e => (e.currentTarget.style.background = "#dc2626")}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const tdStyle: React.CSSProperties = {
  padding: "13px 20px",
  fontSize: "0.875rem",
  color: "#374151",
  borderBottom: "1px solid #f0f2f8"
};
