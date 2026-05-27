import { useState } from "react";
import AdminManageOwners from "./AdminManageOwners";
import ManageSystem from "../ManageSystem";
import TotalIncome from "../TotalIncome";
import OwnerDetails from "../OwnerDetails";
import BookingDetails from "../BookingDetails";
import AdminProfile from "../AdminManageProfile";
import AdminHome from "../AdminHome";
import { useAuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

type PageKey = "home" | "approve" | "manage" | "income" | "owners" | "booking" | "profile";

const NAV_ITEMS: { key: PageKey; label: string }[] = [
  { key: "approve",  label: "Manage Owner Account" },
  { key: "manage",   label: "Manage System" },
  { key: "income",   label: "Total Income" },
  { key: "owners",   label: "View Owner Details" },
  { key: "booking",  label: "View Booking Details" },
  { key: "profile",  label: "Admin Profile" },
];

export default function AdminDashboard() {
  const [page, setPage] = useState<PageKey>("approve");
  const { authUser, logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    await logout();
    navigate("/login");
  };

  const renderPage = () => {
    switch (page) {
      case "home":    return <AdminHome />;
      case "approve": return <AdminManageOwners />;
      case "manage":  return <ManageSystem />;
      case "income":  return <TotalIncome />;
      case "owners":  return <OwnerDetails />;
      case "booking": return <BookingDetails />;
      case "profile": return <AdminProfile />;
      default:        return <AdminManageOwners />;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", fontFamily: "'DM Sans', Arial, sans-serif" }}>

      {/* ── Top Header ── */}
      <header style={{
        flexShrink: 0,
        height: 56,
        background: "#3c73cc",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        zIndex: 100
      }}>
        <h2 style={{ margin: 0, color: "white", fontSize: "1.25rem", fontWeight: 700 }}>
          Admin Dashboard
        </h2>
        <div
          title={authUser?.email}
          style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "rgba(255,255,255,0.25)",
            border: "2px solid rgba(255,255,255,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer"
          }}
          onClick={handleLogout}
        >
          {authUser?.email?.[0]?.toUpperCase() ?? "A"}
        </div>
      </header>

      {/* ── Body: Sidebar + Content ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Sidebar ── */}
        <aside style={{
          width: 220,
          flexShrink: 0,
          background: "white",
          borderRight: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "12px 14px",
          overflowY: "auto"
        }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {NAV_ITEMS.map(item => (
              <button
                key={item.key}
                onClick={() => setPage(item.key)}
                style={{
                  background: "none",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  padding: "9px 10px",
                  textAlign: "center",
                  fontSize: "0.78rem",
                  fontWeight: page === item.key ? 700 : 500,
                  cursor: "pointer",
                  color: page === item.key ? "#3c73cc" : "#374151",
                  borderColor: page === item.key ? "#3c73cc" : "#d1d5db",
                  background: page === item.key ? "#eff6ff" : "white",
                  transition: "all 0.15s",
                } as React.CSSProperties}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            style={{
              background: "#dc2626", color: "white",
              border: "none", borderRadius: 6,
              padding: "10px", fontWeight: 700,
              fontSize: "0.82rem", cursor: "pointer",
              marginTop: 12, transition: "background 0.2s"
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#b91c1c")}
            onMouseLeave={e => (e.currentTarget.style.background = "#dc2626")}
          >
            Logout
          </button>
        </aside>

        {/* ── Main Content ── */}
        <main style={{
          flex: 1,
          overflow: "auto",
          background: "#f4f6fb",
          padding: "24px 28px"
        }}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
