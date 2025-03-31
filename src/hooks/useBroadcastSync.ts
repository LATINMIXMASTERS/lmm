
import { useEffect, useRef, useState, useCallback } from 'react';
import { useRadio } from '@/hooks/useRadioContext';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * Hook to synchronize broadcast changes between devices with improved metadata syncing
 * This creates a unified way to detect live status, chat, video, and metadata changes
 */
export const useBroadcastSync = () => {
  const { 
    syncStationsFromStorage, 
    syncChatMessagesFromStorage,
    stations,
    updateStationMetadata
  } = useRadio();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const deviceId = useRef(localStorage.getItem('latinmixmasters_device_id') || 'unknown');
  const isSyncing = useRef(false);
  const lastSyncTime = useRef(Date.now());
  const forceSyncTimeout = useRef<number | null>(null);
  const consecutiveSyncErrors = useRef(0);
  
  // Different throttle times for different devices to prevent sync conflicts
  const SYNC_THROTTLE = isMobile ? 800 : 1000; // Mobile slightly faster
  
  // Function to perform a full sync with better error handling and retry logic
  const performFullSync = useCallback((priority: boolean = false) => {
    const now = Date.now();
    
    // Skip if already syncing or throttled (unless priority)
    if (isSyncing.current && !priority) {
      return;
    }
    
    if (!priority && now - lastSyncTime.current < SYNC_THROTTLE) {
      // Schedule a delayed sync instead of skipping completely
      if (forceSyncTimeout.current) {
        clearTimeout(forceSyncTimeout.current);
      }
      
      forceSyncTimeout.current = window.setTimeout(() => {
        performFullSync(true);
      }, SYNC_THROTTLE);
      
      return;
    }
    
    isSyncing.current = true;
    lastSyncTime.current = now;
    
    console.log(`[BroadcastSync] Performing ${priority ? 'priority' : 'regular'} full sync at ${new Date(now).toISOString()}`);
    
    try {
      if (syncStationsFromStorage) {
        // First sync stations with all metadata
        syncStationsFromStorage();
        
        // Update sync counters and timestamps in localStorage
        const syncTimestamp = Date.now();
        localStorage.setItem('latinmixmasters_last_sync', syncTimestamp.toString());
        localStorage.setItem(`latinmixmasters_device_${deviceId.current}_sync`, syncTimestamp.toString());
        
        // Broadcast sync event for other devices
        broadcastSyncEvent('full_sync', { 
          timestamp: syncTimestamp,
          priority: priority,
          deviceType: isMobile ? 'mobile' : 'desktop',
          consecutiveSyncCount: consecutiveSyncErrors.current
        });
        
        // Give a short delay before syncing chat
        setTimeout(() => {
          if (syncChatMessagesFromStorage) {
            syncChatMessagesFromStorage();
            
            // Broadcast specific chat sync
            broadcastSyncEvent('chat_sync', {
              timestamp: Date.now(),
              deviceType: isMobile ? 'mobile' : 'desktop'
            });
          }
          
          // Release sync lock after a device-appropriate delay
          setTimeout(() => {
            isSyncing.current = false;
            consecutiveSyncErrors.current = 0; // Reset error counter on success
          }, isMobile ? 200 : 300);
        }, isMobile ? 100 : 150);
      } else {
        isSyncing.current = false;
      }
    } catch (error) {
      console.error("[BroadcastSync] Error during sync:", error);
      isSyncing.current = false;
      
      // Track consecutive errors for exponential backoff
      consecutiveSyncErrors.current++;
      
      // If we get repeated errors, try an alternative approach
      if (consecutiveSyncErrors.current > 3) {
        console.log("[BroadcastSync] Multiple sync errors, trying alternative approach");
        
        // Force reload stations from localStorage directly
        try {
          const storedStations = localStorage.getItem('latinmixmasters_stations');
          if (storedStations && updateStationMetadata) {
            const parsedStations = JSON.parse(storedStations);
            
            // Apply metadata updates for each station directly
            parsedStations.forEach(station => {
              if (station.currentMetadata) {
                updateStationMetadata(station.id, station.currentMetadata);
              }
            });
            
            toast({
              title: "Metadata Recovered",
              description: "Recovered station information after sync issues"
            });
            
            consecutiveSyncErrors.current = 0;
          }
        } catch (fallbackError) {
          console.error("[BroadcastSync] Even fallback approach failed:", fallbackError);
          // Last resort - tell user to refresh
          if (consecutiveSyncErrors.current > 5) {
            toast({
              title: "Sync Issues Detected",
              description: "Try refreshing the page to fix synchronization problems",
              variant: "destructive"
            });
          }
        }
      }
    }
  }, [syncStationsFromStorage, syncChatMessagesFromStorage, updateStationMetadata, toast, isMobile]);
  
  // Helper function to broadcast sync events to other devices
  const broadcastSyncEvent = useCallback((eventType: string, data: any) => {
    try {
      const eventData = {
        ...data,
        eventType,
        deviceId: deviceId.current,
        timestamp: Date.now()
      };
      
      // Store in localStorage for cross-tab communication
      localStorage.setItem('latinmixmasters_sync_broadcast', JSON.stringify(eventData));
      
      // Dispatch storage event for immediate cross-tab notification 
      try {
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'latinmixmasters_sync_broadcast',
          newValue: JSON.stringify(eventData)
        }));
      } catch (error) {
        console.error("[BroadcastSync] Error dispatching storage event:", error);
      }
      
      // Also dispatch custom event for same-tab components
      try {
        const broadcastEvent = new CustomEvent('latinmixmasters_broadcast', {
          detail: eventData
        });
        window.dispatchEvent(broadcastEvent);
      } catch (error) {
        console.error("[BroadcastSync] Error dispatching custom event:", error);
      }
    } catch (error) {
      console.error("[BroadcastSync] Error in broadcastSyncEvent:", error);
    }
  }, []);
  
  // Special function specifically for metadata sync
  const syncMetadata = useCallback(() => {
    // Only sync metadata if we have stations and an update function
    if (!stations || !stations.length || !updateStationMetadata) return;
    
    try {
      // Check localStorage for any station metadata updates
      stations.forEach(station => {
        try {
          const metadataKey = `station_${station.id}_metadata`;
          const storedMetadata = localStorage.getItem(metadataKey);
          
          if (storedMetadata) {
            const metadata = JSON.parse(storedMetadata);
            
            // Check if metadata is newer than what we have
            if (metadata && metadata.timestamp && 
                (!station.currentMetadata || 
                 !station.currentMetadata.timestamp || 
                 metadata.timestamp > station.currentMetadata.timestamp)) {
              
              updateStationMetadata(station.id, metadata);
              console.log(`[BroadcastSync] Updated metadata for station ${station.id}:`, metadata);
            }
          }
        } catch (stationError) {
          console.error(`[BroadcastSync] Error syncing metadata for station ${station.id}:`, stationError);
        }
      });
    } catch (error) {
      console.error("[BroadcastSync] Error during metadata sync:", error);
    }
  }, [stations, updateStationMetadata]);
  
  // Setup listeners for broadcast events
  useEffect(() => {
    // Generate a unique device ID if not exists
    if (!localStorage.getItem('latinmixmasters_device_id')) {
      const newDeviceId = `device_${isMobile ? 'mobile' : 'desktop'}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('latinmixmasters_device_id', newDeviceId);
      deviceId.current = newDeviceId;
    }
    
    // Handler for storage events from other tabs/windows
    const handleStorageEvent = (e: StorageEvent) => {
      // Skip if this is our own device or no key/value
      if (!e.key || !e.newValue) return;
      
      try {
        // For sync broadcast events
        if (e.key === 'latinmixmasters_sync_broadcast') {
          const changeData = JSON.parse(e.newValue);
          if (changeData.deviceId === deviceId.current) {
            return; // Skip our own changes
          }
          
          console.log(`[BroadcastSync] Received sync broadcast: ${changeData.eventType || 'unknown'}`);
          performFullSync(changeData.priority === true);
          return;
        }
        
        // Parse new value to check if it's from another device
        if (e.key.includes('_metadata')) {
          // Specific handling for metadata updates
          syncMetadata();
          return;
        }
        
        // Check for station-specific changes
        if (
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
          const changeData = JSON.parse(e.newValue);
          if (changeData.deviceId === deviceId.current) {
            return; // Skip our own changes
          }
          
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
        console.error("[BroadcastSync] Error processing storage event:", error);
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
      performFullSync(true); // Priority sync when coming back online
      
      toast({
        title: "Connection Restored",
        description: "Your connection is back online. Syncing broadcast changes..."
      });
    };
    
    const handleOffline = () => {
      console.log("[BroadcastSync] Device went offline");
      
      toast({
        title: "Connection Lost",
        description: "Your internet connection appears to be offline.",
        variant: "destructive"
      });
    };
    
    // Add event listeners
    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('latinmixmasters_broadcast', handleBroadcastEvent as EventListener);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial sync on mount
    performFullSync();
    
    // Initial metadata sync
    syncMetadata();
    
    // Setup a regular sync interval - less frequent on mobile to save battery
    const syncInterval = setInterval(performFullSync, isMobile ? 15000 : 10000);
    
    // Setup a metadata-specific sync interval (more frequent)
    const metadataInterval = setInterval(syncMetadata, 5000);
    
    // Cleanup function
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('latinmixmasters_broadcast', handleBroadcastEvent as EventListener);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(syncInterval);
      clearInterval(metadataInterval);
      
      if (forceSyncTimeout.current) {
        clearTimeout(forceSyncTimeout.current);
      }
    };
  }, [performFullSync, syncMetadata, syncChatMessagesFromStorage, toast, isMobile]);
  
  return { performFullSync, syncMetadata };
};

export default useBroadcastSync;
