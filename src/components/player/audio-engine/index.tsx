
import React, { useEffect } from 'react';
import { useRadio } from '@/hooks/useRadioContext';
import { useTrack } from '@/hooks/useTrackContext';
import { useAudioEvents } from './useAudioEvents';
import { useStationPlayer } from './StationPlayer';
import { useTrackPlayer } from './TrackPlayer';
import { useVolumeEffect } from './useVolumeEffect';
import { AudioEngineProps } from './types';
import { useToast } from '@/hooks/use-toast';

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

  // Initialize audio element and attach event listeners
  useAudioEvents({
    audioRef,
    onTimeUpdate,
    onDurationChange,
    onPlayStateChange,
    setAudioState
  });
  
  // Handle volume changes
  useVolumeEffect({
    audioRef,
    volume: audioState.volume,
    isMuted: audioState.isMuted
  });
  
  // Error recovery effect
  useEffect(() => {
    const handleErrors = () => {
      if (audioRef.current && audioState.hasError) {
        console.log("Attempting to recover from audio error");
        
        // Reset error state
        setAudioState(prev => ({
          ...prev,
          hasError: false,
          errorMessage: null,
        }));
        
        // If we were playing a station, attempt to reconnect
        if (currentPlayingStation) {
          const station = stations.find(s => s.id === currentPlayingStation);
          if (station) {
            toast({
              title: "Reconnecting",
              description: `Attempting to reconnect to ${station.name}`,
            });
            
            // Force reload the audio source
            audioRef.current.load();
            audioRef.current.play().catch(e => {
              console.error("Failed to recover playback:", e);
            });
          }
        }
      }
    };
    
    // Attempt recovery if there was an error
    if (audioState.hasError) {
      handleErrors();
    }
  }, [audioState.hasError, currentPlayingStation, stations, setAudioState, toast]);
  
  // Handle station playback
  useStationPlayer({
    currentPlayingStation,
    stations,
    audioRef,
    metadataTimerRef,
    setStationInfo,
    setIsTrackPlaying,
    setCurrentPlayingTrack,
    setAudioState,
    audioState
  });
  
  // Handle track playback
  useTrackPlayer({
    currentPlayingTrack,
    tracks,
    audioRef,
    metadataTimerRef,
    setStationInfo,
    setIsTrackPlaying,
    setComments,
    setLikes,
    setAudioState,
    onTimeUpdate,
    onDurationChange
  });
  
  return null; // This is just a logic component, no UI
};

export default AudioEngine;
