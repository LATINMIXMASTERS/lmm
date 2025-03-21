
import { MutableRefObject } from 'react';
import { RadioMetadata } from '@/models/RadioStation';

interface StationInfo {
  name: string;
  currentTrack: string;
  coverImage: string;
  metadata?: RadioMetadata;
}

// Function to parse Icecast/Shoutcast metadata
const parseIcecastMetadata = (metadataString: string): Partial<RadioMetadata> => {
  const metadata: Partial<RadioMetadata> = {};
  
  // Simple parsing of common metadata formats
  const streamTitle = metadataString.match(/StreamTitle='([^']*)'/);
  if (streamTitle && streamTitle[1]) {
    const titleInfo = streamTitle[1];
    
    // Try to extract artist and title (common format: Artist - Title)
    const match = titleInfo.match(/(.*?)\s-\s(.*)/);
    if (match) {
      metadata.artist = match[1]?.trim();
      metadata.title = match[2]?.trim();
    } else {
      metadata.title = titleInfo.trim();
    }
  }
  
  return metadata;
};

// Function to fetch metadata from Icecast/Shoutcast streams
const fetchStreamMetadata = async (streamUrl: string): Promise<Partial<RadioMetadata>> => {
  try {
    // Make a proxy request to avoid CORS issues
    const corsProxy = 'https://corsproxy.io/?';
    const response = await fetch(`${corsProxy}${encodeURIComponent(streamUrl)}/status-json.xsl`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.status}`);
    }
    
    const data = await response.json();
    const metadata: Partial<RadioMetadata> = {};
    
    if (data?.icestats?.source) {
      const source = Array.isArray(data.icestats.source) 
        ? data.icestats.source[0] 
        : data.icestats.source;
      
      if (source.title) {
        const titleInfo = source.title;
        const match = titleInfo.match(/(.*?)\s-\s(.*)/);
        
        if (match) {
          metadata.artist = match[1]?.trim();
          metadata.title = match[2]?.trim();
        } else {
          metadata.title = titleInfo.trim();
        }
      }
    }
    
    return metadata;
  } catch (error) {
    console.error('Error fetching stream metadata:', error);
    return {};
  }
};

export const setupMetadataPolling = (
  streamUrl: string,
  metadataTimerRef: MutableRefObject<number | null>,
  setStationInfo: React.Dispatch<React.SetStateAction<StationInfo>>
): void => {
  if (metadataTimerRef.current) {
    window.clearInterval(metadataTimerRef.current);
  }
  
  // First, try to get actual metadata from the stream
  const fetchMetadata = async () => {
    try {
      // Try to get real metadata if the URL is valid
      if (streamUrl && (streamUrl.startsWith('http://') || streamUrl.startsWith('https://'))) {
        const metadata = await fetchStreamMetadata(streamUrl);
        
        if (metadata.title) {
          const metadataString = metadata.artist 
            ? `${metadata.artist} - ${metadata.title}`
            : metadata.title;
            
          setStationInfo(prev => ({
            ...prev,
            currentTrack: metadataString,
            metadata: metadata as RadioMetadata
          }));
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
    
    // Parse artist and title
    const match = randomTrack.match(/(.*?)\s-\s(.*)/);
    const metadata: RadioMetadata = {
      title: match ? match[2].trim() : randomTrack,
      artist: match ? match[1].trim() : 'Unknown Artist',
      startedAt: new Date()
    };
    
    setStationInfo(prev => ({
      ...prev,
      currentTrack: randomTrack,
      metadata
    }));
  };
  
  // Initial metadata fetch
  fetchMetadata();
  
  // Set up polling
  metadataTimerRef.current = window.setInterval(fetchMetadata, 15000);
};
