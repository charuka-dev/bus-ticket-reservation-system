import { useEffect, useState } from "react";
import "./styles/App.css";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

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