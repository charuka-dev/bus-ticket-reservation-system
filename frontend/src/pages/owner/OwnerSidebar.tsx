import "../../styles/dashboard.css";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

type Props = {
  onSelect: (page: string) => void;
};

const OwnerSidebar = ({ onSelect }: Props) => {
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
          zIndex: 999
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <div className="sidebar-brand">
            <span className="brand-sparkle">✧</span>
            <h2 className="brand-title">Luxe Transit</h2>
          </div>

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

      <div style={{ width: '260px', minWidth: '260px', height: '100vh' }}></div>
    </>
  );
};

export default OwnerSidebar;
