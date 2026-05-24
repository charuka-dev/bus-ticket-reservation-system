<<<<<<< HEAD
import  { useState, useEffect } from "react";
import "../styles/header.css";
import { getAdminProfileImage } from "../services/adminProfileService";

const Header = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Admin email used to fetch profile image from Firestore
  const email = "dinithasankalpa8@gmail.com";

  // Load profile image when component is first rendered
  useEffect(() => {
    const loadHeaderImage = async () => {
      // Fetch profile image from service
      const img = await getAdminProfileImage(email);

      // Set image to state if it exists
      if (img) setProfileImage(img);
    };

    loadHeaderImage();
  }, []);

  return (
    <div className="dashboard-header">
      {/* Dashboard title */}
      <h2>Admin Dashboard</h2>

      {/* Profile image container */}
      <div className="header-profile-container">
        <img
          src={
            profileImage ||
            "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          }
          className="header-profile-img"
          alt="Admin Profile"
        />

        {/* Active status indicator dot */}
        <span className="active-status-dot"></span>
      </div>
=======
import "../styles/dashboard.css";

const Header = () => {
  return (
    <div style={{ padding: "15px", background: "#3c73cc", color: "white" }}>
      <h2>Owner Dashboard</h2>
>>>>>>> feature/owner
    </div>
  );
};

<<<<<<< HEAD
export default Header;
=======
export default Header;
>>>>>>> feature/owner
