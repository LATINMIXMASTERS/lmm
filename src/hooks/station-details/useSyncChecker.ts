
import { useEffect, useRef, useState } from 'react';
import { useRadio } from '@/hooks/useRadioContext';
import { useToast } from '@/hooks/use-toast';

/**
 * Enhanced hook to periodically verify sync consistency across stations and devices
 * with more aggressive sync correction mechanisms
 */
export const useSyncChecker = (stationId: string | undefined) => {
  const { stations, syncStationsFromStorage, syncChatMessagesFromStorage } = useRadio();
  const { toast } = useToast();
  const lastCheckTime = useRef<number>(Date.now());
  const checkCount = useRef<number>(0);
  const syncedSuccessfully = useRef<boolean>(false);
  const [forceSync, setForceSync] = useState<boolean>(false);
  const initialSyncDone = useRef<boolean>(false);
  const lastOnlineTime = useRef<number>(Date.now());
  const deviceId = useRef<string>(getOrCreateDeviceId());

  // Function to create or retrieve a unique device ID
  function getOrCreateDeviceId() {
    let id = localStorage.getItem('latinmixmasters_device_id');
    if (!id) {
      id = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('latinmixmasters_device_id', id);
    }
    return id;
  }

  // Perform an immediate sync on mount and whenever stationId changes
  useEffect(() => {
    if (!stationId || initialSyncDone.current) return;
    
    console.log(`[SyncChecker] Initial sync for station ${stationId}`);
    
    // Force an immediate sync
    if (syncStationsFromStorage) {
      syncStationsFromStorage();
    }
    
    if (syncChatMessagesFromStorage) {
      syncChatMessagesFromStorage();
    }
    
    // Record that we've done the initial sync
    initialSyncDone.current = true;
    
    // Store sync timestamp with device ID to help with cross-device sync
    const syncTimestamp = Date.now();
    localStorage.setItem('latinmixmasters_last_sync', syncTimestamp.toString());
    localStorage.setItem(`latinmixmasters_device_${deviceId.current}_sync`, syncTimestamp.toString());
    
    // Broadcast sync event to other tabs/windows
    try {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'latinmixmasters_sync_broadcast',
        newValue: JSON.stringify({
          stationId,
          deviceId: deviceId.current,
          timestamp: syncTimestamp
        })
      }));
    } catch (error) {
      console.error("[SyncChecker] Error broadcasting sync event:", error);
    }
  }, [stationId, syncStationsFromStorage, syncChatMessagesFromStorage]);

  // Listen for online status to force sync
  useEffect(() => {
    const handleOnline = () => {
      console.log("[SyncChecker] Device came online, forcing sync");
      lastOnlineTime.current = Date.now();
      setForceSync(true);
      
      // Record reconnection time to help with cross-device sync
      localStorage.setItem('latinmixmasters_last_online', lastOnlineTime.current.toString());
      localStorage.setItem(`latinmixmasters_device_${deviceId.current}_online`, lastOnlineTime.current.toString());
      
      if (syncStationsFromStorage) {
        syncStationsFromStorage();
      }
      
      if (syncChatMessagesFromStorage) {
        syncChatMessagesFromStorage();
      }
      
      // Reset force sync after a delay
      setTimeout(() => {
        setForceSync(false);
      }, 2000);
    };
    
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncStationsFromStorage, syncChatMessagesFromStorage]);

  // Main sync checker effect - runs every interval
  useEffect(() => {
    if (!stationId) return;
    
    // Run sync check immediately on first load
    checkSyncStatus();
    
    // Run more frequent checks initially, then back off
    const initialCheckInterval = setInterval(() => {
      checkSyncStatus();
    }, 3000); // More frequent checks initially
    
    // Switch to less frequent checks after 30 seconds
    const regularCheckTimeout = setTimeout(() => {
      clearInterval(initialCheckInterval);
      
      const regularCheckInterval = setInterval(() => {
        checkSyncStatus();
      }, 8000); // Less frequent checks after initial period
      
      return () => clearInterval(regularCheckInterval);
    }, 30000);
    
    return () => {
      clearInterval(initialCheckInterval);
      clearTimeout(regularCheckTimeout);
    };
    
    // Function to check sync status between localStorage and memory
    function checkSyncStatus() {
      const now = Date.now();
      
      // Skip if we've recently checked (unless force sync is true)
      if (!forceSync && now - lastCheckTime.current < 2500) {
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
        
        // Check if they're out of sync - include more properties for thorough check
        const isLiveMismatch = storedStation.isLive !== currentStation.isLive;
        const isChatMismatch = storedStation.chatEnabled !== currentStation.chatEnabled;
        const isVideoMismatch = storedStation.videoStreamUrl !== currentStation.videoStreamUrl;
        
        if (isLiveMismatch || isChatMismatch || isVideoMismatch || forceSync) {
          console.log("[SyncChecker] Station sync mismatch detected:", {
            stationId,
            deviceId: deviceId.current,
            stateIsLive: currentStation.isLive,
            storedIsLive: storedStation.isLive,
            stateChatEnabled: currentStation.chatEnabled,
            storedChatEnabled: storedStation.chatEnabled,
            forceSync
          });
          
          // Force a sync to resolve the inconsistency
          if (syncStationsFromStorage) {
            syncStationsFromStorage();
            
            checkCount.current += 1;
            
            // Only show toast if this is recurring or on force sync
            if ((checkCount.current > 1 && !syncedSuccessfully.current) || forceSync) {
              toast({
                title: "Syncing Station Status",
                description: "Resolving inconsistency in station status"
              });
            }
            
            // Update sync timestamp
            localStorage.setItem('latinmixmasters_last_sync', now.toString());
            localStorage.setItem(`latinmixmasters_device_${deviceId.current}_sync`, now.toString());
            
            // Broadcast sync event to other tabs/windows
            try {
              window.dispatchEvent(new StorageEvent('storage', {
                key: 'latinmixmasters_sync_broadcast',
                newValue: JSON.stringify({
                  stationId,
                  deviceId: deviceId.current,
                  timestamp: now,
                  action: 'sync_fix'
                })
              }));
            } catch (error) {
              console.error("[SyncChecker] Error broadcasting sync event:", error);
            }
          }
        } else {
          // If everything matches, we've successfully synced
          if (checkCount.current > 0 && !syncedSuccessfully.current) {
            syncedSuccessfully.current = true;
            console.log("[SyncChecker] Station sync verified successfully after previous mismatch");
          }
        }
      } catch (error) {
        console.error("[SyncChecker] Error in sync checker:", error);
      }
      
      lastCheckTime.current = now;
    }
  }, [stationId, stations, syncStationsFromStorage, toast, forceSync, syncChatMessagesFromStorage]);
  
  // Listen for broadcast sync events from other tabs/windows
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      // React to sync_broadcast events from other tabs/windows
      if (e.key === 'latinmixmasters_sync_broadcast' && e.newValue) {
        try {
          const syncData = JSON.parse(e.newValue);
          
          // Only process if it's not from this device
          if (syncData.deviceId !== deviceId.current && syncData.stationId === stationId) {
            console.log("[SyncChecker] Received sync broadcast from another device:", syncData);
            
            // Force a sync when another device broadcasts
            if (syncStationsFromStorage) {
              syncStationsFromStorage();
            }
            
            if (syncChatMessagesFromStorage) {
              syncChatMessagesFromStorage();
            }
          }
        } catch (error) {
          console.error("[SyncChecker] Error processing sync broadcast:", error);
        }
      }
      
      // React to other station-related storage changes
      if (e.key === 'latinmixmasters_stations' && e.newValue) {
        try {
          const syncTime = Date.now();
          localStorage.setItem('latinmixmasters_last_sync', syncTime.toString());
          
          if (syncStationsFromStorage) {
            syncStationsFromStorage();
          }
        } catch (error) {
          console.error("[SyncChecker] Error handling stations storage event:", error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, [stationId, syncStationsFromStorage, syncChatMessagesFromStorage]);
  
  return null; // This hook doesn't return anything
};

export default useSyncChecker;
