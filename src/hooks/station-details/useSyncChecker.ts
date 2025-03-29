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
  const lastBroadcastRef = useRef<string | null>(null);
  const prioritySyncTimeout = useRef<number | null>(null);
  
  function getOrCreateDeviceId() {
    let id = localStorage.getItem('latinmixmasters_device_id');
    if (!id) {
      id = `device_${isMobile ? 'mobile' : 'desktop'}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('latinmixmasters_device_id', id);
    }
    return id;
  }

  const performFullSync = (priority: boolean = false) => {
    if (syncLock.current && !priority) return;
    
    syncLock.current = true;
    console.log(`[SyncChecker] Performing ${priority ? 'PRIORITY' : 'regular'} full sync for station: ${stationId}`);
    
    try {
      if (syncStationsFromStorage) {
        syncStationsFromStorage();
      }
      
      setTimeout(() => {
        if (syncChatMessagesFromStorage) {
          syncChatMessagesFromStorage();
        }
        
        const syncTimestamp = Date.now();
        localStorage.setItem('latinmixmasters_last_sync', syncTimestamp.toString());
        localStorage.setItem(`latinmixmasters_device_${deviceId.current}_sync`, syncTimestamp.toString());
        
        if (stationId) {
          broadcastSyncEvent({
            stationId,
            action: priority ? 'priority_sync_complete' : 'full_sync',
            timestamp: syncTimestamp,
            isMobile
          });
        }
      }, isMobile ? 100 : 200);
    } finally {
      setTimeout(() => {
        syncLock.current = false;
      }, isMobile ? 300 : 500);
    }
  };
  
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

  useEffect(() => {
    const handleOnline = () => {
      console.log(`[SyncChecker] Device online (${isMobile ? 'mobile' : 'desktop'})`);
      setForceSync(true);
      
      localStorage.setItem('latinmixmasters_last_online', Date.now().toString());
      
      performFullSync(true);
      
      setTimeout(() => setForceSync(false), 2000);
    };
    
    const handleOffline = () => {
      console.log(`[SyncChecker] Device offline (${isMobile ? 'mobile' : 'desktop'})`);
      localStorage.setItem('latinmixmasters_last_offline', Date.now().toString());
    };
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log(`[SyncChecker] App became visible (${isMobile ? 'mobile' : 'desktop'}), syncing...`);
        performFullSync(isMobile);
      }
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    if (stationId) {
      performFullSync(isMobile);
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (prioritySyncTimeout.current) {
        clearTimeout(prioritySyncTimeout.current);
      }
    };
  }, [syncStationsFromStorage, syncChatMessagesFromStorage, stationId, isMobile]);

  useEffect(() => {
    if (!stationId) return;
    
    const checkForBroadcastActions = () => {
      const hostAction = localStorage.getItem('latinmixmasters_host_action');
      const lastBroadcast = localStorage.getItem('latinmixmasters_last_broadcast');
      const lastChatToggle = localStorage.getItem('latinmixmasters_last_chat_toggle');
      
      if (hostAction === 'true' || 
          (lastBroadcast && lastBroadcast !== lastBroadcastRef.current) ||
          (lastChatToggle && lastChatToggle !== lastBroadcastRef.current)) {
        
        console.log(`[SyncChecker] Host broadcast action detected on ${isMobile ? 'mobile' : 'desktop'}`);
        
        syncLock.current = true;
        
        if (lastBroadcast) lastBroadcastRef.current = lastBroadcast;
        if (lastChatToggle) lastBroadcastRef.current = lastChatToggle;
        
        if (syncStationsFromStorage) {
          syncStationsFromStorage();
          
          setTimeout(() => {
            if (syncChatMessagesFromStorage) {
              syncChatMessagesFromStorage();
            }
            
            setTimeout(() => {
              syncLock.current = false;
            }, 200);
          }, 100);
        } else {
          syncLock.current = false;
        }
      }
    };
    
    checkForBroadcastActions();
    
    const checkInterval = setInterval(() => {
      checkSyncStatus();
      checkForBroadcastActions();
    }, isMobile ? 2000 : 4000);
    
    return () => clearInterval(checkInterval);
    
    function checkSyncStatus() {
      if (syncLock.current) return;
      
      const now = Date.now();
      
      if (!forceSync && now - lastCheckTime.current < (isMobile ? 1000 : 2000)) {
        return;
      }
      
      try {
        const storedStationsJson = localStorage.getItem('latinmixmasters_stations');
        if (!storedStationsJson) return;
        
        const storedStations = JSON.parse(storedStationsJson);
        const storedStation = storedStations.find((s: any) => s.id === stationId);
        
        if (!storedStation) return;
        
        const currentStation = stations.find(s => s.id === stationId);
        if (!currentStation) return;
        
        const isLiveMismatch = storedStation.isLive !== currentStation.isLive;
        const isChatMismatch = storedStation.chatEnabled !== currentStation.chatEnabled;
        const isVideoMismatch = storedStation.videoStreamUrl !== currentStation.videoStreamUrl;
        
        if (isLiveMismatch || isChatMismatch || isVideoMismatch || forceSync) {
          console.log(`[SyncChecker] Broadcast control mismatch detected on ${isMobile ? 'mobile' : 'desktop'}`);
          
          syncLock.current = true;
          
          if (syncStationsFromStorage) {
            syncStationsFromStorage();
            
            setTimeout(() => {
              if (syncChatMessagesFromStorage) {
                syncChatMessagesFromStorage();
              }
              
              setTimeout(() => {
                syncLock.current = false;
              }, 200);
            }, 100);
            
            if (isLiveMismatch || isChatMismatch) {
              toast({
                title: `Station Status Updated`,
                description: isLiveMismatch 
                  ? `Station is now ${storedStation.isLive ? 'LIVE' : 'offline'}`
                  : `Chat is now ${storedStation.chatEnabled ? 'enabled' : 'disabled'}`
              });
            }
            
            localStorage.setItem('latinmixmasters_last_sync', now.toString());
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
  
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'latinmixmasters_sync_broadcast' && e.newValue) {
        try {
          const syncData = JSON.parse(e.newValue);
          
          if (syncData.deviceId !== deviceId.current && syncData.stationId === stationId) {
            console.log(`[SyncChecker] Received sync broadcast: ${syncData.action || 'unknown action'}`);
            
            if (syncData.action === 'broadcast_control' || syncData.action === 'broadcast_chat_toggle') {
              if (prioritySyncTimeout.current) {
                clearTimeout(prioritySyncTimeout.current);
              }
              
              prioritySyncTimeout.current = window.setTimeout(() => {
                if (!syncLock.current) {
                  performFullSync(true);
                }
              }, isMobile ? 100 : 200);
            } else if (!syncLock.current) {
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
                }, 200);
              }, 100);
            }
          }
        } catch (error) {
          console.error(`[SyncChecker] Error processing broadcast:`, error);
        }
      }
      
      if (e.key && e.key.includes('_status') && e.newValue && !syncLock.current) {
        try {
          const statusData = JSON.parse(e.newValue);
          if (statusData.action === 'broadcast_status_change' || 
              statusData.action === 'chat_toggle') {
            
            console.log(`[SyncChecker] Detected broadcast control change: ${statusData.action}`);
            
            syncLock.current = true;
            
            if (syncStationsFromStorage) {
              syncStationsFromStorage();
              
              setTimeout(() => {
                if (syncChatMessagesFromStorage) {
                  syncChatMessagesFromStorage();
                }
                
                syncLock.current = false;
              }, 200);
            } else {
              syncLock.current = false;
            }
          }
        } catch (error) {
          console.error(`[SyncChecker] Error processing status change:`, error);
          syncLock.current = false;
        }
      }
      
      if (e.key === 'latinmixmasters_stations' && e.newValue && !syncLock.current) {
        syncLock.current = true;
        
        if (syncStationsFromStorage) {
          syncStationsFromStorage();
        }
        
        setTimeout(() => {
          syncLock.current = false;
        }, 300);
      }
      
      if (e.key === 'latinmixmasters_chat_messages' && e.newValue && !syncLock.current) {
        syncLock.current = true;
        
        if (syncChatMessagesFromStorage) {
          syncChatMessagesFromStorage();
        }
        
        setTimeout(() => {
          syncLock.current = false;
        }, 200);
      }
    };
    
    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, [stationId, syncStationsFromStorage, syncChatMessagesFromStorage, isMobile]);
  
  useEffect(() => {
    const handleBroadcastEvent = (e: any) => {
      if (!stationId) return;
      
      const { detail } = e;
      if (detail && detail.stationId === stationId) {
        console.log(`[SyncChecker] Custom broadcast event: ${detail.action}`);
        
        performFullSync(true);
      }
    };
    
    window.addEventListener('latinmixmasters_broadcast', handleBroadcastEvent);
    
    return () => {
      window.removeEventListener('latinmixmasters_broadcast', handleBroadcastEvent);
    };
  }, [stationId]);
  
  return null;
};

export default useSyncChecker;
