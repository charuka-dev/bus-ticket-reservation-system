import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";
import "../../styles/header.css";

export default function AdminHeader() {
  const { authUser, logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <h2>Admin Dashboard</h2>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>{authUser?.email}</span>
        <div
          style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "rgba(255,255,255,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", border: "2px solid rgba(255,255,255,0.5)"
          }}
          onClick={handleLogout}
          title="Logout"
        >
          {authUser?.email?.[0]?.toUpperCase() ?? "A"}
        </div>
      </div>
    </div>
  );
}
