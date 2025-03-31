
import { RadioMetadata } from '@/models/RadioStation';

// Function to create or update metadata with proper timestamp
export const createMetadata = (
  artist?: string,
  title?: string,
  album?: string,
  coverArt?: string,
  genre?: string,
  year?: string
): RadioMetadata => {
  return {
    artist,
    title,
    album,
    coverArt,
    genre,
    year,
    timestamp: Date.now()
  };
};

// Handle extracting metadata from stream event
export const handleStreamMetadata = (
  event: Event, 
  setStationInfo: React.Dispatch<React.SetStateAction<{
    name: string;
    currentTrack: string;
    coverImage: string;
    metadata?: RadioMetadata;
  }>>
) => {
  const target = event.target as HTMLAudioElement;
  
  // Check if there's any metadata to extract
  if (!target || !target.textTracks || target.textTracks.length === 0) {
    return;
  }
  
  try {
    // Extract artist and title from current track
    const currentTrack = target.textTracks[0]?.activeCues?.[0]?.text || '';
    
    if (currentTrack) {
      // Most common format: Artist - Title
      const parts = currentTrack.split(' - ');
      const artist = parts.length > 1 ? parts[0] : '';
      const title = parts.length > 1 ? parts.slice(1).join(' - ') : currentTrack;
      
      // Create a valid metadata object with timestamp
      const newMetadata = createMetadata(artist, title);
      
      // Update the station info
      setStationInfo((prev) => ({
        ...prev,
        currentTrack: currentTrack,
        metadata: newMetadata
      }));
    }
  } catch (error) {
    console.error('Error processing stream metadata:', error);
  }
};

// Handle simplified metadata updates 
export const updateStationInfoWithMetadata = (
  artist: string,
  title: string,
  setStationInfo: React.Dispatch<React.SetStateAction<{
    name: string;
    currentTrack: string;
    coverImage: string;
    metadata?: RadioMetadata;
  }>>
) => {
  // Create a valid metadata object with timestamp
  const newMetadata = createMetadata(artist, title);
  
  // Update station info with this metadata
  setStationInfo(prev => ({
    ...prev,
    currentTrack: `${artist} - ${title}`,
    metadata: newMetadata
  }));
  
  return newMetadata;
};
