
import React from 'react';
import { useRadio } from '@/hooks/useRadioContext';
import { useTrack } from '@/hooks/useTrackContext';
import { useAudioEvents } from './useAudioEvents';
import { useStationPlayer } from './StationPlayer';
import { useTrackPlayer } from './TrackPlayer';
import { useVolumeEffect } from './useVolumeEffect';
import { AudioEngineProps } from './types';

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
