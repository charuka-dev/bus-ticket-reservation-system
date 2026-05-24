<<<<<<< HEAD
<<<<<<< HEAD
import { useEffect, useState } from "react";
import "./styles/App.css";
=======
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./styles/dashboard.css";

import { db, auth } from "./firebaseConfig"; 
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";

import { ToastProvider } from './contexts/ToastContext'; 
import Login from "./pages/Login";
import Register from "./pages/Register";
>>>>>>> feature/owner

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

<<<<<<< HEAD
import AdminHome from "./pages/AdminHome";
import ApproveReject from "./pages/ApproveReject";
import ManageSystem from "./pages/ManageSystem";
import TotalIncome from "./pages/TotalIncome";
import OwnerDetails from "./pages/OwnerDetails";
import BookingDetails from "./pages/BookingDetails";
import Login from "./pages/login";
import AdminProfile from "./pages/AdminManageProfile";

function App() {
  // login state
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // active page state
  const [page, setPage] = useState<string>("home");

  // 🔥 check login status when app loads (refresh fix)
  useEffect(() => {
    const savedLogin = localStorage.getItem("isLoggedIn");

    if (savedLogin === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  // login success handler
  const handleLogin = () => {
    localStorage.setItem("isLoggedIn", "true"); // save login
    setIsLoggedIn(true);
  };

  // logout handler
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn"); // remove login
    setIsLoggedIn(false);
    setPage("home");
  };

  // if not logged in show login page
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  // page switcher
  const renderPage = () => {
    switch (page) {
      case "home":
        return <AdminHome />;
      case "approve":
        return <ApproveReject />;
      case "manage":
        return <ManageSystem />;
      case "income":
        return <TotalIncome />;
      case "owners":
        return <OwnerDetails />;
      case "booking":
        return <BookingDetails />;
      case "profile":
        return <AdminProfile />;
      default:
        return <AdminHome />;
    }
  };

  return (
    <div>
      <Header />

      <div className="main-layout">
        {/* sidebar navigation */}
        <Sidebar onSelect={setPage} onLogout={handleLogout} />

        {/* main content */}
        <div className="content">{renderPage()}</div>
      </div>
    </div>
  );
}

export default App;
=======
﻿import ConductorApp from './conductor/App';

export default ConductorApp;

>>>>>>> feature/conductor
=======
import ApproveReject from "./pages/ApproveReject"; 
import ManageSystem from "./pages/BusesRoutes";    
import TotalIncome from "./pages/TotalIncome";      
import OwnerDetails from "./pages/BusTrackingDetails"; 
import BookingDetails from "./pages/BookingDetails"; 
import OwnerProfile from "./pages/OwnerProfile";  

function App() {
  const [page, setPage] = useState<string>("approve");
  const [user, setUser] = useState<any>(null);
  const [ownerStatus, setOwnerStatus] = useState<string | null>(null); 
  const [currentOwnerCustomId, setCurrentOwnerCustomId] = useState<string>(""); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubStatus: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (unsubStatus) {
        unsubStatus();
        unsubStatus = null;
      }

      if (currentUser?.email) {
        const q = query(collection(db, "owners"), where("email", "==", currentUser.email));
        
        unsubStatus = onSnapshot(q, (querySnapshot) => {
          if (!querySnapshot.empty) {
            const ownerDoc = querySnapshot.docs[0];
            const ownerData = ownerDoc.data();
            
            const ownerId = ownerDoc.id;
            setCurrentOwnerCustomId(ownerId);
            localStorage.setItem("ownerId", ownerId); // Profile එකට පාවිච්චි කරන්න

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
      } else {
        setOwnerStatus(null);
        setCurrentOwnerCustomId("");
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubStatus) unsubStatus();
    };
  }, []);

  const renderDashboardPage = () => {
    switch (page) {
      case "approve": return <ApproveReject currentOwnerId={currentOwnerCustomId} />;
      case "manage":  return <ManageSystem currentOwnerId={currentOwnerCustomId} />;
      case "income":  return <TotalIncome currentOwnerId={currentOwnerCustomId} />;
      case "owners":  return <OwnerDetails currentOwnerId={currentOwnerCustomId} />;
      case "booking": return <BookingDetails currentOwnerId={currentOwnerCustomId} />;
      case "profile": return <OwnerProfile ownerId={currentOwnerCustomId} />;
      default:        return <ApproveReject currentOwnerId={currentOwnerCustomId} />; 
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white font-bold">
        Loading Application Flows...
      </div>
    );
  }

  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

          <Route 
            path="/" 
            element={
              user ? (
                ownerStatus === "Approved" ? (
                  <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50">
                    <Header />
                    <div className="main-layout flex flex-1 overflow-hidden">
                      <Sidebar onSelect={setPage} />
                      <main className="content flex-1 overflow-y-auto p-6">
                        {renderDashboardPage()}
                      </main>
                    </div>
                  </div>
                ) : (
                  <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 p-6 text-center">
                    <div className="card" style={{ maxWidth: "500px", padding: "40px", background: "white", borderRadius: "16px" }}>
                      <h2 style={{ color: "#eab308", marginBottom: "15px", fontSize: "24px" }}>⚠️ Account Pending</h2>
                      <p>Hi <strong>{user.email}</strong>, please wait for admin approval.</p>
                      <button onClick={() => auth.signOut()} style={{ marginTop: "20px", padding: "10px 20px", background: "#dc2626", color: "white", border: "none", borderRadius: "8px" }}>Log Out</button>
                    </div>
                  </div>
                )
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
>>>>>>> feature/owner
