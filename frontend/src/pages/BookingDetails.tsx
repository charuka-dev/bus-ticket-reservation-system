import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "../styles/dashboard.css";

const BookingDetails = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      // Retrieve the logged-in owner's ID from local storage
      const ownerId = localStorage.getItem("ownerId");
      if (!ownerId) { setLoading(false); return; }

      try {
        // Step 1: Query and fetch all buses assigned to this specific owner
        const busQuery = query(collection(db, "buses"), where("ownerId", "==", ownerId));
        const busSnapshot = await getDocs(busQuery);
        const myBusData = busSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const myBusIds = myBusData.map(d => d.id);

        // If the owner has no buses registered, stop processing
        if (myBusIds.length === 0) { setLoading(false); return; }

        // Step 2: Fetch all bookings matching the owner's bus IDs
        const bQuery = query(collection(db, "bookings"), where("busId", "in", myBusIds));
        const bSnapshot = await getDocs(bQuery);

        // Step 3: Iterate through each booking to resolve sub-collection data (passenger, bus, and route details)
        const detailedBookings = await Promise.all(
          bSnapshot.docs.map(async (bDoc) => {
            const bData = bDoc.data();
            
            // Resolve passenger name from the "customers" collection
            const custSnap = await getDoc(doc(db, "customers", bData.customerId || " "));
            const custName = custSnap.exists() ? custSnap.data().name : "Unknown";
            
            // Find corresponding bus details from the locally cached myBusData array
            const busInfo = myBusData.find(b => b.id === bData.busId);
            
            // Resolve route info (From - To locations) from the "routes" collection
            let routeName = "N/A";
            if (busInfo?.routeId) {
                const routeSnap = await getDoc(doc(db, "routes", busInfo.routeId));
                if (routeSnap.exists()) {
                    const rData = routeSnap.data();
                    routeName = `${rData.from} - ${rData.to}`;
                }
            }

            // Construct and return the fully populated booking record object
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
  );
};

export default BookingDetails;