import { ref, get, onValue, off } from 'firebase/database';
import { rtdb } from '../firebase';

export interface LocationData {
    latitude: number;
    longitude: number;
    speed?: number;
    updatedAt: string;
}

export const trackingService = {
    // 1. Get Live Location Once
    async getLiveBusLocation(busId: string): Promise<LocationData | null> {
        const busLocationRef = ref(rtdb, `busLocations/${busId}`);
        
        try {
            const snapshot = await get(busLocationRef);
            if (snapshot.exists()) {
                return snapshot.val() as LocationData;
            }
            return null;
        } catch (error) {
            console.error("Failed to fetch live location:", error);
            throw error;
        }
    },

    // 2. Listen to Live Location Updates
    listenLiveBusLocation(busId: string, callback: (data: LocationData | null) => void): () => void {
        const busLocationRef = ref(rtdb, `busLocations/${busId}`);
        
        const listener = onValue(busLocationRef, (snapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.val() as LocationData);
            } else {
                callback(null);
            }
        }, (error) => {
            console.error("Live tracking subscription error:", error);
        });

        // Return unsubscribe function
        return () => {
            off(busLocationRef, 'value', listener);
        };
    }
};
