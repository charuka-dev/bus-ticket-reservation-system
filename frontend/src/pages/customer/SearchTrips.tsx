import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { bookingService } from '../../services/bookingService';
import type { Trip } from '../../types/firebase';
import { useToast } from '../../contexts/ToastContext';
import { Search, MapPin, Calendar, Users, Loader2 } from 'lucide-react';

export default function SearchTrips() {
  const navigate = useNavigate();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const { error } = useToast();

  useEffect(() => {
    const fetchAllTrips = async () => {
      try {
        const results = await bookingService.getAllTrips();
        setAllTrips(results);
      } catch (err) {
        console.error("SearchTrips: Failed to fetch all trips:", err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchAllTrips();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to || !date) {
      error('Please fill in all fields');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    console.log("SearchTrips: Initiating search with inputs:", { from, to, date });
    try {
      const results = await bookingService.searchTrips(from, to, date);
      console.log("SearchTrips: Search results received:", results);
      setTrips(results);
    } catch (err) {
      console.error("SearchTrips: Search failed:", err);
      error('Failed to search trips. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (trip: Trip, searchDate: string) => {
    // If user hasn't searched, they haven't explicitly chosen a date in the form.
    // The getAllTrips defaults to today's date, which is stored in trip.searchDate.
    navigate(`/customer/book/${trip.id}`, {
      state: { searchDate: searchDate || trip.searchDate, trip },
    });
  };

  const renderTripCard = (trip: Trip, searchDateContext: string) => (
    <motion.div 
      key={trip.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition"
    >
      <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Departure</p>
            <p className="font-semibold text-gray-900">{trip.departureTime || '—'}</p>
            <p className="text-sm text-gray-600">{trip.from}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Arrival</p>
            <p className="font-semibold text-gray-900">{trip.arrivalTime || '—'}</p>
            <p className="text-sm text-gray-600">{trip.to}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Availability</p>
            <div className="flex items-center gap-1 text-green-600 font-medium">
              <Users className="w-4 h-4" />
              <span>{trip.availableSeats} / {trip.totalSeats} seats</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Price</p>
            <p className="font-bold text-xl text-blue-600">LKR {trip.price}</p>
          </div>
      </div>

      <button 
        onClick={() => handleBook(trip, searchDateContext)}
        className="w-full md:w-auto px-8 py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition shadow-lg shadow-orange-500/20 whitespace-nowrap"
      >
        Book Now
      </button>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Search Trips</h2>
        
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">From</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Origin City" 
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">To</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Destination City" 
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              Search
            </button>
          </div>
        </form>
      </motion.div>

      {/* Results Section */}
      {!hasSearched ? (
        /* Default View: Show all trips */
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-bold text-gray-800">Available Trips</h3>
          {initialLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : allTrips.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center border border-gray-100">
              <p className="text-gray-500">No trips available at the moment.</p>
            </div>
          ) : (
            allTrips.map((trip) => renderTripCard(trip, trip.searchDate || new Date().toISOString().split('T')[0]))
          )}
        </motion.div>
      ) : (
        /* Search Results View */
        !loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-bold text-gray-800">Search Results ({trips.length})</h3>
            
            {trips.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl text-center border border-gray-100">
                <p className="text-gray-500">No trips found for the selected route and date.</p>
              </div>
            ) : (
              trips.map((trip) => renderTripCard(trip, date))
            )}
          </motion.div>
        )
      )}
    </div>
  );
}
