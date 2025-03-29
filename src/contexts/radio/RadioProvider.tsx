
import React, { useReducer, ReactNode, useEffect, useRef } from 'react';
import RadioContext from './RadioContext';
import { radioReducer, initialRadioState, initialStations } from './radioReducer';
import { useRadioActions } from './radioActions';
import { useIsMobile } from '@/hooks/use-mobile';

export const RadioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(radioReducer, initialRadioState);
  const isMobile = useIsMobile();
  const isSyncing = useRef(false);
  const lastSyncTime = useRef<number>(Date.now());
  const deviceId = useRef<string>(getOrCreateDeviceId());
  const pendingSyncActions = useRef<{type: string, timestamp: number}[]>([]);
  
  // Get or create device id with mobile/desktop indicator
  function getOrCreateDeviceId() {
    let id = localStorage.getItem('latinmixmasters_device_id');
    if (!id) {
      // Include device type in the ID for better debugging
      id = `device_${isMobile ? 'mobile' : 'desktop'}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('latinmixmasters_device_id', id);
    }
    return id;
  }
  
  const actions = useRadioActions(state, dispatch);
  
  // Initialize data from localStorage with priority for mobile devices
  useEffect(() => {
    console.log(`[RadioProvider] Initializing on ${isMobile ? 'mobile' : 'desktop'} device ${deviceId.current}`);
    
    // Track initialization in localStorage
    localStorage.setItem(`latinmixmasters_device_${deviceId.current}_init`, Date.now().toString());
    
    // Function to load stations and set initial state
    const loadStations = () => {
      const savedStations = localStorage.getItem('latinmixmasters_stations');
      if (savedStations) {
        try {
          dispatch({ type: 'SET_STATIONS', payload: JSON.parse(savedStations) });
        } catch (error) {
          console.error("Failed to parse saved stations:", error);
          dispatch({ type: 'SET_STATIONS', payload: initialStations });
          localStorage.setItem('latinmixmasters_stations', JSON.stringify(initialStations));
        }
      } else {
        dispatch({ type: 'SET_STATIONS', payload: initialStations });
        localStorage.setItem('latinmixmasters_stations', JSON.stringify(initialStations));
      }
    };
    
    // Load stations data
    loadStations();
    
    // Load bookings
    const savedBookings = localStorage.getItem('latinmixmasters_bookings');
    if (savedBookings) {
      try {
        dispatch({ type: 'SET_BOOKINGS', payload: JSON.parse(savedBookings) });
      } catch (error) {
        console.error("Failed to parse saved bookings:", error);
        localStorage.setItem('latinmixmasters_bookings', JSON.stringify([]));
      }
    } else {
      localStorage.setItem('latinmixmasters_bookings', JSON.stringify([]));
    }

    // Load chat messages
    const loadChatMessages = () => {
      const savedChatMessages = localStorage.getItem('latinmixmasters_chat_messages');
      if (savedChatMessages) {
        try {
          dispatch({ type: 'SET_CHAT_MESSAGES', payload: JSON.parse(savedChatMessages) });
        } catch (error) {
          console.error("Failed to parse saved chat messages:", error);
          localStorage.setItem('latinmixmasters_chat_messages', JSON.stringify({}));
        }
      } else {
        localStorage.setItem('latinmixmasters_chat_messages', JSON.stringify({}));
      }
    };
    
    // Load chat messages
    loadChatMessages();
    
    // Record the device sync time
    localStorage.setItem('latinmixmasters_device_sync_time', Date.now().toString());
    localStorage.setItem(`latinmixmasters_device_${deviceId.current}_loaded`, Date.now().toString());
    
    // Immediate sync broadcast to make presence known to other devices
    try {
      localStorage.setItem('latinmixmasters_sync_broadcast', JSON.stringify({
        deviceId: deviceId.current,
        timestamp: Date.now(),
        action: 'init',
        isMobile
      }));
    } catch (error) {
      console.error("Error broadcasting init event:", error);
    }
    
    // Setup storage change listener
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key || !e.newValue) return;
      
      if (isSyncing.current) return;
      
      const now = Date.now();
      
      // Different sync throttle times for mobile vs desktop
      const minSyncInterval = isMobile ? 300 : 500;
      
      if (now - lastSyncTime.current < minSyncInterval) {
        // Queue this sync action for later if we're throttling
        pendingSyncActions.current.push({
          type: e.key,
          timestamp: now
        });
        
        return;
      }
      
      lastSyncTime.current = now;
      
      console.log(`[RadioProvider] Storage change detected on ${isMobile ? 'mobile' : 'desktop'}: ${e.key} at ${new Date(now).toISOString()}`);
      
      processStorageChange(e.key, e.newValue);
    };
    
    // Helper function to process storage changes
    const processStorageChange = (key: string, newValue: string) => {
      if (key === 'latinmixmasters_chat_messages') {
        try {
          const newMessages = JSON.parse(newValue);
          if (JSON.stringify(state.chatMessages) !== newValue) {
            dispatch({ type: 'SET_CHAT_MESSAGES', payload: newMessages });
            localStorage.setItem(`latinmixmasters_device_${deviceId.current}_chat_sync`, Date.now().toString());
          }
        } catch (error) {
          console.error("Failed to parse updated chat messages:", error);
        }
      }
      
      else if (key === 'latinmixmasters_stations') {
        try {
          const newStations = JSON.parse(newValue);
          if (JSON.stringify(state.stations) !== newValue) {
            dispatch({ type: 'SET_STATIONS', payload: newStations });
            localStorage.setItem(`latinmixmasters_device_${deviceId.current}_stations_sync`, Date.now().toString());
          }
        } catch (error) {
          console.error("Failed to parse updated stations:", error);
        }
      }
      
      else if (key === 'station_status_sync' || key === 'chat_enabled_sync') {
        if (actions.syncStationsFromStorage) {
          isSyncing.current = true;
          actions.syncStationsFromStorage();
          setTimeout(() => {
            isSyncing.current = false;
            // Process any pending actions
            processPendingActions();
          }, isMobile ? 300 : 500);
        }
      }
      
      else if (key.startsWith('station_') && (key.includes('_status') || key.includes('_chat'))) {
        if (actions.syncStationsFromStorage) {
          isSyncing.current = true;
          actions.syncStationsFromStorage();
          setTimeout(() => {
            if (actions.syncChatMessagesFromStorage) {
              actions.syncChatMessagesFromStorage();
            }
            isSyncing.current = false;
            // Process any pending actions
            processPendingActions();
          }, isMobile ? 300 : 500);
        }
      }
      
      else if (key === 'latinmixmasters_sync_broadcast' && newValue) {
        try {
          const syncData = JSON.parse(newValue);
          if (syncData.deviceId !== deviceId.current) {
            console.log(`[RadioProvider] Received sync broadcast on ${isMobile ? 'mobile' : 'desktop'} from another device:`, syncData);
            
            // If we're receiving from a desktop and we're mobile, prioritize the desktop data
            const shouldPrioritize = isMobile && !syncData.isMobile;
            
            if (actions.syncStationsFromStorage) {
              isSyncing.current = true;
              
              // Use timeout to ensure proper sequence
              setTimeout(() => {
                actions.syncStationsFromStorage();
                
                setTimeout(() => {
                  if (actions.syncChatMessagesFromStorage) {
                    actions.syncChatMessagesFromStorage();
                  }
                  isSyncing.current = false;
                  
                  // Process any pending actions
                  processPendingActions();
                }, shouldPrioritize ? 200 : 300);
              }, shouldPrioritize ? 0 : 100);
            }
          }
        } catch (error) {
          console.error("Error processing sync broadcast:", error);
        }
      }
    };
    
    // Helper function to process pending sync actions
    const processPendingActions = () => {
      if (pendingSyncActions.current.length === 0) return;
      
      // Process oldest action first
      const oldestAction = pendingSyncActions.current.sort((a, b) => a.timestamp - b.timestamp)[0];
      pendingSyncActions.current = pendingSyncActions.current.filter(a => a !== oldestAction);
      
      // Get the latest value for this key
      const latestValue = localStorage.getItem(oldestAction.type);
      if (latestValue) {
        processStorageChange(oldestAction.type, latestValue);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Different sync intervals for mobile and desktop
    const syncInterval = setInterval(() => {
      if (!isSyncing.current) {
        isSyncing.current = true;
        setTimeout(() => {
          if (actions.syncChatMessagesFromStorage) {
            actions.syncChatMessagesFromStorage();
          }
          setTimeout(() => {
            if (actions.syncStationsFromStorage) {
              actions.syncStationsFromStorage();
              localStorage.setItem('latinmixmasters_last_global_sync', Date.now().toString());
              localStorage.setItem(`latinmixmasters_device_${deviceId.current}_global_sync`, Date.now().toString());
            }
            isSyncing.current = false;
            // Process any pending actions
            processPendingActions();
          }, isMobile ? 200 : 400);
        }, 0);
      }
    }, isMobile ? 3000 : 5000); // Mobile syncs more frequently
    
    // Enhanced online/offline handlers for better mobile experience
    const handleOnline = () => {
      console.log(`[RadioProvider] Device is online (${isMobile ? 'mobile' : 'desktop'}), syncing data...`);
      if (actions.syncStationsFromStorage) {
        isSyncing.current = true;
        
        // Do a full sync sequence
        actions.syncStationsFromStorage();
        
        const reconnectTime = Date.now();
        localStorage.setItem('latinmixmasters_last_reconnect', reconnectTime.toString());
        localStorage.setItem(`latinmixmasters_device_${deviceId.current}_reconnect`, reconnectTime.toString());
        
        // For mobile devices, do multiple sync attempts to account for unstable connections
        const syncTimeout = isMobile ? 300 : 500;
        
        setTimeout(() => {
          if (actions.syncChatMessagesFromStorage) {
            actions.syncChatMessagesFromStorage();
          }
          
          // For mobile, do one more sync after a delay to ensure we're caught up
          if (isMobile) {
            setTimeout(() => {
              actions.syncStationsFromStorage();
              setTimeout(() => {
                actions.syncChatMessagesFromStorage();
                isSyncing.current = false;
              }, 300);
            }, 800);
          } else {
            isSyncing.current = false;
          }
          
          try {
            window.dispatchEvent(new StorageEvent('storage', {
              key: 'latinmixmasters_sync_broadcast',
              newValue: JSON.stringify({
                deviceId: deviceId.current,
                timestamp: Date.now(),
                action: 'reconnect',
                isMobile
              })
            }));
          } catch (error) {
            console.error("Error broadcasting reconnect event:", error);
          }
        }, syncTimeout);
      }
    };
    
    const handleOffline = () => {
      const offlineTime = Date.now();
      localStorage.setItem('latinmixmasters_last_offline', offlineTime.toString());
      localStorage.setItem(`latinmixmasters_device_${deviceId.current}_offline`, offlineTime.toString());
      console.log(`[RadioProvider] Device went offline (${isMobile ? 'mobile' : 'desktop'}) at:`, new Date(offlineTime).toISOString());
    };
    
    // For mobile devices, also listen for visibilitychange events
    const handleVisibilityChange = () => {
      if (isMobile && document.visibilityState === 'visible') {
        console.log("[RadioProvider] Mobile app became visible, syncing...");
        if (!isSyncing.current && actions.syncStationsFromStorage) {
          isSyncing.current = true;
          actions.syncStationsFromStorage();
          
          setTimeout(() => {
            if (actions.syncChatMessagesFromStorage) {
              actions.syncChatMessagesFromStorage();
            }
            isSyncing.current = false;
          }, 300);
        }
      }
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // On mobile, do one additional sync after a delay to catch any missed updates
    if (isMobile) {
      const mobileDelayedSync = setTimeout(() => {
        if (actions.syncStationsFromStorage && actions.syncChatMessagesFromStorage) {
          console.log("[RadioProvider] Performing additional mobile sync after delay");
          actions.syncStationsFromStorage();
          setTimeout(() => {
            actions.syncChatMessagesFromStorage();
          }, 300);
        }
      }, 1500);
      
      return () => {
        clearTimeout(mobileDelayedSync);
      };
    }
    
    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  // Special mobile-focused quick sync effect for chat
  useEffect(() => {
    if (isMobile && window.location.href.includes('/stations/')) {
      console.log("[RadioProvider] Setting up mobile quick sync for chat");
      
      const quickSyncInterval = setInterval(() => {
        if (!isSyncing.current && actions.syncChatMessagesFromStorage) {
          actions.syncChatMessagesFromStorage();
        }
      }, 1200); // Very frequent on mobile when on station page
      
      // Also sync on visibility change for mobile
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          if (!isSyncing.current && actions.syncChatMessagesFromStorage) {
            actions.syncChatMessagesFromStorage();
            
            // Also sync stations after a short delay
            setTimeout(() => {
              if (actions.syncStationsFromStorage) {
                actions.syncStationsFromStorage();
              }
            }, 200);
          }
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        clearInterval(quickSyncInterval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [actions, isMobile]);
  
  const contextValue = {
    stations: state.stations,
    bookings: state.bookings,
    currentPlayingStation: state.currentPlayingStation,
    audioState: state.audioState,
    chatMessages: state.chatMessages,
    setStationLiveStatus: actions.setStationLiveStatus,
    toggleChatEnabled: actions.toggleChatEnabled,
    ...actions
  };

  return (
    <RadioContext.Provider value={contextValue}>
      {children}
    </RadioContext.Provider>
  );
};

export default RadioProvider;
