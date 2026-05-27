import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../firebase";

import Header from "../../components/Header";
import OwnerSidebar from "./OwnerSidebar";

import ApproveReject from "../ApproveReject";
import ManageSystem from "../BusesRoutes";
import TotalIncome from "../TotalIncome";
import OwnerDetails from "../BusTrackingDetails";
import BookingDetails from "../BookingDetails";
import OwnerProfile from "../OwnerProfile";
import { useAuthContext } from "../../contexts/AuthContext";

export default function OwnerDashboard() {
  const [page, setPage] = useState<string>("approve");
  const [ownerStatus, setOwnerStatus] = useState<string | null>(null);
  const [currentOwnerCustomId, setCurrentOwnerCustomId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { authUser } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authUser) {
      navigate("/login");
      return;
    }

    const q = query(collection(db, "owners"), where("email", "==", authUser.email));

    const unsubStatus = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const ownerDoc = querySnapshot.docs[0];
        const ownerData = ownerDoc.data();

        const ownerId = ownerDoc.id;
        setCurrentOwnerCustomId(ownerId);
        localStorage.setItem("ownerId", ownerId);

        const isApproved =
          ownerData.approved === true ||
          String(ownerData.approved).toLowerCase() === "approved" ||
          String(ownerData.status).toLowerCase() === "approved";

        setOwnerStatus(isApproved ? "Approved" : "Pending");
      } else {
        setOwnerStatus("Pending");
        setCurrentOwnerCustomId("");
      }
      setLoading(false);
    }, (error) => {
      console.error("Status fetch error:", error);
      setLoading(false);
    });

    return () => unsubStatus();
  }, [authUser, navigate]);

  const renderDashboardPage = () => {
    switch (page) {
      case "approve": return <ApproveReject currentOwnerId={currentOwnerCustomId} />;
      case "manage":  return <ManageSystem currentOwnerId={currentOwnerCustomId} />;
      case "income":  return <TotalIncome currentOwnerId={currentOwnerCustomId} />;
      case "owners":  return <OwnerDetails busId={currentOwnerCustomId || "bus006"} />;
      case "booking": return <BookingDetails currentOwnerId={currentOwnerCustomId} />;
      case "profile": return <OwnerProfile ownerId={currentOwnerCustomId} />;
      default:        return <ApproveReject currentOwnerId={currentOwnerCustomId} />;
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white font-bold">
        Loading Owner Dashboard...
      </div>
    );
  }

  if (ownerStatus !== "Approved") {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 p-6 text-center">
        <div style={{ maxWidth: "500px", padding: "40px", background: "white", borderRadius: "16px" }}>
          <h2 style={{ color: "#eab308", marginBottom: "15px", fontSize: "24px" }}>⚠️ Account Pending</h2>
          <p>Hi <strong>{authUser?.email}</strong>, your account is awaiting admin approval.</p>
          <button
            onClick={() => auth.signOut()}
            style={{ marginTop: "20px", padding: "10px 20px", background: "#dc2626", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50">
      <Header />
      <div className="main-layout flex flex-1 overflow-hidden">
        <OwnerSidebar onSelect={setPage} />
        <main className="content flex-1 overflow-y-auto p-6">
          {renderDashboardPage()}
        </main>
      </div>
    </div>
  );
}
