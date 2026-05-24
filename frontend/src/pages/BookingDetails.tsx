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
  );
};

export default BookingDetails;