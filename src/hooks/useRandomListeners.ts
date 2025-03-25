
import { useEffect, useRef } from 'react';
import { useRadio } from '@/hooks/useRadioContext';

/**
 * Hook to simulate listener count changes for radio stations
 * Updates the listener count for all stations slowly with small random variations
 * within controlled bounds (min 15, max 350 or admin-set value)
 */
export const useRandomListeners = () => {
  const { stations, updateStationListeners } = useRadio();
  const intervalIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Function to update listener counts with random variations
    const updateRandomListeners = () => {
      stations.forEach(station => {
        // Get current listener count or default to a random number between 15-50
        const currentCount = station.listeners || Math.floor(Math.random() * 35) + 15;
        
        // Determine the maximum allowed count (350 or admin-set value)
        const adminSetMax = currentCount; // Respect the current value as possibly admin-set
        const maxAllowed = Math.min(350, adminSetMax);
        
        // Generate a smaller random variation between -2 and +3 for more gradual changes
        const variation = Math.floor(Math.random() * 6) - 2;
        
        // Calculate new count, ensuring it stays within bounds (15 to maxAllowed)
        const newCount = Math.max(15, Math.min(maxAllowed, currentCount + variation));
        
        // Only update if there's an actual change
        if (newCount !== currentCount) {
          // Update the station's listener count
          updateStationListeners(station.id, newCount);
        }
      });
    };

    // Run once on mount to initialize random counts if needed
    updateRandomListeners();
    
    // Set up interval to update every 30 seconds (30000 ms) for slower changes
    // Store the interval ID in the ref for proper cleanup
    intervalIdRef.current = window.setInterval(updateRandomListeners, 30000);
    
    // Clean up interval on unmount
    return () => {
      if (intervalIdRef.current !== null) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [stations, updateStationListeners]);
};

export default useRandomListeners;
