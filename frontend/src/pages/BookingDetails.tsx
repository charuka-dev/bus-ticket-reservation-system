import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "../styles/dashboard.css";

interface BookingDetailsProps {
  currentOwnerId?: string;
}

const BookingDetails = ({ currentOwnerId }: BookingDetailsProps) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      const ownerId = currentOwnerId || localStorage.getItem("ownerId");
      if (!ownerId) { setLoading(false); return; }

      try {
        const busQuery = query(collection(db, "buses"), where("ownerId", "==", ownerId));
        const busSnapshot = await getDocs(busQuery);
        const myBusData = busSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const myBusIds = myBusData.map(d => d.id);

        if (myBusIds.length === 0) { setLoading(false); return; }

        const bQuery = query(collection(db, "bookings"), where("busId", "in", myBusIds));
        const bSnapshot = await getDocs(bQuery);

        const detailedBookings = await Promise.all(
          bSnapshot.docs.map(async (bDoc) => {
            const bData = bDoc.data();

            const custSnap = await getDoc(doc(db, "customers", bData.customerId || " "));
            const custName = custSnap.exists() ? custSnap.data().name : "Unknown";

            const busInfo = myBusData.find(b => b.id === bData.busId) as any;

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
        setLoading(false);
      }
    };
    fetchBookings();
  }, [currentOwnerId]);

  if (loading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '80vh', color: '#3b6fd4', fontSize: '18px', fontWeight: '600',
        fontFamily: "'Inter', sans-serif", background: '#f4f6fb'
      }}>
        <div>Loading Passenger Database...</div>
      </div>
    );
  }

  return (
    <main style={{
      padding: '40px',
      fontFamily: "'Inter', 'Poppins', sans-serif",
      background: '#f4f6fb',
      minHeight: '100vh',
      boxSizing: 'border-box'
    }}>
      <header style={{ marginBottom: '35px' }}>
        <h1 style={{
          fontSize: '28px', fontWeight: '700', color: '#1e3a8a', margin: '0 0 8px 0',
          letterSpacing: '-0.5px'
        }}>
          Passenger Bookings
        </h1>
        <p style={{ color: '#475569', margin: 0, fontSize: '14px', fontWeight: '500' }}>
          Manage manifest entries, ticket validation statuses, and assigned routes.
        </p>
      </header>

      <section style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        border: '1px solid #e8ecf4',
        overflow: 'hidden',
        maxWidth: '1200px'
      }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid #f0f2f8' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
            Active Booking Manifest
          </h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: '#f8faff', borderBottom: "1px solid #eef0f8" }}>
                <th style={{ padding: "16px 24px", color: '#3b6fd4', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Passenger</th>
                <th style={{ padding: "16px 24px", color: '#3b6fd4', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Bus Number</th>
                <th style={{ padding: "16px 24px", color: '#3b6fd4', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Route</th>
                <th style={{ padding: "16px 24px", color: '#3b6fd4', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.7px', textAlign: 'center' }}>Seat</th>
                <th style={{ padding: "16px 24px", color: '#3b6fd4', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.7px', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? (
                bookings.map((b) => (
                  <tr key={b.id} style={{
                    borderBottom: "1px solid #f0f2f8",
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#fafbff')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: "18px 24px", color: '#1e293b', fontSize: '14px', fontWeight: '600' }}>
                      {b.passengerName}
                    </td>
                    <td style={{ padding: "18px 24px" }}>
                      <span style={{
                        background: '#eff6ff',
                        color: '#2563eb',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '700',
                        border: '1px solid #bfdbfe'
                      }}>
                        {b.busNo}
                      </span>
                    </td>
                    <td style={{ padding: "18px 24px", color: '#475569', fontSize: '14px', fontWeight: '500' }}>
                      {b.route}
                    </td>
                    <td style={{ padding: "18px 24px", color: '#1e293b', fontSize: '14px', fontWeight: '700', textAlign: 'center' }}>
                      <span style={{ background: '#f1f5f9', padding: '5px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                        {b.seatNo || b.seatNumbers || b.seatNumber || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: "18px 24px", textAlign: 'center' }}>
                      <span style={{
                        background: b.status === 'confirmed' ? '#dcfce7' : '#ffedd5',
                        color: b.status === 'confirmed' ? '#16a34a' : '#ea580c',
                        padding: '6px 14px',
                        borderRadius: '30px',
                        fontSize: '12px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        display: 'inline-block',
                        border: b.status === 'confirmed' ? '1px solid #bbf7d0' : '1px solid #fed7aa'
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