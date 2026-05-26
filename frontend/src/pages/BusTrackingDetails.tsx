import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database'; 
import { rtdb } from '../firebaseConfig'; 

const containerStyle = { width: '100%', height: '550px', borderRadius: '24px' };
const defaultCenter = { lat: 6.9271, lng: 79.8612 }; // Default map focus initialized to Colombo coordinates

const BusTrackingDetails = ({ busId }: { busId: string }) => {
  const [location, setLocation] = useState(defaultCenter);
  const [loading, setLoading] = useState(true);
  const [isBusLive, setIsBusLive] = useState(false); // State to evaluate if the transit unit is actively streaming data

  // Initialize and load the Google Maps JavaScript API
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  useEffect(() => {
    // Fallback to a default transit profile instance ID if none is explicitly provided via props
    const currentBusId = busId ? busId : 'bus006';
    console.log("Currently inspecting transit unit:", currentBusId);

    // Reference pointing to the dedicated path inside Firebase Realtime Database
    const busRef = ref(rtdb, 'busLocations/' + currentBusId);

    // Establish a live subscription listener to capture incoming stream frames
    const unsub = onValue(busRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Incoming location updates from RTDB:", data);

      if (data && data.lat !== undefined && data.lng !== undefined) {
        const newLat = Number(data.lat);
        const newLng = Number(data.lng);

        // Filter out uninitialized or dead coordinates (0,0 values)
        if (newLat !== 0 && newLng !== 0) {
          setLocation({ lat: newLat, lng: newLng });
          setIsBusLive(true); // Flag active streaming status if valid coordinates exist
        } else {
          setIsBusLive(false); // Flag offline/inactive status if coordinates evaluate to zero
        }
      } else {
        setIsBusLive(false);
      }
      setLoading(false);
    }, (error) => {
      console.error("RTDB Error: ", error);
      setLoading(false);
    });

    // Terminate data synchronization subscription when component state changes or unmounts
    return () => unsub();
  }, [busId]);

  if (loadError) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh',
        color: '#ef4444', fontFamily: "'Inter', sans-serif", fontWeight: '600', background: '#0f172a'
      }}>
        ⚠️ An error occurred while loading the map engine. Please verify the credentials.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh',
        color: '#3B82F6', fontFamily: "'Inter', sans-serif", fontWeight: '600', background: '#0f172a'
      }}>
        <div style={{ animation: 'pulse 2s infinite' }}>Initializing Realtime Fleet Radar...</div>
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
      <header style={{ 
        marginBottom: '30px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '15px' 
      }}>
        <div>
          <h1 style={{ 
            fontSize: '28px', fontWeight: '700', color: '#38bdf8', margin: '0 0 8px 0', // Soft Bright Blue
            letterSpacing: '-0.5px'
          }}>
            Live Fleet Tracking
          </h1>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px', fontWeight: '500' }}>
            Real-time GPS satellite positioning for Active Transit Units.
          </p>
        </div>

        {/* 🌟 Dynamic Luxury Status Badge (Neon Style for Dark Mode) */}
        <div style={{
          background: isBusLive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(249, 115, 22, 0.15)',
          border: isBusLive ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(249, 115, 22, 0.3)',
          padding: '10px 20px',
          borderRadius: '30px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          {/* Glowing dot */}
          <span style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: isBusLive ? '#4ade80' : '#fb923c',
            boxShadow: isBusLive ? '0 0 12px #4ade80' : '0 0 12px #fb923c'
          }} />
          <span style={{
            fontSize: '13px',
            fontWeight: '700',
            color: isBusLive ? '#4ade80' : '#fb923c',
            textTransform: 'uppercase',
            letterSpacing: '0.7px'
          }}>
            {busId ? busId : 'bus006'} : {isBusLive ? "Live Tracking Active" : "Offline / Waiting"}
          </span>
        </div>
      </header>

      {/* Map Premium Wrapper Container */}
      <section style={{
        background: '#1e293b', // 🎛️ Premium Dark Slate Card
        padding: '16px',
        borderRadius: '32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        overflow: 'hidden'
      }}>
        <GoogleMap 
          mapContainerStyle={containerStyle} 
          center={location} 
          zoom={15}
          options={{
            mapTypeControl: true, // Controls visibility layout of the satellite toggle feature 
            streetViewControl: false,
            fullscreenControl: true,
            // 🗺️ Visual styles matrix mapping configuration to render canvas elements in Dark Mode
            styles: [
              { "elementType": "geometry", "stylers": [{ "color": "#1f2937" }] },
              { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1f2937" }] },
              { "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca3af" }] },
              { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "visibility": "off" }] },
              { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#374151" }] },
              { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca3af" }] },
              { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#4b5563" }] },
              { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#e5e7eb" }] },
              { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#111827" }] }
            ]
          }}
        >
          {/* Custom Luxury Colored Marker Layout Component */}
          <Marker 
            position={location} 
            options={{
              label: {
                text: "🚍 " + (busId ? busId : 'bus006'),
                color: "#38bdf8", // Bright Cyan Blue value designed to stand out under dark canvas conditions
                fontWeight: "700",
                fontSize: "14px"
              }
            }}
          />
        </GoogleMap>
      </section>
    </main>
  );
};

export default BusTrackingDetails;