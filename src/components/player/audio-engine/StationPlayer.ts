import { useEffect } from 'react';
import { RadioStation, RadioMetadata } from '@/models/RadioStation';
import { useToast } from '@/hooks/use-toast';
import { setupMetadataPolling, extractStreamUrl } from './metadata/index';

interface StationPlayerProps {
  currentPlayingStation: string | null;
  stations: RadioStation[];
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  metadataTimerRef: React.MutableRefObject<number | null>;
  setStationInfo: React.Dispatch<React.SetStateAction<{
    name: string;
    currentTrack: string;
    coverImage: string;
    metadata?: RadioMetadata;
  }>>;
  setIsTrackPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentPlayingTrack: (trackId: string | null) => void;
  setAudioState: (prev: any) => void;
  audioState: any;
}

export const useStationPlayer = ({
  currentPlayingStation,
  stations,
  audioRef,
  metadataTimerRef,
  setStationInfo,
  setIsTrackPlaying,
  setCurrentPlayingTrack,
  setAudioState,
  audioState
}: StationPlayerProps) => {
  const { toast } = useToast();
  
  useEffect(() => {
    if (!currentPlayingStation || !audioRef.current) return;
    
    console.log("StationPlayer: Setting up playback for station ID:", currentPlayingStation);
    
    setIsTrackPlaying(false);
    setCurrentPlayingTrack(null);
    
    // Update the current station without changing isPlaying state
    setAudioState(prev => ({ 
      ...prev, 
      currentStation: currentPlayingStation,
      currentTrack: null,
      hasError: false,
      errorMessage: null,
    }));
    
    const currentStation = stations.find(station => station.id === currentPlayingStation);
    if (!currentStation) {
      console.error("Station not found:", currentPlayingStation);
      toast({
        title: "Stream Error",
        description: "This station doesn't have a stream URL configured.",
        variant: "destructive"
      });
      return;
    }
    
    // Determine which stream URL to use
    let rawStreamUrl = '';
    
    if (currentStation.streamUrl && currentStation.streamUrl.trim() !== '') {
      rawStreamUrl = currentStation.streamUrl;
      console.log("Using station streamUrl:", rawStreamUrl);
    } else if (currentStation.streamDetails?.url && currentStation.streamDetails.url.trim() !== '') {
      rawStreamUrl = currentStation.streamDetails.url;
      console.log("Using station streamDetails.url:", rawStreamUrl);
      
      // Add port if available
      if (currentStation.streamDetails.port) {
        if (!rawStreamUrl.includes(':')) {
          rawStreamUrl = `${rawStreamUrl}:${currentStation.streamDetails.port}`;
          console.log("Added port to URL:", rawStreamUrl);
        }
      }
    } else {
      console.error("No stream URL found for station:", currentPlayingStation);
      toast({
        title: "Stream Error",
        description: "This station doesn't have a stream URL configured.",
        variant: "destructive"
      });
      
      // Set error state
      setAudioState(prev => ({ 
        ...prev, 
        hasError: true,
        errorMessage: "No stream URL configured",
        isPlaying: false
      }));
      
      return;
    }
    
    // Ensure the stream URL has the correct format
    const streamUrl = extractStreamUrl(rawStreamUrl);
    console.log("Final audio source URL:", streamUrl);
    
    if (!streamUrl || streamUrl === 'http://' || streamUrl === 'https://') {
      console.error("Invalid stream URL:", streamUrl);
      toast({
        title: "Stream Error",
        description: "Invalid stream URL format.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Only update the source if it's different
      if (audioRef.current.src !== streamUrl) {
        console.log("Setting new audio source");
        
        // Pause and reset current audio
        audioRef.current.pause();
        audioRef.current.src = '';
        
        // Set new source
        audioRef.current.src = streamUrl;
        audioRef.current.load();
        
        // Initialize with current station data
        setStationInfo({
          name: currentStation.name,
          currentTrack: currentStation.currentMetadata?.title 
            ? `${currentStation.currentMetadata.artist || ''} - ${currentStation.currentMetadata.title}`
            : 'Loading...',
          coverImage: currentStation.s3Image || currentStation.image || 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?q=80&w=200&auto=format&fit=crop',
          metadata: currentStation.currentMetadata
        });
        
        // Only play if the audio state indicates it should be playing
        if (audioState.isPlaying) {
          console.log("Auto-playing audio based on audioState.isPlaying");
          const playPromise = audioRef.current.play();
          
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error("Failed to play audio:", error);
              toast({
                title: "Playback Error",
                description: "Failed to play this station. Check that the stream URL is correct.",
                variant: "destructive"
              });
              
              // Set error state
              setAudioState(prev => ({ 
                ...prev, 
                hasError: true,
                errorMessage: "Playback failed",
                isPlaying: false
              }));
            });
          }
        }
        
        // Set up metadata polling
        setupMetadataPolling(streamUrl, metadataTimerRef, setStationInfo, currentStation.id);
      } else {
        console.log("Audio source unchanged, skipping update");
        
        // Stream URL is the same, but we should still play if needed
        if (audioState.isPlaying && audioRef.current.paused) {
          console.log("Resuming playback of current stream");
          audioRef.current.play().catch(error => {
            console.error("Failed to resume audio:", error);
          });
        }
      }
    } catch (error) {
      console.error("Error setting up audio playback:", error);
      toast({
        title: "Playback Error",
        description: "An error occurred while trying to play this station.",
        variant: "destructive"
      });
      
      // Set error state
      setAudioState(prev => ({ 
        ...prev, 
        hasError: true,
        errorMessage: "Playback setup failed",
        isPlaying: false
      }));
    }
  }, [currentPlayingStation, stations, audioState.isPlaying]);
  
  // Return nothing as this is a side-effect hook
  return;
};
