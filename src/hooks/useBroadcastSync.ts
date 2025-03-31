
import { useState, useEffect, useCallback } from 'react';
import { useRadio } from '@/hooks/useRadioContext';
import { RadioMetadata } from '@/models/RadioStation';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

// Interface for handling incoming metadata which might not have all required fields
interface MetadataInput {
  title?: string;
  artist?: string;
  album?: string;
  coverArt?: string;
  genre?: string;
  year?: string;
  timestamp?: number;
}

const useBroadcastSync = () => {
  const { stations, updateStationMetadata, updateStationListeners, syncStationsFromStorage } = useRadio();
  const { toast } = useToast();
  const [lastBroadcastTime, setLastBroadcastTime] = useState(0);
  const [deviceId] = useState(() => localStorage.getItem('lmm_device_id') || uuidv4());
  
  // Ensure our device ID is saved
  useEffect(() => {
    if (!localStorage.getItem('lmm_device_id')) {
      localStorage.setItem('lmm_device_id', deviceId);
    }
  }, [deviceId]);
  
  // Broadcast station metadata to other instances
  const broadcastMetadata = useCallback((stationId: string, metadata: MetadataInput) => {
    try {
      const now = Date.now();
      // Don't broadcast too frequently (limit to once per second per device)
      if (now - lastBroadcastTime < 1000) {
        return;
      }
      
      // Ensure timestamp exists
      const completeMetadata: RadioMetadata = {
        ...metadata,
        timestamp: metadata.timestamp || now
      };
      
      // Save to localStorage to broadcast to other tabs/windows
      localStorage.setItem(`station_${stationId}_metadata`, JSON.stringify(completeMetadata));
      localStorage.setItem('lmm_metadata_broadcast', JSON.stringify({
        stationId,
        deviceId,
        timestamp: now
      }));
      
      setLastBroadcastTime(now);
      
      console.log(`[BroadcastSync] Broadcasted metadata for station ${stationId}`, completeMetadata);
      
    } catch (error) {
      console.error('Error broadcasting metadata:', error);
    }
  }, [deviceId, lastBroadcastTime]);
  
  // Sync metadata from other instances
  const syncMetadata = useCallback(() => {
    stations.forEach(station => {
      try {
        const metadataKey = `station_${station.id}_metadata`;
        const storedMetadata = localStorage.getItem(metadataKey);
        
        if (storedMetadata) {
          const metadata = JSON.parse(storedMetadata);
          
          // Only update if this metadata is newer than what we have
          if (metadata && metadata.timestamp && 
              (!station.currentMetadata || metadata.timestamp > station.currentMetadata.timestamp)) {
            
            // Ensure the parsed metadata has all required fields
            const completeMetadata: RadioMetadata = {
              ...metadata,
              timestamp: metadata.timestamp || Date.now()
            };
            
            // Update station metadata
            updateStationMetadata(station.id, completeMetadata);
          }
        }
      } catch (error) {
        console.error(`Error syncing metadata for station ${station.id}:`, error);
      }
    });
  }, [stations, updateStationMetadata]);
  
  // Sync listeners count (simulate increasing/decreasing)
  const syncListeners = useCallback(() => {
    stations.forEach(station => {
      // For active stations, simulate listener count changes
      if (station.isLive) {
        // Get a random change (-2 to +5 listeners)
        const change = Math.floor(Math.random() * 8) - 2;
        
        // Ensure we don't go below a minimum
        const minListeners = 5;
        const newCount = Math.max(minListeners, station.listeners + change);
        
        if (newCount !== station.listeners) {
          updateStationListeners(station.id, newCount);
          
          // Also broadcast this change
          localStorage.setItem(`station_${station.id}_listeners`, newCount.toString());
          localStorage.setItem('lmm_listeners_broadcast', Date.now().toString());
        }
      }
    });
  }, [stations, updateStationListeners]);
  
  // Perform a full sync of all data
  const performFullSync = useCallback(() => {
    // Start with basic stations sync
    if (syncStationsFromStorage) {
      syncStationsFromStorage();
    }
    
    // Then sync metadata
    syncMetadata();
    
    // Then sync listeners
    syncListeners();
    
    console.log('[BroadcastSync] Performed full sync');
  }, [syncStationsFromStorage, syncMetadata, syncListeners]);
  
  // Set up storage event listener
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      if (!e.key || !e.newValue) return;
      
      // Handle metadata broadcasts
      if (e.key === 'lmm_metadata_broadcast') {
        try {
          const broadcast = JSON.parse(e.newValue);
          
          // Don't process our own broadcasts
          if (broadcast.deviceId !== deviceId) {
            const metadataKey = `station_${broadcast.stationId}_metadata`;
            const storedMetadata = localStorage.getItem(metadataKey);
            
            if (storedMetadata) {
              console.log(`[BroadcastSync] Received metadata broadcast for station ${broadcast.stationId}`);
              syncMetadata();
            }
          }
        } catch (error) {
          console.error('Error processing metadata broadcast:', error);
        }
      }
      
      // Handle listener count broadcasts
      else if (e.key === 'lmm_listeners_broadcast') {
        console.log('[BroadcastSync] Received listeners broadcast');
        syncStationsFromStorage?.();
      }
      
      // General station sync broadcast
      else if (e.key === 'lmm_station_sync') {
        console.log('[BroadcastSync] Received station sync broadcast');
        performFullSync();
      }
    };
    
    window.addEventListener('storage', handleStorageEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [deviceId, syncMetadata, syncStationsFromStorage, performFullSync]);
  
  return {
    broadcastMetadata,
    syncMetadata,
    performFullSync
  };
};

export default useBroadcastSync;
