import { useEffect } from 'react';
import { RadioStation, RadioMetadata } from '@/models/RadioStation';
import { useToast } from '@/hooks/use-toast';
import { setupMetadataPolling, extractStreamUrl } from './metadata';

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
    
    setIsTrackPlaying(false);
    setCurrentPlayingTrack(null);
    setAudioState(prev => ({ 
      ...prev, 
      currentStation: currentPlayingStation,
      currentTrack: null
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
    
    let streamUrl = '';
    
    if (currentStation.streamUrl) {
      streamUrl = currentStation.streamUrl;
      console.log("Using station streamUrl:", streamUrl);
    } else if (currentStation.streamDetails?.url) {
      streamUrl = currentStation.streamDetails.url;
      console.log("Using station streamDetails.url:", streamUrl);
    } else {
      console.error("No stream URL found for station:", currentPlayingStation);
      toast({
        title: "Stream Error",
        description: "This station doesn't have a stream URL configured.",
        variant: "destructive"
      });
      return;
    }
    
    // Ensure the stream URL has the correct format
    streamUrl = extractStreamUrl(streamUrl);
    console.log("Final audio source URL:", streamUrl);
    
    if (audioRef.current.src !== streamUrl) {
      const wasPlaying = !audioRef.current.paused;
      audioRef.current.pause();
      
      audioRef.current.src = streamUrl;
      audioRef.current.load();
      
      // Initialize with current station data, including any existing metadata
      setStationInfo({
        name: currentStation.name,
        currentTrack: currentStation.currentMetadata?.title 
          ? `${currentStation.currentMetadata.artist || ''} - ${currentStation.currentMetadata.title}`
          : 'Loading...',
        coverImage: currentStation.s3Image || currentStation.image || 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?q=80&w=200&auto=format&fit=crop',
        metadata: currentStation.currentMetadata
      });
      
      if (wasPlaying || audioState.isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Failed to play audio:", error);
            toast({
              title: "Playback Error",
              description: "Failed to play this station. Trying an alternative stream for demonstration.",
              variant: "destructive"
            });
            
            audioRef.current!.src = 'https://ice1.somafm.com/groovesalad-128-mp3';
            audioRef.current!.load();
            audioRef.current!.play().catch(innerError => {
              console.error("Failed to play fallback audio:", innerError);
            });
          });
        }
      }
      
      // Set up metadata polling with the station ID for central updates
      setupMetadataPolling(streamUrl, metadataTimerRef, setStationInfo, currentStation.id);
    }
  }, [currentPlayingStation, stations]);
};
