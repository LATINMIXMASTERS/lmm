
import { useEffect, useRef } from 'react';
import { useRadio } from '@/hooks/useRadioContext';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to synchronize broadcast changes between devices
 * This creates a unified way to detect live status, chat, and video changes
 */
export const useBroadcastSync = () => {
  const { syncStationsFromStorage, syncChatMessagesFromStorage } = useRadio();
  const { toast } = useToast();
  const deviceId = useRef(localStorage.getItem('latinmixmasters_device_id') || 'unknown');
  const isSyncing = useRef(false);
  const lastSyncTime = useRef(Date.now());
  
  // Minimum time between syncs to prevent flooding
  const SYNC_THROTTLE = 1000; // 1 second
  
  // Function to perform a full sync
  const performFullSync = () => {
    const now = Date.now();
    if (isSyncing.current || now - lastSyncTime.current < SYNC_THROTTLE) {
      return;
    }
    
    isSyncing.current = true;
    lastSyncTime.current = now;
    
    console.log(`[BroadcastSync] Performing full sync at ${new Date(now).toISOString()}`);
    
    try {
      if (syncStationsFromStorage) {
        syncStationsFromStorage();
        
        // Give a short delay before syncing chat
        setTimeout(() => {
          if (syncChatMessagesFromStorage) {
            syncChatMessagesFromStorage();
          }
          
          // Release sync lock
          setTimeout(() => {
            isSyncing.current = false;
          }, 200);
        }, 100);
      } else {
        isSyncing.current = false;
      }
    } catch (error) {
      console.error("[BroadcastSync] Error during sync:", error);
      isSyncing.current = false;
    }
  };
  
  // Setup listeners for broadcast events
  useEffect(() => {
    // Handler for storage events from other tabs/windows
    const handleStorageEvent = (e: StorageEvent) => {
      // Skip if this is our own device
      if (!e.key || !e.newValue) return;
      
      try {
        // Parse new value to check if it's from another device
        const changeData = JSON.parse(e.newValue);
        if (changeData.deviceId === deviceId.current) {
          return; // Skip our own changes
        }
        
        if (
          // Look for known broadcast keys
          e.key === 'latinmixmasters_station_live_status' ||
          e.key === 'latinmixmasters_chat_toggle' ||
          e.key === 'latinmixmasters_clear_chat_messages' ||
          e.key === 'latinmixmasters_sync_broadcast' ||
          // Also detect station-specific changes
          e.key.startsWith('station_') && (
            e.key.includes('_status') || 
            e.key.includes('_chat') ||
            e.key.includes('_video')
          )
        ) {
          // Broadcast change detected, perform sync
          performFullSync();
          
          // Show toast for important broadcast events
          if (e.key === 'latinmixmasters_station_live_status' && changeData.isLive !== undefined) {
            toast({
              title: changeData.isLive ? "Station Now Live" : "Station Offline",
              description: `A station has been ${changeData.isLive ? 'set live' : 'taken offline'}`
            });
          }
        }
        
        // Direct station updates
        if (e.key === 'latinmixmasters_stations') {
          performFullSync();
        }
        
        // Direct chat message updates
        if (e.key === 'latinmixmasters_chat_messages') {
          if (syncChatMessagesFromStorage && !isSyncing.current) {
            syncChatMessagesFromStorage();
          }
        }
      } catch (error) {
        // If we can't parse JSON, just ignore
        return;
      }
    };
    
    // Handler for custom broadcast events
    const handleBroadcastEvent = (e: CustomEvent) => {
      if (e.detail && e.detail.deviceId !== deviceId.current) {
        console.log("[BroadcastSync] Received broadcast event:", e.detail);
        performFullSync();
      }
    };
    
    // Handler for visibility changes (user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("[BroadcastSync] Page became visible, syncing...");
        performFullSync();
      }
    };
    
    // Handler for online/offline events
    const handleOnline = () => {
      console.log("[BroadcastSync] Device online, syncing...");
      performFullSync();
      
      toast({
        title: "Connection Restored",
        description: "Your connection is back online. Syncing broadcast changes..."
      });
    };
    
    // Add event listeners
    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('latinmixmasters_broadcast', handleBroadcastEvent as EventListener);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    
    // Initial sync on mount
    performFullSync();
    
    // Setup a regular sync interval
    const syncInterval = setInterval(performFullSync, 15000); // Every 15 seconds
    
    // Cleanup function
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('latinmixmasters_broadcast', handleBroadcastEvent as EventListener);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      clearInterval(syncInterval);
    };
  }, [syncStationsFromStorage, syncChatMessagesFromStorage, toast]);
  
  return { performFullSync };
};

export default useBroadcastSync;
