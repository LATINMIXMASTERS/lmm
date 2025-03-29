
import { useEffect, useRef, useState } from 'react';
import { useRadio } from '@/hooks/useRadioContext';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * Enhanced hook to verify sync consistency across stations and devices
 * with special handling for mobile devices and intermittent connections
 */
export const useSyncChecker = (stationId: string | undefined) => {
  const { stations, syncStationsFromStorage, syncChatMessagesFromStorage } = useRadio();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const lastCheckTime = useRef<number>(Date.now());
  const checkCount = useRef<number>(0);
  const syncedSuccessfully = useRef<boolean>(false);
  const [forceSync, setForceSync] = useState<boolean>(false);
  const initialSyncDone = useRef<boolean>(false);
  const lastOnlineTime = useRef<number>(Date.now());
  const deviceId = useRef<string>(getOrCreateDeviceId());
  const syncLock = useRef<boolean>(false);
  const mobileSyncTimeoutRef = useRef<number | null>(null);

  // Function to create or retrieve a unique device ID
  function getOrCreateDeviceId() {
    let id = localStorage.getItem('latinmixmasters_device_id');
    if (!id) {
      id = `device_${isMobile ? 'mobile' : 'desktop'}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('latinmixmasters_device_id', id);
    }
    return id;
  }

  // Perform an immediate sync on mount and whenever stationId changes
  useEffect(() => {
    if (!stationId || initialSyncDone.current) return;
    
    console.log(`[SyncChecker] Initial sync for station ${stationId} on ${isMobile ? 'mobile' : 'desktop'} device`);
    
    // Force an immediate sync
    performFullSync();
    
    // Record that we've done the initial sync
    initialSyncDone.current = true;
    
    // Store sync timestamp with device ID to help with cross-device sync
    const syncTimestamp = Date.now();
    localStorage.setItem('latinmixmasters_last_sync', syncTimestamp.toString());
    localStorage.setItem(`latinmixmasters_device_${deviceId.current}_sync`, syncTimestamp.toString());
    
    // Broadcast sync event to other tabs/windows/devices
    broadcastSyncEvent({
      stationId,
      action: 'init',
      timestamp: syncTimestamp
    });
    
    // On mobile, set up more aggressive periodic syncing
    if (isMobile) {
      console.log("[SyncChecker] Setting up mobile-specific sync schedule");
      const mobileInterval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          performFullSync();
        }
      }, 4000); // More frequent on mobile
      
      return () => clearInterval(mobileInterval);
    }
    
  }, [stationId, syncStationsFromStorage, syncChatMessagesFromStorage, isMobile]);

  // Listen for online status to force sync - critical for mobile
  useEffect(() => {
    const handleOnline = () => {
      console.log(`[SyncChecker] Device came online (${isMobile ? 'mobile' : 'desktop'}), forcing sync`);
      lastOnlineTime.current = Date.now();
      setForceSync(true);
      
      // Record reconnection time to help with cross-device sync
      localStorage.setItem('latinmixmasters_last_online', lastOnlineTime.current.toString());
      localStorage.setItem(`latinmixmasters_device_${deviceId.current}_online`, lastOnlineTime.current.toString());
      
      // For mobile, clear any existing timeout and set up a new one
      if (isMobile && mobileSyncTimeoutRef.current) {
        clearTimeout(mobileSyncTimeoutRef.current);
      }
      
      // Perform initial sync immediately
      performFullSync();
      
      // On mobile, do additional syncs after short delays to handle unstable connections
      if (isMobile) {
        mobileSyncTimeoutRef.current = window.setTimeout(() => {
          performFullSync();
          
          // One more sync after another delay
          mobileSyncTimeoutRef.current = window.setTimeout(() => {
            performFullSync();
            mobileSyncTimeoutRef.current = null;
          }, 2000);
        }, 1000);
      }
      
      // Reset force sync after a delay
      setTimeout(() => {
        setForceSync(false);
      }, 2000);
    };
    
    const handleOffline = () => {
      console.log(`[SyncChecker] Device went offline (${isMobile ? 'mobile' : 'desktop'})`);
      const offlineTime = Date.now();
      localStorage.setItem('latinmixmasters_last_offline', offlineTime.toString());
      localStorage.setItem(`latinmixmasters_device_${deviceId.current}_offline`, offlineTime.toString());
    };
    
    // For mobile devices, also check visibility changes
    const handleVisibilityChange = () => {
      if (isMobile && document.visibilityState === 'visible') {
        console.log("[SyncChecker] Mobile app became visible, syncing...");
        performFullSync();
      }
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Do an initial sync on mount for mobile devices
    if (isMobile && stationId) {
      performFullSync();
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (mobileSyncTimeoutRef.current) {
        clearTimeout(mobileSyncTimeoutRef.current);
      }
    };
  }, [syncStationsFromStorage, syncChatMessagesFromStorage, stationId, isMobile]);

  // Helper function to perform a full sync of all data
  const performFullSync = () => {
    if (syncLock.current) return;
    
    syncLock.current = true;
    
    try {
      if (syncStationsFromStorage) {
        syncStationsFromStorage();
      }
      
      if (syncChatMessagesFromStorage) {
        syncChatMessagesFromStorage();
      }
      
      const syncTimestamp = Date.now();
      localStorage.setItem('latinmixmasters_last_sync', syncTimestamp.toString());
      localStorage.setItem(`latinmixmasters_device_${deviceId.current}_sync`, syncTimestamp.toString());
      
      if (stationId) {
        // Broadcast the sync event to other devices
        broadcastSyncEvent({
          stationId,
          action: 'full_sync',
          timestamp: syncTimestamp,
          isMobile
        });
      }
    } finally {
      // Release lock after a delay to prevent rapid re-syncs
      setTimeout(() => {
        syncLock.current = false;
      }, 500);
    }
  };
  
  // Helper function to broadcast sync events to other devices
  const broadcastSyncEvent = (data: any) => {
    try {
      const eventData = {
        ...data,
        deviceId: deviceId.current,
        timestamp: Date.now()
      };
      
      localStorage.setItem('latinmixmasters_sync_broadcast', JSON.stringify(eventData));
      
      // Also try to dispatch a storage event for other tabs
      try {
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'latinmixmasters_sync_broadcast',
          newValue: JSON.stringify(eventData)
        }));
      } catch (error) {
        console.error("[SyncChecker] Error broadcasting sync event:", error);
      }
    } catch (error) {
      console.error("[SyncChecker] Error in broadcastSyncEvent:", error);
    }
  };

  // Main sync checker effect - runs every interval
  useEffect(() => {
    if (!stationId) return;
    
    // Run sync check immediately on first load
    checkSyncStatus();
    
    // Different sync intervals for mobile vs desktop
    const checkInterval = setInterval(() => {
      checkSyncStatus();
    }, isMobile ? 3000 : 6000); // More frequent checks on mobile
    
    return () => {
      clearInterval(checkInterval);
    };
    
    // Function to check sync status between localStorage and memory
    function checkSyncStatus() {
      if (syncLock.current) return;
      
      const now = Date.now();
      
      // Skip if we've recently checked (unless force sync is true)
      if (!forceSync && now - lastCheckTime.current < (isMobile ? 1500 : 2500)) {
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
          console.log(`[SyncChecker] Station sync mismatch detected on ${isMobile ? 'mobile' : 'desktop'}:`, {
            stationId,
            deviceId: deviceId.current,
            stateIsLive: currentStation.isLive,
            storedIsLive: storedStation.isLive,
            stateChatEnabled: currentStation.chatEnabled,
            storedChatEnabled: storedStation.chatEnabled,
            forceSync
          });
          
          // Force a sync to resolve the inconsistency
          syncLock.current = true;
          
          if (syncStationsFromStorage) {
            syncStationsFromStorage();
            
            // Small delay before syncing chat to ensure they happen in order
            setTimeout(() => {
              if (syncChatMessagesFromStorage) {
                syncChatMessagesFromStorage();
              }
              
              // Release the lock after a delay
              setTimeout(() => {
                syncLock.current = false;
              }, 300);
            }, 200);
            
            checkCount.current += 1;
            
            // Only show toast if this is recurring or on force sync
            if ((checkCount.current > 1 && !syncedSuccessfully.current) || forceSync) {
              toast({
                title: `Syncing Station Status on ${isMobile ? 'Mobile' : 'Desktop'}`,
                description: "Resolving inconsistency in station status"
              });
            }
            
            // Update sync timestamp
            localStorage.setItem('latinmixmasters_last_sync', now.toString());
            localStorage.setItem(`latinmixmasters_device_${deviceId.current}_sync`, now.toString());
            
            // Broadcast sync event to other tabs/windows/devices
            broadcastSyncEvent({
              stationId,
              action: 'sync_fix',
              timestamp: now,
              isMobile
            });
          } else {
            syncLock.current = false;
          }
        } else {
          // If everything matches, we've successfully synced
          if (checkCount.current > 0 && !syncedSuccessfully.current) {
            syncedSuccessfully.current = true;
            console.log(`[SyncChecker] Station sync verified successfully on ${isMobile ? 'mobile' : 'desktop'} after previous mismatch`);
          }
        }
      } catch (error) {
        console.error(`[SyncChecker] Error in sync checker on ${isMobile ? 'mobile' : 'desktop'}:`, error);
        syncLock.current = false;
      }
      
      lastCheckTime.current = now;
    }
  }, [stationId, stations, syncStationsFromStorage, toast, forceSync, syncChatMessagesFromStorage, isMobile]);
  
  // Listen for broadcast sync events from other tabs/windows/devices
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      // React to sync_broadcast events from other tabs/windows/devices
      if (e.key === 'latinmixmasters_sync_broadcast' && e.newValue) {
        try {
          const syncData = JSON.parse(e.newValue);
          
          // Only process if it's not from this device
          if (syncData.deviceId !== deviceId.current && syncData.stationId === stationId) {
            console.log(`[SyncChecker] Received sync broadcast on ${isMobile ? 'mobile' : 'desktop'} from another device:`, syncData);
            
            // If we're on mobile and the broadcast is from desktop, prioritize it
            const shouldPrioritize = isMobile && !syncData.isMobile;
            
            // Force a sync when another device broadcasts
            if (!syncLock.current) {
              syncLock.current = true;
              
              // Add small delays to ensure proper order of operations
              setTimeout(() => {
                if (syncStationsFromStorage) {
                  syncStationsFromStorage();
                }
                
                setTimeout(() => {
                  if (syncChatMessagesFromStorage) {
                    syncChatMessagesFromStorage();
                  }
                  
                  // Release the lock after all operations
                  setTimeout(() => {
                    syncLock.current = false;
                  }, 200);
                }, shouldPrioritize ? 100 : 300);
              }, shouldPrioritize ? 0 : 100);
            }
          }
        } catch (error) {
          console.error(`[SyncChecker] Error processing sync broadcast on ${isMobile ? 'mobile' : 'desktop'}:`, error);
        }
      }
      
      // React to other station-related storage changes
      if (e.key === 'latinmixmasters_stations' && e.newValue) {
        try {
          const syncTime = Date.now();
          localStorage.setItem('latinmixmasters_last_sync', syncTime.toString());
          
          if (!syncLock.current) {
            syncLock.current = true;
            
            if (syncStationsFromStorage) {
              syncStationsFromStorage();
            }
            
            // Release the lock after a delay
            setTimeout(() => {
              syncLock.current = false;
            }, 300);
          }
        } catch (error) {
          console.error(`[SyncChecker] Error handling stations storage event on ${isMobile ? 'mobile' : 'desktop'}:`, error);
        }
      }
      
      // React to chat messages changes
      if (e.key === 'latinmixmasters_chat_messages' && e.newValue && syncChatMessagesFromStorage) {
        try {
          if (!syncLock.current) {
            syncLock.current = true;
            
            syncChatMessagesFromStorage();
            
            // Release the lock after a delay
            setTimeout(() => {
              syncLock.current = false;
            }, 200);
          }
        } catch (error) {
          console.error(`[SyncChecker] Error handling chat messages storage event on ${isMobile ? 'mobile' : 'desktop'}:`, error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, [stationId, syncStationsFromStorage, syncChatMessagesFromStorage, isMobile]);
  
  return null; // This hook doesn't return anything
};

export default useSyncChecker;
