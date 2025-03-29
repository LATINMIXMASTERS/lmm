
import { useEffect, useRef, useState } from 'react';
import { useRadio } from '@/hooks/useRadioContext';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

export const useSyncChecker = (stationId: string | undefined) => {
  const { stations, syncStationsFromStorage, syncChatMessagesFromStorage } = useRadio();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const lastCheckTime = useRef<number>(Date.now());
  const syncLock = useRef<boolean>(false);
  const deviceId = useRef<string>(getOrCreateDeviceId());
  const [forceSync, setForceSync] = useState<boolean>(false);
  
  // Function to create or retrieve device ID
  function getOrCreateDeviceId() {
    let id = localStorage.getItem('latinmixmasters_device_id');
    if (!id) {
      id = `device_${isMobile ? 'mobile' : 'desktop'}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('latinmixmasters_device_id', id);
    }
    return id;
  }

  // Function to perform a full sync of all data
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
  
  // Function to broadcast sync events to other devices/tabs
  const broadcastSyncEvent = (data: any) => {
    try {
      const eventData = {
        ...data,
        deviceId: deviceId.current,
        timestamp: Date.now()
      };
      
      localStorage.setItem('latinmixmasters_sync_broadcast', JSON.stringify(eventData));
      
      try {
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'latinmixmasters_sync_broadcast',
          newValue: JSON.stringify(eventData)
        }));
      } catch (error) {
        console.error("[SyncChecker] Error broadcasting event:", error);
      }
    } catch (error) {
      console.error("[SyncChecker] Error in broadcastSyncEvent:", error);
    }
  };

  // Handle online status to force sync - critical for mobile
  useEffect(() => {
    const handleOnline = () => {
      console.log(`[SyncChecker] Device online (${isMobile ? 'mobile' : 'desktop'})`);
      setForceSync(true);
      
      // Record reconnection time
      localStorage.setItem('latinmixmasters_last_online', Date.now().toString());
      
      // Perform sync immediately
      performFullSync();
      
      // Reset force sync after a delay
      setTimeout(() => setForceSync(false), 2000);
    };
    
    const handleOffline = () => {
      console.log(`[SyncChecker] Device offline (${isMobile ? 'mobile' : 'desktop'})`);
      localStorage.setItem('latinmixmasters_last_offline', Date.now().toString());
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
    };
  }, [syncStationsFromStorage, syncChatMessagesFromStorage, stationId, isMobile]);

  // Main sync checker effect
  useEffect(() => {
    if (!stationId) return;
    
    // Run sync check immediately on first load
    checkSyncStatus();
    
    // Set different intervals for mobile vs desktop
    const checkInterval = setInterval(() => {
      checkSyncStatus();
    }, isMobile ? 3000 : 6000);
    
    return () => clearInterval(checkInterval);
    
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
        
        // Check for mismatches in critical properties
        const isLiveMismatch = storedStation.isLive !== currentStation.isLive;
        const isChatMismatch = storedStation.chatEnabled !== currentStation.chatEnabled;
        const isVideoMismatch = storedStation.videoStreamUrl !== currentStation.videoStreamUrl;
        
        if (isLiveMismatch || isChatMismatch || isVideoMismatch || forceSync) {
          console.log(`[SyncChecker] Mismatch detected on ${isMobile ? 'mobile' : 'desktop'}`);
          
          // Force a sync to resolve the inconsistency
          syncLock.current = true;
          
          if (syncStationsFromStorage) {
            syncStationsFromStorage();
            
            // Small delay before syncing chat
            setTimeout(() => {
              if (syncChatMessagesFromStorage) {
                syncChatMessagesFromStorage();
              }
              
              // Release the lock after a delay
              setTimeout(() => {
                syncLock.current = false;
              }, 300);
            }, 200);
            
            // Show toast if this is a force sync
            if (forceSync) {
              toast({
                title: `Syncing Station Status`,
                description: "Resolving inconsistency in station status"
              });
            }
            
            // Update sync timestamp
            localStorage.setItem('latinmixmasters_last_sync', now.toString());
            
            // Broadcast sync event
            broadcastSyncEvent({
              stationId,
              action: 'sync_fix',
              timestamp: now,
              isMobile
            });
          } else {
            syncLock.current = false;
          }
        }
      } catch (error) {
        console.error(`[SyncChecker] Error:`, error);
        syncLock.current = false;
      }
      
      lastCheckTime.current = now;
    }
  }, [stationId, stations, syncStationsFromStorage, toast, forceSync, syncChatMessagesFromStorage, isMobile]);
  
  // Listen for broadcast sync events from other tabs/devices
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      // Process sync broadcasts from other devices
      if (e.key === 'latinmixmasters_sync_broadcast' && e.newValue) {
        try {
          const syncData = JSON.parse(e.newValue);
          
          // Only process if it's not from this device
          if (syncData.deviceId !== deviceId.current && syncData.stationId === stationId) {
            console.log(`[SyncChecker] Received sync broadcast from another device`);
            
            // Force a sync when another device broadcasts
            if (!syncLock.current) {
              syncLock.current = true;
              
              setTimeout(() => {
                if (syncStationsFromStorage) {
                  syncStationsFromStorage();
                }
                
                setTimeout(() => {
                  if (syncChatMessagesFromStorage) {
                    syncChatMessagesFromStorage();
                  }
                  syncLock.current = false;
                }, 300);
              }, 100);
            }
          }
        } catch (error) {
          console.error(`[SyncChecker] Error processing broadcast:`, error);
        }
      }
      
      // React to stations changes
      if (e.key === 'latinmixmasters_stations' && e.newValue && !syncLock.current) {
        syncLock.current = true;
        
        if (syncStationsFromStorage) {
          syncStationsFromStorage();
        }
        
        // Release the lock after a delay
        setTimeout(() => {
          syncLock.current = false;
        }, 300);
      }
      
      // React to chat messages changes
      if (e.key === 'latinmixmasters_chat_messages' && e.newValue && !syncLock.current) {
        syncLock.current = true;
        
        if (syncChatMessagesFromStorage) {
          syncChatMessagesFromStorage();
        }
        
        // Release the lock after a delay
        setTimeout(() => {
          syncLock.current = false;
        }, 200);
      }
    };
    
    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, [stationId, syncStationsFromStorage, syncChatMessagesFromStorage, isMobile]);
  
  return null;
};

export default useSyncChecker;
