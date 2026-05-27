import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";
import "../../styles/sidebar.css";

type Props = {
  onSelect: (page: string) => void;
};

const AdminSidebar = ({ onSelect }: Props) => {
  const [showPopup, setShowPopup] = useState(false);
  const { logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogoutConfirm = async () => {
    setShowPopup(false);
    await logout();
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <button onClick={() => onSelect("approve")}>
        Manage Owner Account
      </button>

      <button onClick={() => onSelect("manage")}>
        Manage System
      </button>

      <button onClick={() => onSelect("income")}>
        Total Income
      </button>

      <button onClick={() => onSelect("owners")}>
        View Owner Details
      </button>

      <button onClick={() => onSelect("booking")}>
        View Booking Details
      </button>

      <button onClick={() => onSelect("profile")}>
        Admin Profile
      </button>

      <button className="logout-btn" onClick={() => setShowPopup(true)}>
        Logout
      </button>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Are you sure you want to logout?</h3>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "10px" }}>
              <button onClick={handleLogoutConfirm} style={{ background: "#dc2626", color: "white", border: "none", padding: "8px 20px", borderRadius: "6px", cursor: "pointer" }}>
                Logout
              </button>
              <button onClick={() => setShowPopup(false)} style={{ background: "#6b7280", color: "white", border: "none", padding: "8px 20px", borderRadius: "6px", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSidebar;
