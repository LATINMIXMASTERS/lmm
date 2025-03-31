
import { useToast } from '@/hooks/use-toast';

export const useStatusActions = (
  state: { stations: any[], chatMessages: Record<string, any> }, 
  dispatch: React.Dispatch<any>
) => {
  const { toast } = useToast();

  // Helper to generate a unique device ID if one doesn't exist
  const getDeviceId = () => {
    let deviceId = localStorage.getItem('latinmixmasters_device_id');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('latinmixmasters_device_id', deviceId);
    }
    return deviceId;
  };
  
  // Improved forced sync function
  const forceSyncAcrossDevices = (action: string, data: any) => {
    const deviceId = getDeviceId();
    const syncTimestamp = Date.now();
    
    // Create detailed sync data
    const syncData = JSON.stringify({
      action,
      ...data,
      timestamp: syncTimestamp,
      deviceId
    });
    
    // Store with multiple keys for better detection
    localStorage.setItem(`latinmixmasters_${action}`, syncData);
    localStorage.setItem('latinmixmasters_last_action', syncData);
    localStorage.setItem('latinmixmasters_sync_timestamp', syncTimestamp.toString());
    
    // Force storage events for cross-tab sync
    try {
      // Main event
      window.dispatchEvent(new StorageEvent('storage', {
        key: `latinmixmasters_${action}`,
        newValue: syncData
      }));
      
      // Backup event with different key
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'latinmixmasters_sync_broadcast',
        newValue: syncData
      }));
      
      // Broadcast custom event for immediate in-page sync
      const broadcastEvent = new CustomEvent('latinmixmasters_broadcast', {
        detail: {
          action,
          ...data,
          timestamp: syncTimestamp
        }
      });
      window.dispatchEvent(broadcastEvent);
    } catch (error) {
      console.error("Error forcing sync:", error);
    }
    
    return syncTimestamp;
  };

  const setStationLiveStatusImpl = (stationId: string, isLive: boolean, enableChat: boolean = false): void => {
    // Get current station status before making changes
    const currentStation = state.stations.find(s => s.id === stationId);
    const statusChanged = currentStation?.isLive !== isLive;
    const chatChanged = currentStation?.chatEnabled !== enableChat;
    
    // Only proceed if there's an actual change in status
    if (!statusChanged && !chatChanged) {
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
    localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
    
    // Force synchronization across all devices and tabs
    const syncTimestamp = forceSyncAcrossDevices('station_live_status', {
      stationId,
      isLive,
      chatEnabled: enableChat
    });
    
    // Also set station-specific status for more reliable detection
    localStorage.setItem(`station_${stationId}_status`, JSON.stringify({
      isLive,
      chatEnabled: enableChat,
      timestamp: syncTimestamp
    }));
    
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
    localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
    
    // Force synchronization across all devices and tabs
    const syncTimestamp = forceSyncAcrossDevices('chat_toggle', {
      stationId,
      chatEnabled: enabled
    });
    
    // Station-specific chat status for more reliable detection
    localStorage.setItem(`station_${stationId}_chat`, JSON.stringify({
      enabled,
      timestamp: syncTimestamp
    }));
    
    toast({
      title: enabled ? "Chat Enabled" : "Chat Disabled",
      description: `Chat has been ${enabled ? 'enabled' : 'disabled'} for this station.`
    });
  };

  // Enhanced function to clear chat messages
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
        
        // Force sync of message clearing to all devices
        const clearTimestamp = forceSyncAcrossDevices('clear_chat_messages', {
          stationId
        });
        
        // Station-specific clear message for more reliable detection
        localStorage.setItem(`station_${stationId}_chat_clear`, JSON.stringify({
          timestamp: clearTimestamp
        }));
        
        // Force a storage event for cross-tab synchronization
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
