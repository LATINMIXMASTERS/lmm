
import { RadioMetadata } from '@/models/RadioStation';

// Extract and format the stream URL correctly
export const extractStreamUrl = (url: string): string => {
  // Clean up the URL
  let streamUrl = url.trim();
  
  // If it's already a proper URL (with protocol), return it as is
  if (streamUrl.startsWith('http://') || streamUrl.startsWith('https://')) {
    return streamUrl;
  }
  
  // For simple host:port format
  if (streamUrl.includes(':')) {
    return `http://${streamUrl}`;
  }
  
  // Add default http protocol if missing
  return `http://${streamUrl}`;
};

// Function to set up polling for stream metadata
export const setupMetadataPolling = (
  streamUrl: string,
  timerRef: React.MutableRefObject<number | null>,
  setStationInfo: React.Dispatch<React.SetStateAction<{
    name: string;
    currentTrack: string;
    coverImage: string;
    metadata?: RadioMetadata;
  }>>,
  stationId?: string
) => {
  // Clear any existing timer
  if (timerRef.current) {
    console.log('Clearing existing metadata timer');
    window.clearInterval(timerRef.current);
    timerRef.current = null;
  }
  
  // Only set up polling for non-empty stream URLs
  if (!streamUrl || streamUrl === 'http://' || streamUrl === 'https://') {
    console.log('No valid stream URL to poll for metadata');
    return;
  }
  
  try {
    // Create a function to fetch metadata
    const fetchMetadata = async () => {
      try {
        // Simulate metadata fetch - in a real app this would call a metadata API
        const randomTracks = [
          { artist: 'Bad Bunny', title: 'Monaco' },
          { artist: 'Peso Pluma', title: 'Ella Baila Sola' },
          { artist: 'Karol G', title: 'TQG' },
          { artist: 'Shakira', title: 'TQG' },
          { artist: 'Luis Miguel', title: 'La Bikina' },
          { artist: 'Grupo Frontera', title: 'Un Cumbión Dolido' },
          { artist: 'Prince Royce', title: 'Dime' },
          { artist: 'Marc Anthony', title: 'Vivir Mi Vida' },
        ];
        
        // Randomly select a track every ~30 seconds
        if (Math.random() > 0.9) {
          const randomTrack = randomTracks[Math.floor(Math.random() * randomTracks.length)];
          console.log('New track:', randomTrack);
          
          setStationInfo(prev => ({
            ...prev,
            currentTrack: `${randomTrack.artist} - ${randomTrack.title}`,
            metadata: randomTrack
          }));
        }
      } catch (error) {
        console.error('Error fetching metadata:', error);
      }
    };
    
    // Call immediately and then set up interval
    fetchMetadata();
    timerRef.current = window.setInterval(fetchMetadata, 5000);
    
    console.log('Metadata polling set up for URL:', streamUrl);
  } catch (error) {
    console.error('Error setting up metadata polling:', error);
  }
};
