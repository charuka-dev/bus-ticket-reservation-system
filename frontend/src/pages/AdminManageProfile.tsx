import React, { useState, useRef, useEffect } from "react";
import "../styles/manageProfile.css";

import {
  updateAdminProfile,
  uploadProfileImage,
  getAdminProfileImage
} from "../services/adminProfileService";

import { FaEye, FaEyeSlash, FaCamera } from "react-icons/fa";

const AdminProfile = () => {
  // Input states
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Show/Hide password toggles
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Profile image states
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Loading state for save button
  const [loading, setLoading] = useState(false);

  // Popup message state
  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: ""
  });

  const email = "dinithasankalpa8@gmail.com";

  // Reference for hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load profile image when component first renders
  useEffect(() => {
    const loadImage = async () => {
      const img = await getAdminProfileImage(email);
      if (img) setProfileImage(img);
    };

    loadImage();
  }, []);

  // Handle image selection from device
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);

    // Show preview of selected image
    setProfileImage(URL.createObjectURL(file));
  };

  // Save profile changes (username, password, image)
  const handleSave = async () => {
    try {
      setLoading(true);

      // Check if user changed anything
      const hasUsername = !!username.trim();
      const hasCurrentDoc = !!currentPassword.trim();
      const hasNewDoc = !!newPassword.trim();

      const isTryingToUpdateCredentials =
        hasUsername || hasCurrentDoc || hasNewDoc;

      // Validation: nothing changed
      if (!isTryingToUpdateCredentials && !imageFile) {
        setPopup({
          show: true,
          message: "Please fill fields or change profile image before saving!",
          type: "error"
        });
        return;
      }

      // Validation: incomplete credential update
      if (isTryingToUpdateCredentials) {
        if (!hasUsername) {
          setPopup({ show: true, message: "Please enter Username!", type: "error" });
          return;
        }
        if (!hasCurrentDoc) {
          setPopup({ show: true, message: "Please enter Current Password!", type: "error" });
          return;
        }
        if (!hasNewDoc) {
          setPopup({ show: true, message: "Please enter New Password!", type: "error" });
          return;
        }
      }

      // Upload image first if selected
      if (imageFile) {
        await uploadProfileImage(email, imageFile);
        setImageFile(null);
      }

      // Update profile data if needed
      if (isTryingToUpdateCredentials) {
        await updateAdminProfile(
          email,
          username,
          currentPassword,
          newPassword
        );
      }

      // Reload latest image from database
      const latest = await getAdminProfileImage(email);
      setProfileImage(latest);

      // Clear input fields after save
      setUsername("");
      setCurrentPassword("");
      setNewPassword("");

      // Success popup
      setPopup({
        show: true,
        message: "Profile Updated Successfully!",
        type: "success"
      });

    } catch (error: any) {
      console.error(error);

      // Default error message
      let errorMsg = "Update Failed!";

      // Wrong password error handling
      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        errorMsg = "Current password you entered is incorrect!";
      }

      // Error popup
      setPopup({
        show: true,
        message: errorMsg,
        type: "error"
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-profile-wrapper">

      {/* Main profile card */}
      <div className="admin-profile-card">

        {/* LEFT SIDE: Profile image section */}
        <div className="profile-left-panel">
          <div className="profile-avatar-wrapper">

            {/* Profile image */}
            <img
              src={
                profileImage ||
                "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              }
              className="profile-avatar-img"
              alt="Profile"
            />

            {/* Camera icon to change image */}
            <div
              className="camera-icon"
              onClick={() => fileInputRef.current?.click()}
            >
              <FaCamera />
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              hidden
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
        </div>

        {/* RIGHT SIDE: Form section */}
        <div className="profile-right-panel">

          {/* Title */}
          <h2 className="profile-name">ADMIN PROFILE</h2>
          <p className="profile-role">SYSTEM ADMINISTRATOR</p>

          <div className="profile-form">

            {/* Username field */}
            <div className="form-group">
              <label>Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
            </div>

            {/* Password fields */}
            <div className="form-row">

              {/* Current password */}
              <div className="form-group">
                <label>Current Password</label>
                <div className="password-input">
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                  <span
                    className="eye-inside"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                  >
                    {showCurrentPass ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>

              {/* New password */}
              <div className="form-group">
                <label>New Password</label>
                <div className="password-input">
                  <input
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                  <span
                    className="eye-inside"
                    onClick={() => setShowNewPass(!showNewPass)}
                  >
                    {showNewPass ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>

            </div>

            {/* Save button */}
            <button onClick={handleSave} disabled={loading} className="save-btn">
              {loading ? "SAVING..." : "SAVE CHANGES"}
            </button>

          </div>
        </div>
      </div>

      {/* Popup message */}
      {popup.show && (
        <div className="popup-overlay">
          <div className={`popup-box ${popup.type}`}>
            <p>{popup.message}</p>
            <button
              onClick={() =>
                setPopup({ show: false, message: "", type: "" })
              }
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;