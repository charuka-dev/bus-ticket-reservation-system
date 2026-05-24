import "../styles/login.css";
import { useState } from "react";
import { adminLoginWithUsername } from "../services/authService";

import { FaBus, FaTicketAlt, FaCogs, FaEye, FaEyeSlash } from "react-icons/fa";

type Props = {
  onLogin: () => void;
};

const Login = ({ onLogin }: Props) => {
  // Username input state
  const [username, setUsername] = useState("");

  // Password input state
  const [password, setPassword] = useState("");

  // Show / hide password toggle
  const [showPassword, setShowPassword] = useState(false);

  // Success popup control
  const [showSuccess, setShowSuccess] = useState(false);

  // Error popup control
  const [showError, setShowError] = useState(false);

  // Handle login button click
  const handleLogin = async () => {
    // Validate empty fields
    if (!username.trim() || !password.trim()) {
      setShowError(true);
      return;
    }

    try {
      // Call login service
      await adminLoginWithUsername(username, password);

      // Show success popup if login works
      setShowSuccess(true);
    } catch (error) {
      // Show error popup if login fails
      console.error(error);
      setShowError(true);
    }
  };

  return (
    <div className="login-container">

      {/* LEFT PANEL */}
      <div className="login-left">
        <h1>Bus Ticket Reservation System</h1>

        <p className="subtitle">Smart Admin Control Panel</p>

        {/* Feature list section */}
        <div className="feature-list">

          {/* Feature 1 */}
          <div className="feature-item">
            <FaTicketAlt className="icon" />
            <span>Manage Bookings</span>
          </div>

          {/* Feature 2 */}
          <div className="feature-item">
            <FaBus className="icon" />
            <span>Payments & Income Tracking</span>
          </div>

          {/* Feature 3 */}
          <div className="feature-item">
            <FaCogs className="icon" />
            <span>System Settings</span>
          </div>

        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="login-right">
        <div className="login-card">

          {/* Login title */}
          <h2>Admin Login</h2>

          {/* Username input */}
          <label>User Name</label>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          {/* Password label */}
          <label>Password</label>

          {/* Password input with show/hide icon */}
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* Toggle password visibility */}
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Login button */}
          <button onClick={handleLogin}>
            Sign In
          </button>

        </div>
      </div>

      {/* SUCCESS POPUP */}
      {showSuccess && (
        <div className="popup-overlay">
          <div className="popup-box success">
            <h3>Login Successful ✅</h3>
            <button
              onClick={() => {
                setShowSuccess(false);
                onLogin();
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* ERROR POPUP */}
      {showError && (
        <div className="popup-overlay">
          <div className="popup-box error">
            <h3>Invalid Username or Password ❌</h3>
            <button onClick={() => setShowError(false)}>
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;