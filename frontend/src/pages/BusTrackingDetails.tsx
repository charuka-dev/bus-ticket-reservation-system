import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database'; 
import { rtdb } from '../firebaseConfig'; 

const containerStyle = { width: '100%', height: '550px', borderRadius: '24px' };
const defaultCenter = { lat: 6.9271, lng: 79.8612 }; // මුලින්ම කොළඹ පෙන්නනවා

const BusTrackingDetails = ({ busId }: { busId: string }) => {
  const [location, setLocation] = useState(defaultCenter);
  const [loading, setLoading] = useState(true);
  const [isBusLive, setIsBusLive] = useState(false); // Live ද නැද්ද කියලා බලාගන්න State එකක්

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  useEffect(() => {
    const currentBusId = busId ? busId : 'bus006';
    console.log("දැන් පරීක්ෂා කරන බස් එක:", currentBusId);

    const busRef = ref(rtdb, 'busLocations/' + currentBusId);

    const unsub = onValue(busRef, (snapshot) => {
      const data = snapshot.val();
      console.log("DB එකේ අලුත් ලොකේෂන් එක:", data);

      if (data && data.lat !== undefined && data.lng !== undefined) {
        const newLat = Number(data.lat);
        const newLng = Number(data.lng);

        if (newLat !== 0 && newLng !== 0) {
          setLocation({ lat: newLat, lng: newLng });
          setIsBusLive(true); // හරියටම Location ආවොත් බස් එක Live!
        } else {
          setIsBusLive(false); // 0,0 ආවොත් Offline/Waiting
        }
      } else {
        setIsBusLive(false);
      }
      setLoading(false);
    }, (error) => {
      console.error("RTDB Error: ", error);
      setLoading(false);
    });

    return () => unsub();
  }, [busId]);

  if (loadError) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh',
        color: '#ef4444', fontFamily: "'Inter', sans-serif", fontWeight: '600', background: '#0f172a'
      }}>
        ⚠️ Map එක load කිරීමේදී දෝෂයක් ඇතිවිය. API Key එක පරීක්ෂා කරන්න.
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
            mapTypeControl: true, // Satellite Toggle බටන් එක වැඩ
            streetViewControl: false,
            fullscreenControl: true,
            // 🗺️ Dark Theme එකට මැච් වෙන්න Map එක ඇතුලෙත් Custom Dark Silver Style එකක් දැම්මා
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
                color: "#38bdf8", // Dark mode එකේ ලස්සනට පේන Bright Cyan Blue
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