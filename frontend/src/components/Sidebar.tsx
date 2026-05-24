import { useState } from "react";
import "../styles/sidebar.css";

type Props = {
  onSelect: (page: string) => void;
  onLogout: () => void;
};

const Sidebar = ({ onSelect, onLogout }: Props) => {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="sidebar">

      {/* 🔹 Navigate to Owner Account Management page */}
      <button onClick={() => onSelect("approve")}>
        Manage Owner Account
      </button>

      {/* 🔹 Navigate to System Management page */}
      <button onClick={() => onSelect("manage")}>
        Manage System
      </button>

      {/* 🔹 Navigate to Total Income page */}
      <button onClick={() => onSelect("income")}>
        Total Income
      </button>

      {/* 🔹 Navigate to Owner Details page */}
      <button onClick={() => onSelect("owners")}>
        View Owner Details
      </button>

      {/* 🔹 Navigate to Booking Details page */}
      <button onClick={() => onSelect("booking")}>
        View Booking Details
      </button>

      {/* 🔹 Navigate to Admin Profile page */}
      <button onClick={() => onSelect("profile")}>
        Admin Profile
      </button>

      {/* 🔹 Logout button (opens confirmation popup) */}
      <button className="logout-btn" onClick={() => setShowPopup(true)}>
        Logout
      </button>

      {/* 🔹 Logout confirmation popup */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Logged out successfully</h3>

            {/* 🔹 Confirm logout and clear session */}
            <button
              onClick={() => {
                setShowPopup(false);
                onLogout();
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;