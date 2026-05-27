import { useEffect, useState } from "react";
import {
  getConvenienceFee,
  updateConvenienceFee,
  getPaymentSettings,
  updatePaymentSettings,
} from "../services/settingsService";

const ManageSystem = () => {
  // Active tab state
  const [tab, setTab] = useState<"fee" | "payment">("fee");

  // Current convenience fee from database
  const [currentFee, setCurrentFee] = useState<number>(0);

  // New fee input value
  const [newFee, setNewFee] = useState<string>("");

  // Payment settings states
  const [cardPayment, setCardPayment] = useState<boolean>(true);
  const [bankTransfer, setBankTransfer] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Toast notification state
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  // Function to show toast message
  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Load system settings
  useEffect(() => {
    const loadData = async () => {
      try {
        const fee = await getConvenienceFee();
        setCurrentFee(Number(fee) || 0);

        const payment = await getPaymentSettings();
        setCardPayment(payment.cardPayment);
        setBankTransfer(payment.bankTransfer);
      } catch (error) {
        showToast("Error loading system settings", "error");
      }
    };

    loadData();
  }, []);

  // Update convenience fee
  const updateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFee.trim() || isNaN(Number(newFee))) {
      showToast("Please enter a valid convenience fee", "error");
      return;
    }

    setLoading(true);
    try {
      await updateConvenienceFee(newFee);
      const updated = await getConvenienceFee();
      setCurrentFee(Number(updated) || 0);
      setNewFee("");
      showToast("Convenience fee updated successfully", "success");
    } catch (err: any) {
      showToast("Update failed: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Save payment settings
  const savePaymentSettings = async () => {
    setLoading(true);
    try {
      await updatePaymentSettings(cardPayment, bankTransfer);
      showToast("Payment settings updated successfully", "success");
    } catch (err: any) {
      showToast("Update failed: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', Arial, sans-serif" }}>
      
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          padding: "12px 24px", borderRadius: 8, color: "white",
          background: toast.type === "success" ? "#16a34a" : "#dc2626",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          fontSize: "0.9rem", fontWeight: 500,
          animation: "fadeIn 0.3s ease"
        }}>
          {toast.msg}
        </div>
      )}

      {/* Blue Header Banner */}
      <div style={{
        background: "linear-gradient(90deg, #3b6fd4 0%, #4a80f5 100%)",
        padding: "18px 28px",
        borderRadius: 10,
        marginBottom: 24,
        boxShadow: "0 4px 16px rgba(59,111,212,0.18)"
      }}>
        <h1 style={{ color: "white", margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>
          Manage System
        </h1>
      </div>

      {/* Tab Buttons Wrapper */}
      <div style={{
        display: "flex",
        gap: 10,
        marginBottom: 20
      }}>
        <button
          onClick={() => setTab("fee")}
          style={{
            padding: "9px 18px",
            borderRadius: 6,
            fontSize: "0.85rem",
            fontWeight: 700,
            cursor: "pointer",
            border: "none",
            backgroundColor: tab === "fee" ? "#3b6fd4" : "#e5e7eb",
            color: tab === "fee" ? "white" : "#4b5563",
            transition: "all 0.2s"
          }}
        >
          Convenience Fee
        </button>
        <button
          onClick={() => setTab("payment")}
          style={{
            padding: "9px 18px",
            borderRadius: 6,
            fontSize: "0.85rem",
            fontWeight: 700,
            cursor: "pointer",
            border: "none",
            backgroundColor: tab === "payment" ? "#3b6fd4" : "#e5e7eb",
            color: tab === "payment" ? "white" : "#4b5563",
            transition: "all 0.2s"
          }}
        >
          Payment Settings
        </button>
      </div>

      {/* Main Container Card */}
      <div style={{
        background: "white",
        borderRadius: 12,
        border: "1px solid #e8ecf4",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        padding: "28px 32px"
      }}>
        
        {/* Convenience Fee Tab Content */}
        {tab === "fee" && (
          <div>
            <h3 style={{
              margin: "0 0 10px 0", fontSize: "0.95rem",
              fontWeight: 600, color: "#374151"
            }}>
              Current Convenience Fee
            </h3>
            
            <div style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#3b6fd4",
              marginBottom: 20
            }}>
              Rs. {currentFee.toLocaleString()}
            </div>

            <form onSubmit={updateFee} style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 350 }}>
              <input
                type="number"
                placeholder="Enter new fee"
                required
                value={newFee}
                onChange={(e) => setNewFee(e.target.value)}
                style={inputStyle}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: "#16a34a",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: loading ? "not-allowed" : "pointer",
                  alignSelf: "flex-start",
                  transition: "background 0.2s"
                }}
                onMouseEnter={e => { if(!loading) e.currentTarget.style.background = "#15803d" }}
                onMouseLeave={e => { if(!loading) e.currentTarget.style.background = "#16a34a" }}
              >
                {loading ? "Updating..." : "Update Fee"}
              </button>
            </form>
          </div>
        )}

        {/* Payment Settings Tab Content */}
        {tab === "payment" && (
          <div>
            <h3 style={{
              margin: "0 0 20px 0", fontSize: "0.95rem",
              fontWeight: 600, color: "#374151"
            }}>
              Payment Settings
            </h3>

            {/* Card Payment Option */}
            <div style={optionRowStyle}>
              <div>
                <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.9rem" }}>Card Payment</div>
                <div style={{ color: "#64748b", fontSize: "0.78rem", marginTop: 2 }}>
                  Secure payments using credit or debit cards
                </div>
              </div>
              <label style={switchStyle}>
                <input
                  type="checkbox"
                  checked={cardPayment}
                  onChange={() => setCardPayment(!cardPayment)}
                  style={{ display: "none" }}
                />
                <span style={{
                  ...sliderStyle,
                  backgroundColor: cardPayment ? "#3b6fd4" : "#cbd5e1"
                }}>
                  <span style={{
                    ...sliderCircleStyle,
                    transform: cardPayment ? "translateX(20px)" : "translateX(0px)"
                  }} />
                </span>
              </label>
            </div>

            {/* Bank Transfer Option */}
            <div style={optionRowStyle}>
              <div>
                <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.9rem" }}>Bank Transfer</div>
                <div style={{ color: "#64748b", fontSize: "0.78rem", marginTop: 2 }}>
                  Direct transfer from your bank account
                </div>
              </div>
              <label style={switchStyle}>
                <input
                  type="checkbox"
                  checked={bankTransfer}
                  onChange={() => setBankTransfer(!bankTransfer)}
                  style={{ display: "none" }}
                />
                <span style={{
                  ...sliderStyle,
                  backgroundColor: bankTransfer ? "#3b6fd4" : "#cbd5e1"
                }}>
                  <span style={{
                    ...sliderCircleStyle,
                    transform: bankTransfer ? "translateX(20px)" : "translateX(0px)"
                  }} />
                </span>
              </label>
            </div>

            <button
              onClick={savePaymentSettings}
              disabled={loading}
              style={{
                background: "#3b6fd4",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.2s",
                marginTop: 20
              }}
              onMouseEnter={e => { if(!loading) e.currentTarget.style.background = "#2563eb" }}
              onMouseLeave={e => { if(!loading) e.currentTarget.style.background = "#3b6fd4" }}
            >
              {loading ? "Saving..." : "Save Settings"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  border: "1px solid #dde4f4",
  borderRadius: "8px",
  fontSize: "0.9rem",
  color: "#1e293b",
  background: "white",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit"
};

const optionRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 0",
  borderBottom: "1px solid #f1f5f9"
};

const switchStyle: React.CSSProperties = {
  position: "relative",
  display: "inline-block",
  width: 44,
  height: 24,
  cursor: "pointer"
};

const sliderStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  borderRadius: 34,
  transition: "0.3s",
  display: "flex",
  alignItems: "center",
  padding: "0 2px"
};

const sliderCircleStyle: React.CSSProperties = {
  height: 20,
  width: 20,
  backgroundColor: "white",
  borderRadius: "50%",
  transition: "0.3s",
  boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
};

export default ManageSystem;