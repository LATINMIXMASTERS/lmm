
import React, { useRef, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRadio } from '@/hooks/useRadioContext';
import { useTrack } from '@/hooks/useTrackContext';
import { setupMetadataPolling, extractStreamUrl } from './metadata';
import { RadioMetadata } from '@/models/RadioStation';

const AudioEngineComponent = ({
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
  const { audioState, stations, setAudioError, updateStationMetadata, currentPlayingStation } = useRadio();
  const { tracks, currentPlayingTrack, getTrackById, setCurrentPlayingTrack, updateListeningCount } = useTrack();
  const { toast } = useToast();
  const [lastMetadataUpdate, setLastMetadataUpdate] = useState(0);
  const [coverArtFallbackRetries, setCoverArtFallbackRetries] = useState(0);
  const metadataSyncInterval = useRef(null);
  const errorRetryCount = useRef(0);
  const lastStationId = useRef(null);
  const lastTrackId = useRef(null);

  // Better error handling that retries failed connections
  const handleError = (error) => {
    console.error('Audio error:', error);
    
    if (audioRef.current) {
      if (errorRetryCount.current < 3) {
        // Retry with progressive delay
        const delay = Math.pow(2, errorRetryCount.current) * 1000;
        console.log(`Retrying audio playback in ${delay}ms (attempt ${errorRetryCount.current + 1})`);
        
        setTimeout(() => {
          if (audioRef.current) {
            errorRetryCount.current++;
            const wasPlaying = audioState.isPlaying;
            
            // For streams, we'll try reloading the source
            if (currentPlayingStation) {
              const station = stations.find(s => s.id === currentPlayingStation);
              if (station && station.streamUrl) {
                audioRef.current.src = extractStreamUrl(station.streamUrl);
                if (wasPlaying) {
                  audioRef.current.play().catch(e => {
                    console.error('Error during retry playback:', e);
                  });
                }
              }
            }
            // For tracks, we'll try reloading the track
            else if (currentPlayingTrack) {
              const track = getTrackById(currentPlayingTrack);
              if (track && track.audioUrl) {
                audioRef.current.src = track.audioUrl;
                if (wasPlaying) {
                  audioRef.current.play().catch(e => {
                    console.error('Error during retry playback:', e);
                  });
                }
              }
            }
          }
        }, delay);
        
      } else {
        // After multiple retries, show error to user
        if (setAudioError) {
          setAudioError(true, `Playback error: ${error.message || 'Could not play audio'}`);
        }
        
        toast({
          title: "Playback Error",
          description: "There was a problem playing this audio. Please try again later.",
          variant: "destructive"
        });
        
        onPlayStateChange(false);
      }
    }
  };

  // Handle changes to audio state, stations, or currentPlayingTrack
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('timeupdate', () => onTimeUpdate(audioRef.current.currentTime));
      audioRef.current.addEventListener('durationchange', () => onDurationChange(audioRef.current.duration));
      audioRef.current.addEventListener('play', () => onPlayStateChange(true));
      audioRef.current.addEventListener('pause', () => onPlayStateChange(false));
      audioRef.current.addEventListener('ended', () => onPlayStateChange(false));
      audioRef.current.addEventListener('error', (e) => handleError(e));
    }
    
    // Reset error retry count when changing tracks/stations
    if (currentPlayingStation !== lastStationId.current || 
        currentPlayingTrack !== lastTrackId.current) {
      errorRetryCount.current = 0;
      lastStationId.current = currentPlayingStation;
      lastTrackId.current = currentPlayingTrack;
    }
    
    // Handle station playback
    if (currentPlayingStation && !currentPlayingTrack) {
      const station = stations.find(s => s.id === currentPlayingStation);
      
      if (station && station.streamUrl) {
        // Stop any existing metadata polling
        if (metadataTimerRef.current) {
          clearInterval(metadataTimerRef.current);
          metadataTimerRef.current = null;
        }
        
        const streamUrl = extractStreamUrl(station.streamUrl);
        console.log(`Playing station ${station.name} from URL: ${streamUrl}`);
        
        // Set initial station info
        setStationInfo({
          name: station.name,
          currentTrack: station.currentMetadata?.title 
            ? `${station.currentMetadata.artist || ''} - ${station.currentMetadata.title}`
            : 'Live Stream',
          coverImage: station.currentMetadata?.coverArt || station.image || '/placeholder-album.png'
        });
        
        setIsTrackPlaying(false);
        
        // Only change the source if needed
        if (audioRef.current.src !== streamUrl) {
          audioRef.current.src = streamUrl;
          
          // Set up metadata polling for this stream
          setupMetadataPolling(
            streamUrl, 
            metadataTimerRef, 
            (info) => {
              setStationInfo(prev => ({
                ...prev,
                name: station.name,
                currentTrack: info.metadata?.title 
                  ? `${info.metadata.artist || ''} - ${info.metadata.title}`
                  : prev.currentTrack || 'Live Stream',
                coverImage: info.metadata?.coverArt || station.image || '/placeholder-album.png',
                metadata: info.metadata
              }));
              
              // Also update the station metadata in the context
              if (info.metadata && updateStationMetadata && Date.now() - lastMetadataUpdate > 2000) {
                updateStationMetadata(currentPlayingStation, {
                  ...info.metadata,
                  timestamp: Date.now()
                });
                setLastMetadataUpdate(Date.now());
                
                // Manually broadcast metadata to other devices
                try {
                  const metadataEvent = {
                    stationId: currentPlayingStation,
                    metadata: info.metadata,
                    timestamp: Date.now(),
                    deviceId: localStorage.getItem('latinmixmasters_device_id') || 'unknown'
                  };
                  
                  localStorage.setItem(`station_${currentPlayingStation}_metadata`, JSON.stringify({
                    ...info.metadata,
                    timestamp: Date.now()
                  }));
                  
                  // Broadcast to other tabs/windows
                  window.dispatchEvent(new StorageEvent('storage', {
                    key: `station_${currentPlayingStation}_metadata`,
                    newValue: JSON.stringify(metadataEvent)
                  }));
                } catch (error) {
                  console.error('Error broadcasting metadata:', error);
                }
              }
            },
            currentPlayingStation
          );
        }
        
        // Handle play/pause based on isPlaying flag
        if (audioState.isPlaying) {
          audioRef.current.play().catch(handleError);
        } else {
          audioRef.current.pause();
        }
      }
    }
    
    // Handle track playback
    else if (currentPlayingTrack && !currentPlayingStation) {
      const track = getTrackById(currentPlayingTrack);
      
      if (track) {
        // Clear any station metadata polling
        if (metadataTimerRef.current) {
          clearInterval(metadataTimerRef.current);
          metadataTimerRef.current = null;
        }
        
        // Set track info
        setStationInfo({
          name: track.title,
          currentTrack: `${track.artist} - ${track.title}`,
          coverImage: track.coverImage || '/placeholder-album.png'
        });
        
        setIsTrackPlaying(true);
        
        // Load track comments and likes
        setComments(track.comments || []);
        setLikes(track.likes || 0);
        
        // Only change the source if needed
        if (audioRef.current.src !== track.audioUrl) {
          audioRef.current.src = track.audioUrl;
          
          // Update listening count for track
          updateListeningCount(track.id);
        }
        
        // Handle play/pause based on isPlaying flag
        if (audioState.isPlaying) {
          audioRef.current.play().catch(handleError);
        } else {
          audioRef.current.pause();
        }
      }
    }
    
    // Nothing selected
    else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      
      // Clear any station metadata polling
      if (metadataTimerRef.current) {
        clearInterval(metadataTimerRef.current);
        metadataTimerRef.current = null;
      }
      
      // Reset station info
      setStationInfo({
        name: '',
        currentTrack: '',
        coverImage: ''
      });
      
      setIsTrackPlaying(false);
    }
    
    // Setup dedicated metadata sync interval for stations
    if (currentPlayingStation && updateStationMetadata) {
      // Clear previous interval
      if (metadataSyncInterval.current) {
        clearInterval(metadataSyncInterval.current);
      }
      
      // Setup new interval
      metadataSyncInterval.current = setInterval(() => {
        // Check for metadata in localStorage
        try {
          const metadataKey = `station_${currentPlayingStation}_metadata`;
          const storedMetadata = localStorage.getItem(metadataKey);
          
          if (storedMetadata) {
            const metadata = JSON.parse(storedMetadata);
            
            // Update if newer
            if (metadata && metadata.timestamp && 
                (metadata.timestamp > lastMetadataUpdate)) {
              
              setStationInfo(prev => ({
                ...prev,
                currentTrack: metadata.title 
                  ? `${metadata.artist || ''} - ${metadata.title}`
                  : prev.currentTrack || 'Live Stream',
                coverImage: metadata.coverArt || prev.coverImage || '/placeholder-album.png',
                metadata: metadata
              }));
              
              setLastMetadataUpdate(metadata.timestamp);
            }
          }
        } catch (error) {
          console.error('Error syncing metadata from localStorage:', error);
        }
      }, 3000);
    } else if (metadataSyncInterval.current) {
      clearInterval(metadataSyncInterval.current);
      metadataSyncInterval.current = null;
    }
    
    // Cleanup
    return () => {
      if (metadataSyncInterval.current) {
        clearInterval(metadataSyncInterval.current);
      }
    };
  }, [
    audioState, 
    stations, 
    currentPlayingStation, 
    currentPlayingTrack, 
    getTrackById, 
    setAudioError,
    updateStationMetadata,
    setStationInfo,
    setIsTrackPlaying,
    setComments,
    setLikes,
    onTimeUpdate,
    onDurationChange,
    onPlayStateChange,
    updateListeningCount,
    toast,
    lastMetadataUpdate
  ]);

  // Handle volume and mute changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audioState.isMuted ? 0 : audioState.volume;
    }
  }, [audioState.volume, audioState.isMuted]);

  // Effect to add fallback for cover art when it fails to load
  useEffect(() => {
    if (stationInfo.coverImage && stationInfo.coverImage !== '/placeholder-album.png') {
      // Create an Image object to verify the image loads
      const img = new Image();
      
      img.onload = () => {
        // Image loaded successfully
        setCoverArtFallbackRetries(0);
      };
      
      img.onerror = () => {
        // Image failed to load, use fallback
        if (coverArtFallbackRetries < 3) {
          setCoverArtFallbackRetries(prev => prev + 1);
          
          // Try to find a station with this image
          if (currentPlayingStation) {
            const station = stations.find(s => s.id === currentPlayingStation);
            if (station) {
              setStationInfo(prev => ({
                ...prev,
                coverImage: station.image || '/placeholder-album.png'
              }));
            }
          } else {
            // Fallback to placeholder
            setStationInfo(prev => ({
              ...prev,
              coverImage: '/placeholder-album.png'
            }));
          }
        }
      };
      
      img.src = stationInfo.coverImage;
    }
  }, [stationInfo.coverImage, stations, currentPlayingStation, setStationInfo]);

  // The component doesn't render anything, it just sets up the audio element
  return null;
};

export default AudioEngineComponent;
