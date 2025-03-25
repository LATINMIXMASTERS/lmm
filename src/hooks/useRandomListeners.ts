
import { useEffect } from 'react';
import { useRadio } from '@/hooks/useRadioContext';

/**
 * Hook to simulate listener count changes for radio stations
 * Updates the listener count for all stations every minute with a small random variation
 */
export const useRandomListeners = () => {
  const { stations, updateStationListeners } = useRadio();

  useEffect(() => {
    // Function to update listener counts with random variations
    const updateRandomListeners = () => {
      stations.forEach(station => {
        // Get current listener count or default to a random number between 10-50
        const currentCount = station.listeners || Math.floor(Math.random() * 40) + 10;
        
        // Generate a random variation between -5 and +10
        const variation = Math.floor(Math.random() * 16) - 5;
        
        // Calculate new count, ensuring it doesn't go below 1
        const newCount = Math.max(1, currentCount + variation);
        
        // Update the station's listener count
        updateStationListeners(station.id, newCount);
      });
    };

    // Run once on mount to initialize random counts if needed
    updateRandomListeners();
    
    // Set up interval to update every minute
    const intervalId = setInterval(updateRandomListeners, 60000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [stations, updateStationListeners]);
};

export default useRandomListeners;
