<<<<<<< HEAD
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
=======
import "../styles/dashboard.css";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

type Props = {
  onSelect: (page: string) => void;
};

const Sidebar = ({ onSelect }: Props) => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("approve");

  const handleSelect = (page: string) => {
    setActivePage(page);
    onSelect(page);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <>
      {/* 1. සැබෑ සයිඩ්බාර් එක (Fixed Layout) */}
      <div 
        className="sidebar-container" 
        style={{ 
          width: '260px',
          height: '100vh', 
          position: 'fixed',
          top: 0,
          left: 0,
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
          zIndex: 999 /* හැමදේටම උඩින් තියෙන්න */
        }}
      >
        {/* උඩ කොටස: Brand සහ Menu */}
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          {/* Luxury Brand Header */}
          <div className="sidebar-brand">
            <span className="brand-sparkle">✧</span>
            <h2 className="brand-title">Luxe Transit</h2>
          </div>

          {/* Navigation Menu */}
          <nav className="sidebar-menu" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button 
              className={`menu-item ${activePage === "approve" ? "active" : ""}`} 
              onClick={() => handleSelect("approve")}
            >
              <span className="menu-indicator"></span> Manage Conductors
            </button>
            
            <button 
              className={`menu-item ${activePage === "manage" ? "active" : ""}`} 
              onClick={() => handleSelect("manage")}
            >
              <span className="menu-indicator"></span> Manage Buses & Routes
            </button>
            
            <button 
              className={`menu-item ${activePage === "income" ? "active" : ""}`} 
              onClick={() => handleSelect("income")}
            >
              <span className="menu-indicator"></span> Total Income
            </button>
            
            <button 
              className={`menu-item ${activePage === "owners" ? "active" : ""}`} 
              onClick={() => handleSelect("owners")}
            >
              <span className="menu-indicator"></span> Bus Tracking Details
            </button>
            
            <button 
              className={`menu-item ${activePage === "booking" ? "active" : ""}`} 
              onClick={() => handleSelect("booking")}
            >
              <span className="menu-indicator"></span> View Booking Details
            </button>
          </nav>
        </div>

        {/* පල්ලෙහාම කොටස: Profile & Logout */}
        <div 
          className="sidebar-footer" 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px', 
            paddingTop: '15px' 
          }}
        >
          <button 
            className={`profile-link ${activePage === "profile" ? "active" : ""}`} 
            onClick={() => handleSelect("profile")}
          >
            My Profile
          </button>
          <button className="logout-link" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* 2. 🪄 මැජික් එක: මේකෙන් සයිඩ්බාර් එක පිටිපස්සෙන් 260px ක ඉඩක් වෙන් කරනවා. 
          එතකොට දකුණු පැත්තේ තියෙන කිසිම Form එකක් වමෙන් වැහෙන්නේ නැහැ! */}
      <div style={{ width: '260px', minWidth: '260px', height: '100vh' }}></div>
    </>
>>>>>>> feature/owner
  );
};

export default Sidebar;