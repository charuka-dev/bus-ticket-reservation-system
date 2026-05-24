import React, { useMemo, useState } from 'react';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { Booking } from '../types';
import { Bus, RefreshCw, Search, Armchair, AlertCircle, User, Ticket, Calendar, MapPin } from 'lucide-react';
import '../../styles/booking.css';

function generateSeatLayout(capacity: number) {
  const layout: { id: string; row: number; side: 'left' | 'right' | 'back'; col: number }[] = [];
  
  const isBackRowSix = capacity % 5 === 1 || capacity === 54;
  const backRowSeatsCount = isBackRowSix ? 6 : 5;
  const standardSeatsCount = capacity - backRowSeatsCount;
  
  const seatsPerRow = 5; 
  const rows = Math.floor(standardSeatsCount / seatsPerRow);

  let seatNumberCounter = 1;


  for (let r = 0; r < rows; r++) {
    
    for (let c = 0; c < 3; c++) {
      if (seatNumberCounter <= standardSeatsCount) {
        layout.push({ id: String(seatNumberCounter++), row: r, side: 'left', col: c });
      }
    }
    for (let c = 0; c < 2; c++) {
      if (seatNumberCounter <= standardSeatsCount) {
        layout.push({ id: String(seatNumberCounter++), row: r, side: 'right', col: c });
      }
    }
  }

  
  for (let c = 0; c < backRowSeatsCount; c++) {
    if (seatNumberCounter <= capacity) {
      layout.push({ id: String(seatNumberCounter++), row: rows, side: 'back', col: c });
    }
  }

  return { layout, rowsCount: rows };
}

const BookingPage: React.FC = () => {
  const [busSearchInput, setBusSearchInput] = useState('');
  const [searchedBusNo, setSearchedBusNo] = useState('');
  const [busCapacity, setBusCapacity] = useState<number>(54); // Default ලෙස 54
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeSeat, setActiveSeat] = useState<string | null>(null);

  const fetchBusAndBookings = async (targetBusNo: string) => {
    const formattedBus = targetBusNo.trim();
    if (!formattedBus) return;

    setLoading(true);
    setError('');
    setActiveSeat(null);

    try {
      
      const busQuery = query(collection(db, 'buses'), where('busNo', '==', formattedBus), limit(1));
      const busSnapshot = await getDocs(busQuery);

      if (busSnapshot.empty) {
        setError(`Bus registration number "${formattedBus}" not found.`);
        setBookings([]);
        setSearchedBusNo('');
        setLoading(false);
        return;
      }

      const busDoc = busSnapshot.docs[0];
      const busData = busDoc.data();
      const dynamicCapacity = Number(busData.capacity || 54);
      const internalBusId = busDoc.id; // Firestore document ID එක (e.g., "bus001")

      setBusCapacity(dynamicCapacity);

  
      const bookingsQuery = query(collection(db, 'bookings'), where('busId', '==', internalBusId));
      const bookingsSnapshot = await getDocs(bookingsQuery);

      const fetchedBookings: Booking[] = bookingsSnapshot.docs.map(doc => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          
          seatNumber: String(data.seatNo || data.seatNumber || ''),
          passengerName: data.passengerName || data.passenger || 'Passenger',
          passengerId: data.customerId || data.passengerId || 'N/A',
          route: data.routeId || data.route || 'Active Route',
          date: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'N/A',
          status: data.status || 'confirmed',
          busId: data.busId || internalBusId,
          qrCode: data.qrCode || 'N/A'
        };
      });

      setBookings(fetchedBookings);
      setSearchedBusNo(formattedBus);

      if (fetchedBookings.length === 0) {
        setError(`No active bookings found for ${formattedBus}. All ${dynamicCapacity} seats are free.`);
      }
    } catch (err) {
      console.error(err);
      setError('Error connecting to the database. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const { layout: SEATS, rowsCount: ROWS } = useMemo(() => generateSeatLayout(busCapacity), [busCapacity]);

  
  const bookedMap = useMemo(() => {
    const map = new Map<string, Booking>();
    bookings.forEach(b => {
      if (b.status !== 'cancelled' && b.seatNumber) {
       
        const normalizedSeatId = b.seatNumber.replace(/\D/g, ''); 
        map.set(normalizedSeatId || b.seatNumber, b);
      }
    });
    return map;
  }, [bookings]);

  const bookedCount = bookedMap.size;
  const availableCount = busCapacity - bookedCount;
  const occupancy = searchedBusNo ? Math.round((bookedCount / busCapacity) * 100) : 0;

  const renderSeat = (seat: typeof SEATS[number]) => {
    const booking = bookedMap.get(seat.id);
    const isBooked = !!booking;
    const isActive = activeSeat === seat.id;

    return (
      <button
        key={seat.id}
        type="button"
        className={`bus-seat ${isBooked ? 'is-booked' : 'is-free'} ${isActive ? 'is-active' : ''}`}
        onClick={() => setActiveSeat(prev => prev === seat.id ? null : seat.id)}
        title={isBooked ? `Seat ${seat.id} · ${booking?.passengerName}` : `Seat ${seat.id} · Available`}
      >
        <Armchair size={13} />
        <span>{seat.id}</span>
      </button>
    );
  };

  const activeBooking = activeSeat ? bookedMap.get(activeSeat) : null;

  return (
    <div className="booking-page">
      <div className="page-header">
        <h2><Bus size={24} /> Bus Seat Configuration</h2>
        <p>Enter the Bus Number to view live occupancy dashboards and passenger logs.</p>
      </div>

      <div className="bus-search-bar">
        <div className="bus-search-input">
          <Search size={16} />
          <input
            className="form-control"
            placeholder="Enter Bus Number (e.g. NB-1234)..."
            value={busSearchInput}
            onChange={e => setBusSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchBusAndBookings(busSearchInput)}
          />
        </div>
        <button 
          className="btn btn-primary" 
          disabled={loading || !busSearchInput.trim()} 
          onClick={() => fetchBusAndBookings(busSearchInput)}
        >
          {loading ? <span className="spinner spinner-white" /> : <Search size={16} />}
          {loading ? 'Processing...' : 'Search Capacity'}
        </button>
        {searchedBusNo && (
          <button className="btn btn-secondary btn-sm" onClick={() => fetchBusAndBookings(searchedBusNo)} disabled={loading}>
            <RefreshCw size={14} /> Reload Map
          </button>
        )}
      </div>

      {error && (
        <div className="inline-warn" style={{ marginBottom: '20px' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} /> <span>{error}</span>
        </div>
      )}

      {!searchedBusNo ? (
        <div className="bus-empty-state">
          <div className="empty-icon-wrap"><Bus size={38} /></div>
          <h3>Dashboard Standby</h3>
          <p>Please enter a valid bus number above to dynamically render its real-time seat chart status.</p>
        </div>
      ) : (
        <div className="bus-board">
          {/* Summary Dashboard widgets */}
          <div className="bus-summary">
            <div className="summary-card">
              <small>Bus Fleet No</small>
              <strong>{searchedBusNo}</strong>
            </div>
            <div className="summary-card">
              <small>Total Capacity</small>
              <strong style={{ color: 'var(--primary)' }}>{busCapacity} <span style={{fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)'}}>seats</span></strong>
            </div>
            <div className="summary-card">
              <small>Booked Seats</small>
              <strong style={{ color: 'var(--danger)' }}>{bookedCount}</strong>
            </div>
            <div className="summary-card">
              <small>Vacant Seats</small>
              <strong style={{ color: 'var(--success)' }}>{availableCount}</strong>
            </div>
            <div className="summary-card occupancy-widget">
              <div className="widget-header">
                <small>Occupancy Rate</small>
                <strong>{occupancy}%</strong>
              </div>
              <div className="occ-bar"><span style={{ width: `${occupancy}%` }} /></div>
            </div>
          </div>

          <div className="bus-layout-wrap">
            {/* Visual Bus Grid Model */}
            <div className="bus-body">
              <div className="bus-front">
                <span className="driver-label"><User size={13} /> Driver Deck</span>
                <div className="bus-wheel" />
              </div>
              
              <div className="bus-cabin">
                {Array.from({ length: ROWS }).map((_, r) => {
                  const leftSeats = SEATS.filter(s => s.row === r && s.side === 'left');
                  const rightSeats = SEATS.filter(s => s.row === r && s.side === 'right');
                  
                  return (
                    <div className="bus-row" key={r}>
                      <div className="bus-row-side bus-row-left">
                        {leftSeats.map(renderSeat)}
                      </div>
                      <div className="bus-aisle" />
                      <div className="bus-row-side bus-row-right">
                        {rightSeats.map(renderSeat)}
                      </div>
                    </div>
                  );
                })}
                
                {/* Back Row Render */}
                <div className="bus-row bus-back-row">
                  {SEATS.filter(s => s.side === 'back').map(renderSeat)}
                </div>
              </div>
            </div>

            {/* Right Side Info Panels */}
            <aside className="bus-side-panel">
              <div className="seat-legend">
                <div className="seat-legend-item"><span className="legend-dot legend-available" /> Available/Vacant</div>
                <div className="seat-legend-item"><span className="legend-dot legend-booked" /> Booked Passenger</div>
                <div className="seat-legend-item"><span className="legend-dot legend-selected" /> Currently Selected</div>
              </div>

              {activeSeat && activeBooking ? (
                <div className="seat-detail seat-detail-booked">
                  <div className="seat-detail-head">
                    <Armchair size={18} /> <span>Seat Unit: {activeSeat}</span>
                    <span className="badge badge-confirmed">Reserved</span>
                  </div>
                  <div className="passenger-meta-list">
                    <div className="meta-item">
                      <User size={14} />
                      <div>
                        <label>Passenger / Client</label>
                        <p>{activeBooking.passengerName}</p>
                      </div>
                    </div>
                    <div className="meta-item">
                      <MapPin size={14} />
                      <div>
                        <label>Route Code</label>
                        <p>{activeBooking.route}</p>
                      </div>
                    </div>
                    <div className="meta-item">
                      <Calendar size={14} />
                      <div>
                        <label>Booking Date</label>
                        <p>{activeBooking.date}</p>
                      </div>
                    </div>
                    <div className="meta-item full-row">
                      <Ticket size={14} />
                      <div>
                        <label>Secure Token QR</label>
                        <code>{activeBooking.qrCode}</code>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeSeat ? (
                <div className="seat-detail seat-detail-free">
                  <div className="seat-detail-head">
                    <Armchair size={18} /> <span>Seat Unit: {activeSeat}</span>
                    <span className="badge badge-vacant">Vacant</span>
                  </div>
                  <p className="status-desc">This seat is currently unreserved. Ready for walk-in client assignments.</p>
                </div>
              ) : (
                <div className="seat-detail seat-detail-hint">
                  <Armchair size={24} style={{ opacity: 0.4, marginBottom: '8px' }} />
                  <p>Interactive Map: Click on any seat inside the cabin illustration to check booking ledger variables.</p>
                </div>
              )}
            </aside>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;