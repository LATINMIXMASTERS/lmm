
import { useToast } from '@/hooks/use-toast';

export const useStatusActions = (
  state: { stations: any[], chatMessages: Record<string, any> }, 
  dispatch: React.Dispatch<any>
) => {
  const { toast } = useToast();

  const setStationLiveStatusImpl = (stationId: string, isLive: boolean, enableChat: boolean = false): void => {
    // Get current station status before making changes
    const currentStation = state.stations.find(s => s.id === stationId);
    const statusChanged = currentStation?.isLive !== isLive;
    
    // Only proceed if there's an actual change in status
    if (!statusChanged && currentStation?.chatEnabled === enableChat) {
      return;
    }
    
    // Clean up chat data when station goes offline
    if (!isLive && currentStation?.isLive) {
      clearChatMessagesForStationImpl(stationId);
    }
    
    dispatch({
      type: 'SET_STATION_LIVE_STATUS',
      payload: { stationId, isLive, chatEnabled: enableChat }
    });

    const updatedStations = state.stations.map(station => {
      if (station.id === stationId) {
        return { ...station, isLive, chatEnabled: enableChat };
      }
      return station;
    });
    
    // Force localStorage update with a timestamp to ensure cross-device sync
    const syncTimestamp = new Date().toISOString();
    
    // Update localStorage to ensure cross-device sync
    localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
    localStorage.setItem('station_status_sync', syncTimestamp);
    
    // Enhanced multi-device synchronization
    try {
      // 1. Use storage events to sync across tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'latinmixmasters_stations',
        newValue: JSON.stringify(updatedStations)
      }));
      
      // 2. Use dedicated sync key for status changes
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'station_status_sync',
        newValue: syncTimestamp
      }));
      
      // 3. Set unique keys for different types of changes for better sync
      const syncData = JSON.stringify({
        stationId,
        isLive,
        chatEnabled: enableChat,
        timestamp: syncTimestamp,
        action: 'broadcast_status_change'
      });
      
      // Store with unique keys for different actions
      localStorage.setItem(`station_${stationId}_status`, syncData);
      localStorage.setItem('latinmixmasters_last_broadcast', syncData);
      
      // 4. Force a broadcast event with high priority
      const broadcastData = JSON.stringify({
        deviceId: localStorage.getItem('latinmixmasters_device_id') || 'unknown',
        timestamp: Date.now(),
        stationId,
        isLive,
        chatEnabled: enableChat,
        action: 'broadcast_control',
        priority: 'high'
      });
      
      localStorage.setItem('latinmixmasters_sync_broadcast', broadcastData);
      
      // 5. Set a flag that this is a host-initiated change
      localStorage.setItem('latinmixmasters_host_action', 'true');
      setTimeout(() => localStorage.removeItem('latinmixmasters_host_action'), 2000);
    } catch (error) {
      console.error("Failed to dispatch storage event:", error);
    }
    
    // Notify users when a station goes live
    if (isLive && statusChanged) {
      const stationName = state.stations.find(s => s.id === stationId)?.name || 'A station';
      toast({
        title: "Station is Live!",
        description: `${stationName} is now broadcasting live${enableChat ? ' with chat enabled' : ''}.`
      });
    }
  };

  const toggleChatEnabledImpl = (stationId: string, enabled: boolean): void => {
    // Get current station to check if there's a change
    const currentStation = state.stations.find(s => s.id === stationId);
    if (currentStation?.chatEnabled === enabled) {
      return; // No change, avoid unnecessary updates
    }
    
    // If disabling chat, clean up the messages
    if (!enabled && currentStation?.chatEnabled) {
      clearChatMessagesForStationImpl(stationId);
    }
    
    dispatch({
      type: 'TOGGLE_CHAT_ENABLED',
      payload: { stationId, enabled }
    });

    const updatedStations = state.stations.map(station => {
      if (station.id === stationId) {
        return { ...station, chatEnabled: enabled };
      }
      return station;
    });
    
    // Force localStorage update with a timestamp to ensure cross-device sync
    const syncTimestamp = new Date().toISOString();
    
    // Enhanced multi-device synchronization for chat toggle
    localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
    localStorage.setItem('chat_enabled_sync', syncTimestamp);
    
    try {
      // 1. Use multiple storage events for better cross-tab sync
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'latinmixmasters_stations',
        newValue: JSON.stringify(updatedStations)
      }));
      
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'chat_enabled_sync',
        newValue: syncTimestamp
      }));
      
      // 2. Store action-specific data for better sync detection
      const syncData = JSON.stringify({
        stationId,
        chatEnabled: enabled,
        timestamp: syncTimestamp,
        action: 'chat_toggle'
      });
      localStorage.setItem(`station_${stationId}_chat`, syncData);
      localStorage.setItem('latinmixmasters_last_chat_toggle', syncData);
      
      // 3. Force broadcast with high priority
      const broadcastData = JSON.stringify({
        deviceId: localStorage.getItem('latinmixmasters_device_id') || 'unknown',
        timestamp: Date.now(),
        stationId,
        chatEnabled: enabled,
        action: 'broadcast_chat_toggle',
        priority: 'high'
      });
      
      localStorage.setItem('latinmixmasters_sync_broadcast', broadcastData);
      
      // 4. Set a flag that this is a host-initiated change
      localStorage.setItem('latinmixmasters_host_action', 'true');
      setTimeout(() => localStorage.removeItem('latinmixmasters_host_action'), 2000);
    } catch (error) {
      console.error("Failed to dispatch storage event:", error);
    }
    
    toast({
      title: enabled ? "Chat Enabled" : "Chat Disabled",
      description: `Chat has been ${enabled ? 'enabled' : 'disabled'} for this station.`
    });
  };

  // This function depends on clearChatMessagesForStationImpl,
  // so we need to implement it here to avoid circular dependencies
  const clearChatMessagesForStationImpl = (stationId: string): void => {
    try {
      // Get current messages directly from localStorage
      const storedMessages = localStorage.getItem('latinmixmasters_chat_messages');
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        // Remove chat messages for this station
        const { [stationId]: _, ...remainingMessages } = parsedMessages;
        
        // Update localStorage
        localStorage.setItem('latinmixmasters_chat_messages', JSON.stringify(remainingMessages));
        
        // Update state
        dispatch({ 
          type: 'SET_CHAT_MESSAGES', 
          payload: remainingMessages 
        });
        
        // Broadcast chat message clear event
        const clearEvent = JSON.stringify({
          stationId,
          action: 'clear_chat',
          timestamp: Date.now(),
          deviceId: localStorage.getItem('latinmixmasters_device_id') || 'unknown'
        });
        localStorage.setItem(`latinmixmasters_chat_clear_${stationId}`, clearEvent);
        
        // Force a storage event for cross-tab/device synchronization
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'latinmixmasters_chat_messages',
          newValue: JSON.stringify(remainingMessages)
        }));
        
        console.log(`Chat messages for station ${stationId} cleared at ${new Date().toISOString()}`);
      }
    } catch (error) {
      console.error(`Failed to clear chat messages for station ${stationId}:`, error);
    }
  };

  return {
    setStationLiveStatus: setStationLiveStatusImpl,
    toggleChatEnabled: toggleChatEnabledImpl,
    // We expose this again here to avoid circular dependencies
    clearChatMessagesForStation: clearChatMessagesForStationImpl
  };
};
