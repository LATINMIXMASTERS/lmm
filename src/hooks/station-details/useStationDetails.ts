
import { useState, useEffect, useRef } from 'react';
import { useRadio } from '@/hooks/useRadioContext';
import { useAuth } from '@/contexts/AuthContext';
import { useStationData } from './useStationData';
import { useStationActions } from './useStationActions';
import { useChatSync } from './useChatSync';
import { useSyncChecker } from './useSyncChecker'; // Import our new hook
import { StationDetailsResult } from './types';
import { useToast } from '@/hooks/use-toast';

export const useStationDetails = (stationId: string | undefined): StationDetailsResult => {
  const { currentPlayingStation, getChatMessagesForStation, stations, syncStationsFromStorage } = useRadio();
  const { user } = useAuth();
  const { toast } = useToast();
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const initialSyncDone = useRef<boolean>(false);
  
  // Find station by id or by slug (url-friendly name)
  useEffect(() => {
    if (stationId && !stations.some(s => s.id === stationId)) {
      // If stationId doesn't match any station id, it might be a slug
      const station = stations.find(s => 
        s.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') === stationId
      );
      
      if (station) {
        console.log("Found station by slug:", station.name);
      } else {
        console.log("Station not found by id or slug:", stationId);
      }
    }
  }, [stationId, stations]);
  
  // Force initial sync when component mounts
  useEffect(() => {
    if (!initialSyncDone.current && stationId && syncStationsFromStorage) {
      console.log("Performing initial station sync for:", stationId);
      syncStationsFromStorage();
      initialSyncDone.current = true;
    }
  }, [stationId, syncStationsFromStorage]);
  
  // Get state from hooks
  const { 
    station, 
    stationBookings, 
    showVideoPlayer, 
    loadingState 
  } = useStationData(stationId);
  
  // Use our new sync checker hook
  useSyncChecker(stationId);
  
  // Use state for showVideoPlayer here
  const [localShowVideoPlayer, setShowVideoPlayer] = useState(showVideoPlayer);
  
  // Keep local state in sync with derived state
  useEffect(() => {
    setShowVideoPlayer(showVideoPlayer);
  }, [showVideoPlayer]);
  
  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      // Force re-sync when coming back online
      if (syncStationsFromStorage) {
        console.log("Device came online, syncing station data");
        syncStationsFromStorage();
        toast({
          title: "Connection Restored",
          description: "Syncing station data..."
        });
      }
    };
    
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncStationsFromStorage, toast]);
  
  // Derived state
  const isPlaying = currentPlayingStation === stationId;
  const isPrivilegedUser = user?.isAdmin || user?.isRadioHost;
  
  // Get actions
  const actions = useStationActions(
    stationId,
    station,
    isPlaying,
    localShowVideoPlayer,
    setShowVideoPlayer
  );
  
  // Get chat messages
  const { chatMessages } = useChatSync(stationId, station, setLastSyncTime);
  
  // Get chat messages with forced refresh
  const stationChatMessages = station ? getChatMessagesForStation(station.id) : [];

  return {
    // State
    station,
    stationBookings,
    showVideoPlayer: localShowVideoPlayer, // Use the local state here
    lastSyncTime,
    loadingState,
    
    // Derived state
    isPlaying,
    isPrivilegedUser,
    chatMessages: stationChatMessages,
    
    // Actions
    ...actions
  };
};

export default useStationDetails;
