import { useEffect } from 'react';
import { ref, update } from 'firebase/database';
import { rtdb } from '../firebase/firebase';

export const useLocationTracking = (busId: string | undefined, isTracking: boolean) => {
  useEffect(() => {
    if (!busId || !isTracking) return;

    
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        update(ref(rtdb, `busLocations/${busId}`), {
          lat: latitude,
          lng: longitude,
          status: 'active',
          lastUpdated: Date.now()
        });
      },
      (error) => console.error("GPS දෝෂය:", error),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [busId, isTracking]);
};