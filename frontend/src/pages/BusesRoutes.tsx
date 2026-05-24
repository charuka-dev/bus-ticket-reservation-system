import { useState, useEffect } from "react";
import "../styles/dashboard.css";
import { db } from "../firebaseConfig";
import {
  collection,
  setDoc,
  doc,
  getDocs,
  query,
  where,
  onSnapshot,
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";

interface ManageSystemProps {
  currentOwnerId: string;
}

const ManageSystem = ({ currentOwnerId }: ManageSystemProps) => {
  // --- States ---
  const [activeTab, setActiveTab] = useState<"buses" | "staff">("buses");
  const [loading, setLoading] = useState(false);
  
  // Data Lists
  const [buses, setBuses] = useState<any[]>([]);
  const [conductors, setConductors] = useState<any[]>([]);
  const [dailyAssignments, setDailyAssignments] = useState<any[]>([]);

  // Form States for Bus & Route
  const [busNo, setBusNo] = useState("");
  const [capacity, setCapacity] = useState("");
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [distance, setDistance] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [price, setPrice] = useState("");

  // Form States for Staff Assignment
  const [selectedBusId, setSelectedBusId] = useState("");
  const [selectedConductorId, setSelectedConductorId] = useState("");

  const todayDate = new Date().toISOString().split("T")[0]; // "2026-05-23" වගේ format එකක් එන්නේ

  // 1. Real-time Fetching: Buses
  useEffect(() => {
    if (!currentOwnerId) return;

    const qBuses = query(collection(db, "buses"), where("ownerId", "==", currentOwnerId));
    const unsubscribe = onSnapshot(qBuses, (snapshot) => {
      const bList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBuses(bList);
    });

    return () => unsubscribe();
  }, [currentOwnerId]);

  // 2. Real-time Fetching: Conductors (ලියාපදිංචි කොන්දොස්තරලා ගන්න)
  useEffect(() => {
    if (!currentOwnerId) return;

    const qConductors = query(collection(db, "conductors"), where("ownerId", "==", currentOwnerId));
    const unsubscribe = onSnapshot(qConductors, (snapshot) => {
      const cList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setConductors(cList);
    });

    return () => unsubscribe();
  }, [currentOwnerId]);

  // 3. Real-time Fetching: Today's Daily Assignments
  useEffect(() => {
    if (!currentOwnerId) return;

    const qAssignments = query(
      collection(db, "daily_assignments"),
      where("ownerId", "==", currentOwnerId),
      where("date", "==", todayDate)
    );

    const unsubscribe = onSnapshot(qAssignments, (snapshot) => {
      const aList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setDailyAssignments(aList);
    });

    return () => unsubscribe();
  }, [currentOwnerId, todayDate]);


  // --- ID Generators ---
  const getNextRouteId = async () => {
    const snapshot = await getDocs(collection(db, "routes"));
    return `route${String(snapshot.size + 1).padStart(3, "0")}`;
  };

  const getNextBusId = async () => {
    const snapshot = await getDocs(collection(db, "buses"));
    return `bus${String(snapshot.size + 1).padStart(3, "0")}`;
  };


  // --- Handlers for Tab 1: Buses & Routes ---
  const handleSaveBusAndRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOwnerId) return alert("Owner session error! Please re-login.");

    setLoading(true);
    try {
      const nextRouteId = await getNextRouteId();
      const nextBusId = await getNextBusId();
      const routeString = `${fromLocation} → ${toLocation}`;

      await setDoc(doc(db, "routes", nextRouteId), {
        routeId: nextRouteId,
        from: fromLocation,
        to: toLocation,
        distance: Number(distance),
        estimatedTime: estimatedTime,
        price: Number(price)
      });

      await setDoc(doc(db, "buses", nextBusId), {
        busId: nextBusId,
        busNo: busNo,
        capacity: Number(capacity),
        ownerId: currentOwnerId,
        conductorId: "", 
        routeId: nextRouteId, 
        routeName: routeString, 
        status: "Active"
      });

      alert(`Bus ${busNo} and Route added successfully!`);
      
      setBusNo(""); setCapacity(""); setFromLocation(""); setToLocation(""); 
      setDistance(""); setEstimatedTime(""); setPrice("");

    } catch (error: any) {
      alert("Error saving: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBus = async (bus: any) => {
    if (!window.confirm(`Are you sure you want to delete bus ${bus.busNo}?`)) return;

    try {
      await deleteDoc(doc(db, "buses", bus.id));
      await deleteDoc(doc(db, "routes", bus.routeId));
      alert("Bus and associated route deleted successfully.");
    } catch (error: any) {
      alert("Error deleting: " + error.message);
    }
  };


  // --- Handlers for Tab 2: Staff Assignment ---
  const handleAssignStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusId || !selectedConductorId) return alert("Please select both Bus and Conductor!");

    setLoading(true);
    try {
      // සිලෙක්ට් කරපු බස් එකේ සහ කොන්දොස්තරගේ සම්පූර්ණ විස්තර හොයාගන්නවා (Table එකේ නම පේන්න ඕන නිසා)
      const targetBus = buses.find((b) => b.busId === selectedBusId);
      const targetConductor = conductors.find((c) => c.conductorId === selectedConductorId);

      // උඹ කියපු ලස්සන ID format එක: busId_date (e.g., bus001_2026-05-23)
      const customDocId = `${selectedBusId}_${todayDate}`;

      await setDoc(doc(db, "daily_assignments", customDocId), {
        assignmentId: customDocId,
        busId: selectedBusId,
        busNo: targetBus?.busNo || "",
        routeName: targetBus?.routeName || "",
        conductorId: selectedConductorId,
        conductorName: targetConductor?.name || "Unknown Conductor", // Conductor ගේ collection එකේ field එක 'name' ලෙස උපකල්පනය කර ඇත
        ownerId: currentOwnerId,
        date: todayDate,
        status: "pending", // මුලින්ම යද්දී pending වැටෙනවා
        createdAt: serverTimestamp()
      });

      alert("Conductor assigned successfully! Status is now Pending.");
      setSelectedBusId("");
      setSelectedConductorId("");
    } catch (error: any) {
      alert("Error assigning staff: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this assignment?")) return;
    try {
      await deleteDoc(doc(db, "daily_assignments", id));
      alert("Assignment removed successfully.");
    } catch (error: any) {
      alert("Error removing assignment: " + error.message);
    }
  };


  return (
    <div>
      <header className="topbar">
        <h2>Manage Fleet & Operations</h2>
      </header>

      <div className="manage-content" style={{ maxWidth: "100%", marginTop: "20px" }}>
        
        {/* --- Tab Navigation Buttons --- */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "25px", borderBottom: "2px solid #e2e8f0", paddingBottom: "10px" }}>
          <button 
            onClick={() => setActiveTab("buses")}
            style={{
              padding: "10px 20px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
              borderRadius: "6px",
              border: "none",
              backgroundColor: activeTab === "buses" ? "#1e293b" : "transparent",
              color: activeTab === "buses" ? "#ffffff" : "#64748b",
              transition: "all 0.3s ease"
            }}
          >
            🚌 Buses & Routes
          </button>
          <button 
            onClick={() => setActiveTab("staff")}
            style={{
              padding: "10px 20px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
              borderRadius: "6px",
              border: "none",
              backgroundColor: activeTab === "staff" ? "#1e293b" : "transparent",
              color: activeTab === "staff" ? "#ffffff" : "#64748b",
              transition: "all 0.3s ease"
            }}
          >
            👤 Assign Staff (Conductors)
          </button>
        </div>

        {/* ==================== TAB 1: BUSES & ROUTES ==================== */}
        {activeTab === "buses" && (
          <div className="dashboard-container">
            <section className="card">
              <h3 style={{ color: "#1e293b", marginBottom: "20px" }}>Add New Bus & Route Configuration</h3>
              <form onSubmit={handleSaveBusAndRoute}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "15px", marginBottom: "20px" }}>
                  <div>
                    <label style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>Bus Number</label>
                    <input type="text" className="fee-input" style={{ width: "100%", marginTop: "5px" }} placeholder="e.g. WP NB-4521" required value={busNo} onChange={(e) => setBusNo(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>Seat Capacity</label>
                    <input type="number" className="fee-input" style={{ width: "100%", marginTop: "5px" }} placeholder="e.g. 49" required value={capacity} onChange={(e) => setCapacity(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>From (Origin)</label>
                    <input type="text" className="fee-input" style={{ width: "100%", marginTop: "5px" }} placeholder="e.g. Colombo" required value={fromLocation} onChange={(e) => setFromLocation(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>To (Destination)</label>
                    <input type="text" className="fee-input" style={{ width: "100%", marginTop: "5px" }} placeholder="e.g. Kandy" required value={toLocation} onChange={(e) => setToLocation(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>Distance (km)</label>
                    <input type="number" className="fee-input" style={{ width: "100%", marginTop: "5px" }} placeholder="e.g. 115" required value={distance} onChange={(e) => setDistance(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>Estimated Time</label>
                    <input type="text" className="fee-input" style={{ width: "100%", marginTop: "5px" }} placeholder="e.g. 3h 30m" required value={estimatedTime} onChange={(e) => setEstimatedTime(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>Ticket Price (Rs.)</label>
                    <input type="number" className="fee-input" style={{ width: "100%", marginTop: "5px" }} placeholder="e.g. 1500" required value={price} onChange={(e) => setPrice(e.target.value)} />
                  </div>
                </div>

                <button type="submit" className="add-btn" style={{ width: "100%", padding: "14px", fontSize: "15px" }} disabled={loading}>
                  {loading ? "SAVING..." : "SAVE BUS & GENERATE ROUTE +"}
                </button>
              </form>
            </section>

            <section className="card" style={{ marginTop: "20px" }}>
              <h3 style={{ color: "#1e293b", marginBottom: "15px" }}>Active Fleet ({buses.length})</h3>
              <table>
                <thead>
                  <tr>
                    <th>Bus No</th>
                    <th>Route (Origin → Dest)</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {buses.length > 0 ? (
                    buses.map((bus) => (
                      <tr key={bus.id}>
                        <td><strong>{bus.busNo}</strong></td>
                        <td>{bus.routeName}</td>
                        <td style={{ color: "#16a34a", fontWeight: "bold" }}>{bus.status}</td>
                        <td>
                          <button onClick={() => handleDeleteBus(bus)} className="delete-btn">Delete</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: "20px" }}>No buses found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          </div>
        )}

        {/* ==================== TAB 2: ASSIGN STAFF ==================== */}
        {activeTab === "staff" && (
          <div className="dashboard-container">
            
            {/* Duty එකක් Assign කරන Form එක */}
            <section className="card">
              <h3 style={{ color: "#1e293b", marginBottom: "20px" }}>Daily Duty Assignment ({todayDate})</h3>
              <form onSubmit={handleAssignStaff}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "20px" }}>
                  
                  {/* Bus Dropdown */}
                  <div>
                    <label style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>Select Bus</label>
                    <select 
                      className="fee-input" 
                      style={{ width: "100%", marginTop: "5px", padding: "10px" }}
                      required
                      value={selectedBusId}
                      onChange={(e) => setSelectedBusId(e.target.value)}
                    >
                      <option value="">-- Choose Bus --</option>
                      {buses.map((b) => (
                        <option key={b.id} value={b.busId}>{b.busNo} ({b.routeName})</option>
                      ))}
                    </select>
                  </div>

                  {/* Conductor Dropdown */}
                  <div>
                    <label style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>Select Conductor</label>
                    <select 
                      className="fee-input" 
                      style={{ width: "100%", marginTop: "5px", padding: "10px" }}
                      required
                      value={selectedConductorId}
                      onChange={(e) => setSelectedConductorId(e.target.value)}
                    >
                      <option value="">-- Choose Conductor --</option>
                      {conductors.map((c) => (
                        <option key={c.id} value={c.conductorId}>{c.name || c.email}</option>
                      ))}
                    </select>
                  </div>

                </div>

                <button type="submit" className="add-btn" style={{ width: "100%", padding: "14px", fontSize: "15px", backgroundColor: "#0284c7" }} disabled={loading}>
                  {loading ? "ASSIGNING..." : "ASSIGN CONDUCTOR FOR TODAY"}
                </button>
              </form>
            </section>

            {/* අද දවසේ සේවා නියුක්ති ලැයිස්තුව (Table එක) */}
            <section className="card" style={{ marginTop: "20px" }}>
              <h3 style={{ color: "#1e293b", marginBottom: "15px" }}>Today's Duty Roster & Responses</h3>
              <table>
                <thead>
                  <tr>
                    <th>Bus No</th>
                    <th>Route</th>
                    <th>Assigned Conductor</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyAssignments.length > 0 ? (
                    dailyAssignments.map((assign) => {
                      // Status එක අනුව පාට වෙනස් කරන Logic එක
                      let statusColor = "#eab308"; // Pending -> Yellow
                      if (assign.status === "approved") statusColor = "#16a34a"; // Approved -> Green
                      if (assign.status === "rejected") statusColor = "#dc2626"; // Rejected -> Red

                      return (
                        <tr key={assign.id}>
                          <td><strong>{assign.busNo}</strong></td>
                          <td>{assign.routeName}</td>
                          <td>{assign.conductorName}</td>
                          <td style={{ color: statusColor, fontWeight: "bold", textTransform: "uppercase" }}>
                            {assign.status}
                          </td>
                          <td>
                            {/* Conductor කෙනෙක් Reject කරලා නම්, Owner ට පුළුවන් සටහන අයින් කරලා එතනට වෙන කෙනෙක් දාන්න */}
                            <button 
                              onClick={() => handleDeleteAssignment(assign.id)} 
                              className="delete-btn"
                              style={{ backgroundColor: assign.status === "rejected" ? "#dc2626" : "#64748b" }}
                            >
                              {assign.status === "rejected" ? "Re-assign (Clear)" : "Remove"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>No conductors assigned for today yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

          </div>
        )}

      </div>
    </div>
  );
};

export default ManageSystem;