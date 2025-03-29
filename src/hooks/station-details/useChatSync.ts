
import { useEffect, useCallback, useRef, useState } from 'react';
import { useRadio } from '@/hooks/useRadioContext';
import { useToast } from '@/hooks/use-toast';

export const useChatSync = (
  stationId: string | undefined, 
  station: any, 
  setLastSyncTime: (time: Date) => void
) => {
  const { syncChatMessagesFromStorage, clearChatMessagesForStation, getChatMessagesForStation } = useRadio();
  const syncIntervalIdRef = useRef<number | null>(null);
  const previousLiveStatusRef = useRef<boolean>(false);
  const chatMessagesRef = useRef<any[]>([]);
  const { toast } = useToast();
  const [isForceSync, setIsForceSync] = useState<boolean>(false);

  // Clean up interval ref when component unmounts or dependencies change
  const clearSyncInterval = useCallback(() => {
    if (syncIntervalIdRef.current) {
      window.clearInterval(syncIntervalIdRef.current);
      syncIntervalIdRef.current = null;
    }
  }, []);

  // Force a sync when online status changes
  useEffect(() => {
    const handleOnline = () => {
      console.log("Device came online, forcing chat sync");
      setIsForceSync(true);
      setLastSyncTime(new Date());
      if (syncChatMessagesFromStorage) {
        syncChatMessagesFromStorage();
      }
    };
    
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncChatMessagesFromStorage, setLastSyncTime]);

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
    }, 1500); // Sync every 1.5 seconds when chat is active for more responsive updates
    
    syncIntervalIdRef.current = syncInterval;
    
    return clearSyncInterval;
  }, [stationId, syncChatMessagesFromStorage, station?.isLive, station?.chatEnabled, clearSyncInterval, setLastSyncTime, clearChatMessagesForStation]);

  // Check for significant changes in chat messages and force update if needed
  useEffect(() => {
    const stationMessages = stationId ? getChatMessagesForStation(stationId) : [];
    
    // If message count changed significantly, we should notify the user
    if (chatMessagesRef.current.length > 0 && stationMessages.length > 0) {
      const prevCount = chatMessagesRef.current.length;
      const newCount = stationMessages.length;
      
      // If more than one message difference, it's likely we got an update from another device
      if (Math.abs(newCount - prevCount) > 1 && !isForceSync) {
        console.log(`Chat messages changed: ${prevCount} -> ${newCount}`);
        setIsForceSync(true);
        toast({
          title: "Chat Updated",
          description: "New messages have synchronized from another device"
        });
      }
    }
    
    chatMessagesRef.current = stationMessages;
    
    // Reset force sync flag after effect runs
    if (isForceSync) {
      setIsForceSync(false);
    }
  }, [stationId, getChatMessagesForStation, isForceSync, toast]);

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
