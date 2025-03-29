
import { useEffect, useCallback, useRef } from 'react';
import { useRadio } from '@/hooks/useRadioContext';

export const useChatSync = (
  stationId: string | undefined, 
  station: any, 
  setLastSyncTime: (time: Date) => void
) => {
  const { syncChatMessagesFromStorage, clearChatMessagesForStation, getChatMessagesForStation } = useRadio();
  const syncIntervalIdRef = useRef<number | null>(null);
  const previousLiveStatusRef = useRef<boolean>(false);

  // Clean up interval ref when component unmounts or dependencies change
  const clearSyncInterval = useCallback(() => {
    if (syncIntervalIdRef.current) {
      window.clearInterval(syncIntervalIdRef.current);
      syncIntervalIdRef.current = null;
    }
  }, []);

  // Sync chat messages periodically
  useEffect(() => {
    if (!stationId || !station?.isLive || !station?.chatEnabled) {
      clearSyncInterval();
      
      // If station was previously live but is now offline,
      // clear the chat messages to prevent storage buildup
      if (previousLiveStatusRef.current && !station?.isLive && stationId) {
        console.log(`Station ${stationId} is now offline, clearing chat messages`);
        clearChatMessagesForStation(stationId);
      }
      
      // Update previous live status
      previousLiveStatusRef.current = !!station?.isLive;
      return;
    }
    
    // Update previous live status
    previousLiveStatusRef.current = !!station?.isLive;
    
    // Initial sync on page load
    syncChatMessagesFromStorage();
    setLastSyncTime(new Date());
    
    // Set up periodic sync with a shorter interval for better real-time experience
    const syncInterval = window.setInterval(() => {
      syncChatMessagesFromStorage();
      setLastSyncTime(new Date());
    }, 2000); // Sync every 2 seconds when chat is active for more responsive updates
    
    syncIntervalIdRef.current = syncInterval;
    
    return clearSyncInterval;
  }, [stationId, syncChatMessagesFromStorage, station?.isLive, station?.chatEnabled, clearSyncInterval, setLastSyncTime, clearChatMessagesForStation]);

  // Automatically clean up chat messages on component unmount if not live
  useEffect(() => {
    return () => {
      if (stationId && !station?.isLive && clearChatMessagesForStation) {
        // Clear messages for this station when user leaves the page and station is not live
        clearChatMessagesForStation(stationId);
      }
    };
  }, [stationId, station?.isLive, clearChatMessagesForStation]);

  // Return chat messages from the store
  const chatMessages = stationId ? getChatMessagesForStation(stationId) : [];
  
  return { chatMessages };
};
