
import { useEffect, useCallback, useRef } from 'react';
import { useRadio } from '@/hooks/useRadioContext';

export const useChatSync = (
  stationId: string | undefined, 
  station: any, 
  setLastSyncTime: (time: Date) => void
) => {
  const { syncChatMessagesFromStorage, clearChatMessagesForStation } = useRadio();
  const syncIntervalIdRef = useRef<number | null>(null);

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
      return;
    }
    
    // Initial sync on page load
    syncChatMessagesFromStorage();
    setLastSyncTime(new Date());
    
    // Set up periodic sync with a short interval when chat is active
    const syncInterval = window.setInterval(() => {
      syncChatMessagesFromStorage();
      setLastSyncTime(new Date());
    }, 3000); // Sync every 3 seconds when chat is active
    
    syncIntervalIdRef.current = syncInterval;
    
    return clearSyncInterval;
  }, [stationId, syncChatMessagesFromStorage, station?.isLive, station?.chatEnabled, clearSyncInterval, setLastSyncTime]);

  // Automatically clean up chat messages on component unmount if not live
  useEffect(() => {
    return () => {
      if (stationId && !station?.isLive && clearChatMessagesForStation) {
        // Clear messages for this station when user leaves the page and station is not live
        clearChatMessagesForStation(stationId);
      }
    };
  }, [stationId, station?.isLive, clearChatMessagesForStation]);

  const chatMessages = station ? syncChatMessagesFromStorage() || [] : [];
  
  return { chatMessages };
};
