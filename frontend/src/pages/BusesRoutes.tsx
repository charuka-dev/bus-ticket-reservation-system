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

  // Generates current system date string in ISO format (e.g., "2026-05-25")
  const todayDate = new Date().toISOString().split("T")[0];

  // 1. Real-time Fetching: Buses matching the current owner session
  useEffect(() => {
    if (!currentOwnerId) return;

    const qBuses = query(collection(db, "buses"), where("ownerId", "==", currentOwnerId));
    const unsubscribe = onSnapshot(qBuses, (snapshot) => {
      const bList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBuses(bList);
    });

    return () => unsubscribe();
  }, [currentOwnerId]);

  // 2. Real-time Fetching: Conductors belonging to the current owner
  useEffect(() => {
    if (!currentOwnerId) return;

    const qConductors = query(collection(db, "conductors"), where("ownerId", "==", currentOwnerId));
    const unsubscribe = onSnapshot(qConductors, (snapshot) => {
      const cList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      // BUG FIXED HERE: It was incorrectly set to setBuses(cList) before.
      setConductors(cList);
    });

    return () => unsubscribe();
  }, [currentOwnerId]);

  // 3. Real-time Fetching: Today's Daily Assignments for the active roster
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

  const getNextTripId = async () => {
    const snapshot = await getDocs(collection(db, "trips"));
    return `trip${String(snapshot.size + 1).padStart(3, "0")}`;
  };


  // --- Handlers for Tab 1: Buses & Routes ---
  const handleSaveBusAndRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOwnerId) return alert("Owner session error! Please re-login.");

    setLoading(true);
    try {
      const nextRouteId = await getNextRouteId();
      const nextBusId = await getNextBusId();
      const nextTripId = await getNextTripId();
      const routeString = `${fromLocation} → ${toLocation}`;

      // Insert data into 'routes' collection
      await setDoc(doc(db, "routes", nextRouteId), {
        routeId: nextRouteId,
        from: fromLocation,
        to: toLocation,
        distance: Number(distance),
        estimatedTime: estimatedTime,
        price: Number(price)
      });

      // Insert data into 'buses' collection
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

      // Insert data into 'trips' collection
      await setDoc(doc(db, "trips", nextTripId), {
        arrivalTime: estimatedTime,
        availableSeats: Number(capacity),
        busId: nextBusId,
        departureTime: "02:00 PM",
        routeId: nextRouteId,
        status: "scheduled",
        tripId: nextTripId
      });

      alert(`Bus ${busNo}, Route, and Trip configured successfully!`);

      // Reset form controls
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

      // Attempt to clear matching trips
      const qTrips = query(collection(db, "trips"), where("busId", "==", bus.busId));
      const tripSnap = await getDocs(qTrips);
      tripSnap.forEach(async (tripDoc) => {
        await deleteDoc(doc(db, "trips", tripDoc.id));
      });

      alert("Bus, associated route, and related trips deleted successfully.");
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
      const targetBus = buses.find((b) => b.busId === selectedBusId);
      const targetConductor = conductors.find((c) => c.conductorId === selectedConductorId);

      const customDocId = `${selectedBusId}_${todayDate}`;

      await setDoc(doc(db, "daily_assignments", customDocId), {
        assignmentId: customDocId,
        busId: selectedBusId,
        busNo: targetBus?.busNo || "",
        routeName: targetBus?.routeName || "",
        conductorId: selectedConductorId,
        conductorName: targetConductor?.name || "Unknown Conductor",
        ownerId: currentOwnerId,
        date: todayDate,
        status: "pending",
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

            <section className="card">
              <h3 style={{ color: "#1e293b", marginBottom: "20px" }}>Daily Duty Assignment ({todayDate})</h3>
              <form onSubmit={handleAssignStaff}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "20px" }}>

                  {/* Bus Dropdown - Dan hariyata load wenawa */}
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
                        <option key={b.id} value={b.busId}>
                          {b.busNo} {b.routeName ? `(${b.routeName})` : ""}
                        </option>
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
                      let statusColor = "#eab308";
                      if (assign.status === "approved") statusColor = "#16a34a";
                      if (assign.status === "rejected") statusColor = "#dc2626";

                      return (
                        <tr key={assign.id}>
                          <td><strong>{assign.busNo}</strong></td>
                          <td>{assign.routeName}</td>
                          <td>{assign.conductorName}</td>
                          <td style={{ color: statusColor, fontWeight: "bold", textTransform: "uppercase" }}>
                            {assign.status}
                          </td>
                          <td>
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