
import { useEffect, useRef } from 'react';
import { useRadio } from '@/hooks/useRadioContext';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to periodically verify sync consistency across stations
 */
export const useSyncChecker = (stationId: string | undefined) => {
  const { stations, syncStationsFromStorage } = useRadio();
  const { toast } = useToast();
  const lastCheckTime = useRef<number>(Date.now());
  const checkCount = useRef<number>(0);
  const syncedSuccessfully = useRef<boolean>(false);

  useEffect(() => {
    if (!stationId) return;
    
    // Run this check every 10 seconds to ensure consistency
    const checkInterval = setInterval(() => {
      const now = Date.now();
      
      // Skip if we've recently checked
      if (now - lastCheckTime.current < 8000) {
        return;
      }
      
      // Get station from localStorage directly
      try {
        const storedStationsJson = localStorage.getItem('latinmixmasters_stations');
        if (!storedStationsJson) return;
        
        const storedStations = JSON.parse(storedStationsJson);
        const storedStation = storedStations.find((s: any) => s.id === stationId);
        
        if (!storedStation) return;
        
        // Find current station in state
        const currentStation = stations.find(s => s.id === stationId);
        if (!currentStation) return;
        
        // Check if they're out of sync
        const isLiveMismatch = storedStation.isLive !== currentStation.isLive;
        const isChatMismatch = storedStation.chatEnabled !== currentStation.chatEnabled;
        
        if (isLiveMismatch || isChatMismatch) {
          console.log("Station sync mismatch detected:", {
            stationId,
            stateIsLive: currentStation.isLive,
            storedIsLive: storedStation.isLive,
            stateChatEnabled: currentStation.chatEnabled,
            storedChatEnabled: storedStation.chatEnabled
          });
          
          // Force a sync to resolve the inconsistency
          if (syncStationsFromStorage) {
            syncStationsFromStorage();
            
            checkCount.current += 1;
            
            // Only show toast if this is recurring
            if (checkCount.current > 1 && !syncedSuccessfully.current) {
              toast({
                title: "Syncing Station Status",
                description: "Resolving inconsistency in station live status"
              });
            }
          }
        } else {
          // If everything matches, we've successfully synced
          if (checkCount.current > 0 && !syncedSuccessfully.current) {
            syncedSuccessfully.current = true;
            console.log("Station sync verified successfully after mismatch");
          }
        }
      } catch (error) {
        console.error("Error in sync checker:", error);
      }
      
      lastCheckTime.current = now;
    }, 10000);
    
    return () => {
      clearInterval(checkInterval);
    };
  }, [stationId, stations, syncStationsFromStorage, toast]);
  
  return null; // This hook doesn't return anything
};

export default useSyncChecker;
