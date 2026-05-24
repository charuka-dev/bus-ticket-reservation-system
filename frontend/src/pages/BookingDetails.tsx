<<<<<<< HEAD
import "../styles/bookingDetails.css";
import { useEffect, useState } from "react";
import { getAllBookings } from "../services/bookingService";

// Booking type definition
type Booking = {
  id: string;
  customerId?: string;
  tripId?: string;
  busId?: string;
  seatNo?: number;
  price?: number;
  status?: string;
};

const BookingDetails = () => {
  // Search input state
  const [search, setSearch] = useState("");

  // Store all booking data
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Load bookings when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getAllBookings();
        console.log(data);
        setBookings(data as Booking[]);
      } catch (error) {
        console.error(error);
      }
    };

    loadData();
  }, []);

  // Filter bookings based on customer ID search
  const filtered = bookings.filter((b) =>
    (b.customerId || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <>
      {/* Top header */}
      <header className="topbar">
        <h2>Booking Details</h2>
      </header>

      {/* Search bar section */}
      <div className="search-panel">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search by Customer ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar"
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {/* Main content area */}
      <main className="dashboard-container">
        <section className="card">
          <h3>All Bookings</h3>

          {/* Booking table */}
          <table>
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Trip ID</th>
                <th>Bus ID</th>
                <th>Seat</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {/* Loop through filtered bookings */}
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td>{b.customerId || "-"}</td>
                  <td>{b.tripId || "-"}</td>
                  <td>{b.busId || "-"}</td>
                  <td>{b.seatNo || "-"}</td>
                  <td>Rs. {b.price || 0}</td>
                  <td>{b.status || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>

        </section>
      </main>
    </>
=======
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "../styles/dashboard.css";

const BookingDetails = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      const ownerId = localStorage.getItem("ownerId");
      if (!ownerId) { setLoading(false); return; }

      try {
        // 1. මේ Owner ගේ බස් ටික හොයාගන්න
        const busQuery = query(collection(db, "buses"), where("ownerId", "==", ownerId));
        const busSnapshot = await getDocs(busQuery);
        const myBusData = busSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const myBusIds = myBusData.map(d => d.id);

        if (myBusIds.length === 0) { setLoading(false); return; }

        // 2. ඒ බස් වල බුකින්ස් ටික ගන්න
        const bQuery = query(collection(db, "bookings"), where("busId", "in", myBusIds));
        const bSnapshot = await getDocs(bQuery);

        // 3. හැම බුකින් එකකටම අදාළ මගියාගේ නම, බස් නම්බර් සහ රූට් එක ගන්න
        const detailedBookings = await Promise.all(
          bSnapshot.docs.map(async (bDoc) => {
            const bData = bDoc.data();
            
            // මගියාගේ නම (customers collection එකෙන්)
            const custSnap = await getDoc(doc(db, "customers", bData.customerId || " "));
            const custName = custSnap.exists() ? custSnap.data().name : "Unknown";
            
            // බස් එකේ විස්තර (busNo)
            const busInfo = myBusData.find(b => b.id === bData.busId);
            
            // රූට් එකේ විස්තර (routes collection එකෙන්)
            let routeName = "N/A";
            if (busInfo?.routeId) {
                const routeSnap = await getDoc(doc(db, "routes", busInfo.routeId));
                if (routeSnap.exists()) {
                    const rData = routeSnap.data();
                    routeName = `${rData.from} - ${rData.to}`;
                }
            }

            return { 
              id: bDoc.id, 
              ...bData, 
              passengerName: custName,
              busNo: busInfo?.busNo || "N/A", 
              route: routeName 
            } as any;
          })
        );

        setBookings(detailedBookings);
      } catch (e) { 
        console.error("Error fetching booking details:", e); 
      } finally { 
        loading === true && setLoading(false); 
      }
    };
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        height: '80vh', color: '#3B82F6', fontSize: '18px', fontWeight: '600',
        fontFamily: "'Inter', sans-serif", background: '#0f172a'
      }}>
        <div style={{ animation: 'pulse 2s infinite' }}>Loading Passenger Database...</div>
      </div>
    );
  }

  return (
    <main style={{
      padding: '40px',
      fontFamily: "'Inter', 'Poppins', sans-serif",
      background: '#0f172a', // 🌌 Deep Space Dark Blue Background
      minHeight: '100vh',
      boxSizing: 'border-box'
    }}>
      {/* Upper Dashboard Header Section */}
      <header style={{ marginBottom: '35px' }}>
        <h1 style={{ 
          fontSize: '28px', fontWeight: '700', color: '#38bdf8', margin: '0 0 8px 0', // Soft Bright Blue
          letterSpacing: '-0.5px'
        }}>
          Passenger Bookings
        </h1>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px', fontWeight: '500' }}>
          Manage manifest entries, ticket validation statuses, and assigned routes.
        </p>
      </header>

      {/* Luxury Dark Card Wrapper Container */}
      <section style={{
        background: '#1e293b', // 🎛️ Premium Dark Slate Card
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
        maxWidth: '1200px'
      }}>
        <div style={{ padding: '24px 30px', borderBottom: '1px solid #334155' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
            Active Booking Manifest
          </h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: '#111827', borderBottom: "2px solid #334155" }}>
                <th style={{ padding: "16px 24px", color: '#94a3b8', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Passenger</th>
                <th style={{ padding: "16px 24px", color: '#94a3b8', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Bus Number</th>
                <th style={{ padding: "16px 24px", color: '#94a3b8', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Route</th>
                <th style={{ padding: "16px 24px", color: '#94a3b8', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.7px', textAlign: 'center' }}>Seat</th>
                <th style={{ padding: "16px 24px", color: '#94a3b8', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.7px', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? (
                bookings.map((b) => (
                  <tr key={b.id} style={{ 
                    borderBottom: "1px solid #334155",
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#24334d')} // Darker Blue/Grey hover effect
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Passenger Name */}
                    <td style={{ padding: "18px 24px", color: '#f1f5f9', fontSize: '14px', fontWeight: '600' }}>
                      {b.passengerName}
                    </td>

                    {/* Bus Number with Premium Glowing Cyan/Blue Tag */}
                    <td style={{ padding: "18px 24px" }}>
                      <span style={{ 
                        background: 'rgba(56, 189, 248, 0.15)', 
                        color: '#38bdf8', 
                        padding: '6px 12px', 
                        borderRadius: '8px', 
                        fontSize: '13px', 
                        fontWeight: '700',
                        border: '1px solid rgba(56, 189, 248, 0.2)'
                      }}>
                        {b.busNo}
                      </span>
                    </td>

                    {/* Route Info */}
                    <td style={{ padding: "18px 24px", color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>
                      {b.route}
                    </td>

                    {/* Seat Number */}
                    <td style={{ padding: "18px 24px", color: '#f8fafc', fontSize: '14px', fontWeight: '700', textAlign: 'center' }}>
                      <span style={{ background: '#0f172a', padding: '5px 12px', borderRadius: '6px', border: '1px solid #334155' }}>
                        {b.seatNo}
                      </span>
                    </td>

                    {/* Dynamic Status Badge (Neon Glowing Style for Dark Theme) */}
                    <td style={{ padding: "18px 24px", textAlign: 'center' }}>
                      <span style={{ 
                        background: b.status === 'confirmed' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(249, 115, 22, 0.15)', 
                        color: b.status === 'confirmed' ? '#4ade80' : '#fb923c', // Lighter neon colors for darkness
                        padding: '6px 14px', 
                        borderRadius: '30px', 
                        fontSize: '12px', 
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        display: 'inline-block',
                        border: b.status === 'confirmed' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(249, 115, 22, 0.3)'
                      }}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
                    No manifest entries recorded for this service.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
>>>>>>> feature/owner
  );
};

export default BookingDetails;