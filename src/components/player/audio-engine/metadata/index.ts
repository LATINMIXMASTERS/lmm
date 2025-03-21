
import { MutableRefObject } from 'react';
import { RadioMetadata } from '@/models/RadioStation';
import { useRadio } from '@/hooks/useRadioContext';
import { fetchStreamMetadata } from './fetchMetadata';
import { generateSimulatedMetadata } from './simulateMetadata';
import { isValidStreamUrl, extractStreamUrl } from './streamUtils';

// Re-export utility functions for external use
export { extractStreamUrl } from './streamUtils';
export { fetchStreamMetadata } from './fetchMetadata';
export { generateSimulatedMetadata } from './simulateMetadata';
export { extractArtistAndTitle } from './parseMetadata';

interface StationInfo {
  name: string;
  currentTrack: string;
  coverImage: string;
  metadata?: RadioMetadata;
}

/**
 * Sets up metadata polling for a radio station
 * @param streamUrl - The URL of the stream
 * @param metadataTimerRef - Reference to the timer for cleanup
 * @param setStationInfo - Function to update the station info
 * @param stationId - Optional station ID for central store updates
 */
export const setupMetadataPolling = (
  streamUrl: string,
  metadataTimerRef: MutableRefObject<number | null>,
  setStationInfo: React.Dispatch<React.SetStateAction<StationInfo>>,
  stationId?: string
): void => {
  if (metadataTimerRef.current) {
    window.clearInterval(metadataTimerRef.current);
  }
  
  // Ensure the stream URL is properly formatted
  const formattedStreamUrl = extractStreamUrl(streamUrl);
  
  // First, try to get actual metadata from the stream
  const fetchMetadata = async () => {
    try {
      // Try to get real metadata if the URL is valid
      if (isValidStreamUrl(formattedStreamUrl)) {
        const metadata = await fetchStreamMetadata(formattedStreamUrl);
        
        if (metadata.title) {
          const metadataString = metadata.artist 
            ? `${metadata.artist} - ${metadata.title}`
            : metadata.title;
            
          setStationInfo(prev => ({
            ...prev,
            currentTrack: metadataString,
            metadata: metadata as RadioMetadata
          }));
          
          // If we have a stationId, update the metadata in the central store
          if (stationId) {
            updateCentralStoreMetadata(stationId, metadata as RadioMetadata);
          }
          
          return;
        }
      }
      
      // Fall back to simulation if we couldn't get metadata
      simulateMetadata();
    } catch (error) {
      console.error('Error in metadata polling:', error);
      simulateMetadata();
    }
  };
  
  const simulateMetadata = () => {
    const { trackString, metadata } = generateSimulatedMetadata();
    
    setStationInfo(prev => ({
      ...prev,
      currentTrack: trackString,
      metadata
    }));
    
    // If we have a stationId, update the metadata in the central store
    if (stationId) {
      updateCentralStoreMetadata(stationId, metadata);
    }
  };
  
  // Helper function to update the central store
  const updateCentralStoreMetadata = (stationId: string, metadata: RadioMetadata) => {
    try {
      const { updateStationMetadata } = useRadio();
      if (updateStationMetadata) {
        updateStationMetadata(stationId, metadata);
      }
    } catch (error) {
      console.error('Error updating central store metadata:', error);
    }
  };
  
  // Initial metadata fetch
  fetchMetadata();
  
  // Set up polling (every 15 seconds to avoid too many requests)
  metadataTimerRef.current = window.setInterval(fetchMetadata, 15000);
};
