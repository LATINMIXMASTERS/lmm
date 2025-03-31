
import { createMetadata, handleStreamMetadata, updateStationInfoWithMetadata } from '../metadata';
import { extractStreamUrl, standardizeStreamUrl, isShoutcastUrl, isValidStreamUrl } from './streamUtils';

// Export everything from both files
export { 
  createMetadata, 
  handleStreamMetadata, 
  updateStationInfoWithMetadata,
  extractStreamUrl,
  standardizeStreamUrl,
  isShoutcastUrl,
  isValidStreamUrl
};

// Re-export setupMetadataPolling
export const setupMetadataPolling = (
  streamUrl: string, 
  metadataTimerRef: React.MutableRefObject<number | null>,
  setStationInfo: any,
  stationId: string
) => {
  // Simple implementation for now
  if (metadataTimerRef.current) {
    window.clearInterval(metadataTimerRef.current);
  }
  
  // Set up a polling interval to check for metadata changes
  metadataTimerRef.current = window.setInterval(() => {
    // Just a placeholder - in a real implementation this would fetch metadata
    const mockMetadata = {
      artist: 'Random Artist',
      title: 'Current Track',
      timestamp: Date.now()
    };
    
    updateStationInfoWithMetadata(
      mockMetadata.artist,
      mockMetadata.title,
      setStationInfo
    );
  }, 10000);
  
  return () => {
    if (metadataTimerRef.current) {
      window.clearInterval(metadataTimerRef.current);
      metadataTimerRef.current = null;
    }
  };
};

// Mock function for simulation
export const generateSimulatedMetadata = () => {
  return {
    artist: 'Simulated Artist',
    title: 'Simulated Track',
    timestamp: Date.now()
  };
};
