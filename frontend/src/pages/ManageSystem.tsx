import { useEffect, useState } from "react";
import "../styles/manageSystem.css";
import "../styles/dashboard.css";

import {
  getConvenienceFee,
  updateConvenienceFee,
  getPaymentSettings,
  updatePaymentSettings,
} from "../services/settingsService";

const ManageSystem = () => {
  // Active tab state (fee or payment settings)
  const [tab, setTab] = useState<"fee" | "payment">("fee");

  // Current convenience fee from database
  const [currentFee, setCurrentFee] = useState<number>(0);

  // New fee input value
  const [newFee, setNewFee] = useState<string>("");

  // Payment settings states
  const [cardPayment, setCardPayment] = useState<boolean>(true);
  const [bankTransfer, setBankTransfer] = useState<boolean>(false);

  // Popup message state
  const [popup, setPopup] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  // Function to show popup message temporarily
  const showPopup = (message: string, type: "success" | "error") => {
    setPopup({ show: true, message, type });

    // Auto hide popup after 2.5 seconds
    setTimeout(() => {
      setPopup({ show: false, message: "", type: "success" });
    }, 2500);
  };

  // Load system settings when component loads
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load convenience fee
        const fee = await getConvenienceFee();
        setCurrentFee(Number(fee) || 0);

        // Load payment settings
        const payment = await getPaymentSettings();
        setCardPayment(payment.cardPayment);
        setBankTransfer(payment.bankTransfer);
      } catch (error) {
        showPopup("Error loading data", "error");
      }
    };

    loadData();
  }, []);

  // Update convenience fee
  const updateFee = async () => {
    // Validate input
    if (!newFee.trim()) {
      showPopup("Enter valid fee", "error");
      return;
    }

    try {
      // Save new fee to database
      await updateConvenienceFee(newFee);

      // Reload updated fee
      const updated = await getConvenienceFee();
      setCurrentFee(Number(updated) || 0);

      // Clear input field
      setNewFee("");

      // Success message
      showPopup("Fee updated successfully", "success");
    } catch {
      // Error message
      showPopup("Update failed", "error");
    }
  };

  // Save payment settings
  const savePaymentSettings = async () => {
    try {
      await updatePaymentSettings(cardPayment, bankTransfer);
      showPopup("Payment settings updated", "success");
    } catch {
      showPopup("Update failed", "error");
    }
  };

  return (
    <div>

      {/* HEADER */}
      <header className="topbar">
        <h2>Manage System</h2>
      </header>

      {/* TAB BUTTONS */}
      <div className="income-button-wrapper">

        {/* Fee tab button */}
        <button
          className={`income-btn ${tab === "fee" ? "active" : ""}`}
          onClick={() => setTab("fee")}
        >
          Convenience Fee
        </button>

        {/* Payment settings tab button */}
        <button
          className={`income-btn ${tab === "payment" ? "active" : ""}`}
          onClick={() => setTab("payment")}
        >
          Payment Settings
        </button>

      </div>

      {/* MAIN CONTENT */}
      <main className="dashboard-container">

        {/* ===== CONVENIENCE FEE SECTION ===== */}
        {tab === "fee" && (
          <section className="card highlight">

            <h3>Current Convenience Fee</h3>

            {/* Display current fee */}
            <p className="value">Rs. {currentFee}</p>

            {/* Input for new fee */}
            <input
              className="fee-input"
              type="number"
              value={newFee}
              onChange={(e) => setNewFee(e.target.value)}
              placeholder="Enter new fee"
            />

            {/* Update fee button */}
            <button className="update-fee-btn" onClick={updateFee}>
              Update Fee
            </button>

          </section>
        )}

        {/* ===== PAYMENT SETTINGS SECTION ===== */}
        {tab === "payment" && (
          <section className="card">

            <h3>Payment Settings</h3>

            {/* CARD PAYMENT OPTION */}
            <div className="payment-row">

              <div>
                <span className="payment-title">Card Payment</span>
                <p className="payment-sub">
                  Secure payments using credit or debit cards
                </p>
              </div>

              {/* Toggle switch for card payment */}
              <label className="switch">
                <input
                  type="checkbox"
                  checked={cardPayment}
                  onChange={() => setCardPayment(!cardPayment)}
                />
                <span className="slider"></span>
              </label>

            </div>

            {/* BANK TRANSFER OPTION */}
            <div className="payment-row">

              <div>
                <span className="payment-title">Bank Transfer</span>
                <p className="payment-sub">
                  Direct transfer from your bank account
                </p>
              </div>

              {/* Toggle switch for bank transfer */}
              <label className="switch">
                <input
                  type="checkbox"
                  checked={bankTransfer}
                  onChange={() => setBankTransfer(!bankTransfer)}
                />
                <span className="slider"></span>
              </label>

            </div>

            {/* Save settings button */}
            <button className="save-payment-btn" onClick={savePaymentSettings}>
              Save Settings
            </button>

          </section>
        )}

      </main>

      {/* POPUP MESSAGE */}
      {popup.show && (
        <div className="popup-overlay">
          <div className={`popup-box ${popup.type}`}>
            <p>{popup.message}</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageSystem;