import React, { useRef, useEffect, MutableRefObject } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRadio } from '@/hooks/useRadioContext';
import { useTrack } from '@/hooks/useTrackContext';

interface AudioEngineProps {
  onTimeUpdate: (currentTime: number) => void;
  onDurationChange: (duration: number) => void;
  onPlayStateChange: (isPlaying: boolean) => void;
  audioRef: MutableRefObject<HTMLAudioElement | null>;
  metadataTimerRef: MutableRefObject<number | null>;
  stationInfo: {
    name: string;
    currentTrack: string;
    coverImage: string;
  };
  setStationInfo: React.Dispatch<React.SetStateAction<{
    name: string;
    currentTrack: string;
    coverImage: string;
  }>>;
  setIsTrackPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  setComments: React.Dispatch<React.SetStateAction<any[]>>;
  setLikes: React.Dispatch<React.SetStateAction<number>>;
}

const AudioEngine: React.FC<AudioEngineProps> = ({
  onTimeUpdate,
  onDurationChange,
  onPlayStateChange,
  audioRef,
  metadataTimerRef,
  stationInfo,
  setStationInfo,
  setIsTrackPlaying,
  setComments,
  setLikes
}) => {
  const { stations, currentPlayingStation, audioState, setAudioState } = useRadio();
  const { tracks, currentPlayingTrack, setCurrentPlayingTrack } = useTrack();
  const { toast } = useToast();

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      audioRef.current.volume = audioState.isMuted ? 0 : audioState.volume / 100;
      
      audioRef.current.addEventListener('error', (e) => {
        console.error("Audio playback error:", e);
        toast({
          title: "Playback Error",
          description: "There was an error playing this stream. Please try a different station.",
          variant: "destructive"
        });
        setAudioState(prev => ({ ...prev, isPlaying: false }));
      });
      
      audioRef.current.addEventListener('playing', () => {
        console.log("Audio is now playing");
        setAudioState(prev => ({ ...prev, isPlaying: true }));
        onPlayStateChange(true);
      });
      
      audioRef.current.addEventListener('pause', () => {
        console.log("Audio is now paused");
        setAudioState(prev => ({ ...prev, isPlaying: false }));
        onPlayStateChange(false);
      });
      
      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          onTimeUpdate(audioRef.current.currentTime);
        }
      });
      
      audioRef.current.addEventListener('loadedmetadata', () => {
        if (audioRef.current) {
          onDurationChange(audioRef.current.duration);
        }
      });
      
      audioRef.current.addEventListener('ended', () => {
        setAudioState(prev => ({ ...prev, isPlaying: false }));
        onTimeUpdate(0);
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
        }
        onPlayStateChange(false);
      });
    }
    
    return () => {
      if (metadataTimerRef.current) {
        window.clearInterval(metadataTimerRef.current);
      }
    };
  }, []);
  
  // Cleanup effect
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);
  
  // Update volume effect
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audioState.isMuted ? 0 : audioState.volume / 100;
    }
  }, [audioState.volume, audioState.isMuted]);
  
  // Handle station change
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
      
      setupMetadataPolling(streamUrl);
    }
  }, [currentPlayingStation, stations]);
  
  // Handle track change
  useEffect(() => {
    if (!currentPlayingTrack || !audioRef.current) return;
    
    const track = tracks.find(t => t.id === currentPlayingTrack);
    if (!track) {
      console.error("Track not found:", currentPlayingTrack);
      return;
    }
    
    console.log("Changing audio source to track:", track.audioFile);
    setAudioState(prev => ({ 
      ...prev, 
      currentTrack: currentPlayingTrack,
      currentStation: null
    }));
    
    audioRef.current.pause();
    audioRef.current.src = track.audioFile;
    
    setStationInfo({
      name: track.artist,
      currentTrack: track.title,
      coverImage: track.coverImage
    });
    
    onTimeUpdate(0);
    
    if (track.duration) {
      onDurationChange(track.duration);
    }
    
    audioRef.current.load();
    audioRef.current.play().catch(error => {
      console.error("Failed to play track:", error);
      toast({
        title: "Playback Error",
        description: "Failed to play this track. Please try again.",
        variant: "destructive"
      });
    });
    
    setIsTrackPlaying(true);
    
    if (metadataTimerRef.current) {
      window.clearInterval(metadataTimerRef.current);
    }
    
    if (track.comments) {
      setComments(track.comments.map((comment: any) => ({
        id: comment.id,
        username: comment.username,
        text: comment.text,
        date: comment.date
      })));
    } else {
      setComments([]);
    }
    
    setLikes(track.likes || 0);
  }, [currentPlayingTrack, tracks]);
  
  const setupMetadataPolling = (streamUrl: string) => {
    if (metadataTimerRef.current) {
      window.clearInterval(metadataTimerRef.current);
    }
    
    const simulateMetadata = () => {
      const tracks = [
        "DJ Lobo - Bachata Mix 2025",
        "Marc Anthony - Vivir Mi Vida",
        "Bad Bunny - Tití Me Preguntó",
        "Romeo Santos - Propuesta Indecente",
        "Daddy Yankee - Gasolina (Club Mix)",
        "Luis Fonsi - Despacito (Radio Edit)",
        "Aventura - Obsesión",
        "Rauw Alejandro - Todo de Ti"
      ];
      
      const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
      setStationInfo(prev => ({
        ...prev,
        currentTrack: randomTrack
      }));
    };
    
    simulateMetadata();
    
    metadataTimerRef.current = window.setInterval(simulateMetadata, 15000);
  };
  
  return null; // This is just a logic component, no UI
};

export default AudioEngine;
