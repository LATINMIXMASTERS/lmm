
import { useEffect } from 'react';
import { RadioStation } from '@/models/RadioStation';
import { useToast } from '@/hooks/use-toast';
import { setupMetadataPolling } from './metadataUtils';

interface StationPlayerProps {
  currentPlayingStation: string | null;
  stations: RadioStation[];
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  metadataTimerRef: React.MutableRefObject<number | null>;
  setStationInfo: React.Dispatch<React.SetStateAction<{
    name: string;
    currentTrack: string;
    coverImage: string;
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
    
    if (!streamUrl.startsWith('http://') && !streamUrl.startsWith('https://')) {
      streamUrl = `https://${streamUrl}`;
    }
    
    console.log("Final audio source URL:", streamUrl);
    
    if (audioRef.current.src !== streamUrl) {
      const wasPlaying = !audioRef.current.paused;
      audioRef.current.pause();
      
      audioRef.current.src = streamUrl;
      audioRef.current.load();
      
      setStationInfo({
        name: currentStation.name,
        currentTrack: 'Loading...',
        coverImage: currentStation.image || 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?q=80&w=200&auto=format&fit=crop'
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
      
      setupMetadataPolling(streamUrl, metadataTimerRef, setStationInfo);
    }
  }, [currentPlayingStation, stations]);
};
