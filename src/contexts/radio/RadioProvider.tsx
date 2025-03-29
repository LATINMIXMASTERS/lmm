import React, { useReducer, ReactNode, useEffect, useRef } from 'react';
import RadioContext from './RadioContext';
import { radioReducer, initialRadioState, initialStations } from './radioReducer';
import { useRadioActions } from './radioActions';

export const RadioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(radioReducer, initialRadioState);
  const isSyncing = useRef(false);
  const lastSyncTime = useRef<number>(Date.now());
  const deviceId = useRef<string>(getOrCreateDeviceId());
  
  function getOrCreateDeviceId() {
    let id = localStorage.getItem('latinmixmasters_device_id');
    if (!id) {
      id = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('latinmixmasters_device_id', id);
    }
    return id;
  }
  
  const actions = useRadioActions(state, dispatch);
  
  useEffect(() => {
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
    
    localStorage.setItem('latinmixmasters_device_sync_time', Date.now().toString());
    localStorage.setItem(`latinmixmasters_device_${deviceId.current}_loaded`, Date.now().toString());
    
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key || !e.newValue) return;
      
      if (isSyncing.current) return;
      
      const now = Date.now();
      if (now - lastSyncTime.current < 500) return;
      lastSyncTime.current = now;
      
      console.log(`Storage change detected: ${e.key} at ${new Date().toISOString()}`);
      
      if (e.key === 'latinmixmasters_chat_messages') {
        try {
          const newMessages = JSON.parse(e.newValue);
          if (JSON.stringify(state.chatMessages) !== e.newValue) {
            dispatch({ type: 'SET_CHAT_MESSAGES', payload: newMessages });
          }
        } catch (error) {
          console.error("Failed to parse updated chat messages:", error);
        }
      }
      
      else if (e.key === 'latinmixmasters_stations') {
        try {
          const newStations = JSON.parse(e.newValue);
          if (JSON.stringify(state.stations) !== e.newValue) {
            dispatch({ type: 'SET_STATIONS', payload: newStations });
            localStorage.setItem(`latinmixmasters_device_${deviceId.current}_stations_sync`, now.toString());
          }
        } catch (error) {
          console.error("Failed to parse updated stations:", error);
        }
      }
      
      else if (e.key === 'station_status_sync' || e.key === 'chat_enabled_sync') {
        if (actions.syncStationsFromStorage) {
          isSyncing.current = true;
          actions.syncStationsFromStorage();
          setTimeout(() => {
            isSyncing.current = false;
          }, 500);
        }
      }
      
      else if (e.key.startsWith('station_') && (e.key.includes('_status') || e.key.includes('_chat'))) {
        if (actions.syncStationsFromStorage) {
          isSyncing.current = true;
          actions.syncStationsFromStorage();
          setTimeout(() => {
            if (actions.syncChatMessagesFromStorage) {
              actions.syncChatMessagesFromStorage();
            }
            isSyncing.current = false;
          }, 500);
        }
      }
      
      else if (e.key === 'latinmixmasters_sync_broadcast' && e.newValue) {
        try {
          const syncData = JSON.parse(e.newValue);
          if (syncData.deviceId !== deviceId.current) {
            console.log("Received sync broadcast from another device:", syncData);
            if (actions.syncStationsFromStorage) {
              isSyncing.current = true;
              actions.syncStationsFromStorage();
              setTimeout(() => {
                if (actions.syncChatMessagesFromStorage) {
                  actions.syncChatMessagesFromStorage();
                }
                isSyncing.current = false;
              }, 500);
            }
          }
        } catch (error) {
          console.error("Error processing sync broadcast:", error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
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
          }, 500);
        }, 0);
      }
    }, 5000);
    
    const handleOnline = () => {
      console.log("Device is online, syncing data...");
      if (actions.syncStationsFromStorage) {
        isSyncing.current = true;
        actions.syncStationsFromStorage();
        const reconnectTime = Date.now();
        localStorage.setItem('latinmixmasters_last_reconnect', reconnectTime.toString());
        localStorage.setItem(`latinmixmasters_device_${deviceId.current}_reconnect`, reconnectTime.toString());
        setTimeout(() => {
          if (actions.syncChatMessagesFromStorage) {
            actions.syncChatMessagesFromStorage();
          }
          isSyncing.current = false;
          try {
            window.dispatchEvent(new StorageEvent('storage', {
              key: 'latinmixmasters_sync_broadcast',
              newValue: JSON.stringify({
                deviceId: deviceId.current,
                timestamp: Date.now(),
                action: 'reconnect'
              })
            }));
          } catch (error) {
            console.error("Error broadcasting reconnect event:", error);
          }
        }, 500);
      }
    };
    
    const handleOffline = () => {
      const offlineTime = Date.now();
      localStorage.setItem('latinmixmasters_last_offline', offlineTime.toString());
      localStorage.setItem(`latinmixmasters_device_${deviceId.current}_offline`, offlineTime.toString());
      console.log("Device went offline at:", new Date(offlineTime).toISOString());
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  useEffect(() => {
    if (window.location.href.includes('/stations/')) {
      const quickSyncInterval = setInterval(() => {
        if (!isSyncing.current && actions.syncChatMessagesFromStorage) {
          actions.syncChatMessagesFromStorage();
        }
      }, 1500);
      
      return () => {
        clearInterval(quickSyncInterval);
      };
    }
  }, [actions]);
  
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
