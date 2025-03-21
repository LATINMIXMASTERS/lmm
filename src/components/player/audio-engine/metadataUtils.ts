
import { MutableRefObject } from 'react';
import { RadioMetadata } from '@/models/RadioStation';
import { useRadio } from '@/hooks/useRadioContext';
import { useToast } from '@/hooks/use-toast';

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

// Function to directly fetch metadata from different stream formats
const fetchStreamMetadata = async (streamUrl: string): Promise<Partial<RadioMetadata>> => {
  try {
    console.log("Fetching metadata from stream:", streamUrl);
    
    // Use a CORS proxy to avoid cross-origin issues
    const corsProxy = 'https://corsproxy.io/?';
    
    // Try multiple endpoints that might contain metadata
    const endpoints = [
      `${streamUrl}/status-json.xsl`,     // Icecast
      `${streamUrl}/7.html`,              // Shoutcast v1
      `${streamUrl}/stats`,               // Shoutcast v2
      `${streamUrl}/currentsong`,         // Some custom endpoints
      `${streamUrl}/metadata`,            // Some custom endpoints
      `${streamUrl}/now_playing.json`     // Another common endpoint
    ];
    
    // Try each endpoint until we get metadata
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${corsProxy}${encodeURIComponent(endpoint)}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json, text/plain, */*',
          },
          cache: 'no-cache'
        });
        
        if (!response.ok) {
          console.log(`Failed to fetch from ${endpoint}: ${response.status}`);
          continue;
        }
        
        const contentType = response.headers.get('content-type');
        let data;
        
        // Handle different response formats
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          // Try to parse as JSON first, if fails treat as text
          try {
            const text = await response.text();
            data = JSON.parse(text);
          } catch (e) {
            const text = await response.text();
            
            // Try to extract metadata from HTML or text
            const titleMatch = text.match(/<title>(.*?)<\/title>/) || 
                              text.match(/StreamTitle='([^']*)'/) ||
                              text.match(/currentsong=(.*?)(&|$)/);
                              
            if (titleMatch && titleMatch[1]) {
              // Found title in HTML or text format
              const titleInfo = titleMatch[1];
              const match = titleInfo.match(/(.*?)\s-\s(.*)/);
              
              if (match) {
                return {
                  artist: match[1]?.trim(),
                  title: match[2]?.trim(),
                  startedAt: new Date()
                };
              } else {
                return {
                  title: titleInfo.trim(),
                  artist: 'Unknown Artist',
                  startedAt: new Date()
                };
              }
            }
            continue;
          }
        }
        
        // Process Icecast JSON format
        if (data?.icestats?.source) {
          const source = Array.isArray(data.icestats.source) 
            ? data.icestats.source[0] 
            : data.icestats.source;
          
          if (source.title) {
            const titleInfo = source.title;
            const match = titleInfo.match(/(.*?)\s-\s(.*)/);
            
            if (match) {
              return {
                artist: match[1]?.trim(),
                title: match[2]?.trim(),
                startedAt: new Date(),
                album: source.album || undefined
              };
            } else {
              return {
                title: titleInfo.trim(),
                artist: source.artist || 'Unknown Artist',
                startedAt: new Date(),
                album: source.album || undefined
              };
            }
          }
        }
        
        // Process Shoutcast v2 format
        if (data?.songtitle || data?.title) {
          const titleInfo = data.songtitle || data.title;
          const match = titleInfo.match(/(.*?)\s-\s(.*)/);
          
          if (match) {
            return {
              artist: match[1]?.trim(),
              title: match[2]?.trim(),
              startedAt: new Date()
            };
          } else {
            return {
              title: titleInfo.trim(),
              artist: data.artist || 'Unknown Artist',
              startedAt: new Date()
            };
          }
        }
        
        // Process now_playing.json format (common for many radio backends)
        if (data?.now_playing?.song) {
          const song = data.now_playing.song;
          return {
            title: song.title,
            artist: song.artist,
            album: song.album,
            coverArt: song.art || song.artwork_url,
            startedAt: new Date()
          };
        }
      } catch (error) {
        console.error(`Error fetching from ${endpoint}:`, error);
        continue;
      }
    }
    
    console.log("No metadata found in stream endpoints");
    return {};
    
  } catch (error) {
    console.error('Error fetching stream metadata:', error);
    return {};
  }
};

export const setupMetadataPolling = (
  streamUrl: string,
  metadataTimerRef: MutableRefObject<number | null>,
  setStationInfo: React.Dispatch<React.SetStateAction<StationInfo>>,
  stationId?: string
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
          
          // If we have a stationId, update the metadata in the central store
          if (stationId) {
            const { updateStationMetadata } = useRadio();
            if (updateStationMetadata) {
              updateStationMetadata(stationId, metadata as RadioMetadata);
            }
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
    
    // If we have a stationId, update the metadata in the central store
    if (stationId) {
      const { updateStationMetadata } = useRadio();
      if (updateStationMetadata) {
        updateStationMetadata(stationId, metadata);
      }
    }
  };
  
  // Initial metadata fetch
  fetchMetadata();
  
  // Set up polling (every 15 seconds to avoid too many requests)
  metadataTimerRef.current = window.setInterval(fetchMetadata, 15000);
};

// Utility function to extract stream URLs from different formats
export const extractStreamUrl = (streamUrl: string): string => {
  // Handle different URL formats
  if (streamUrl.includes('.m3u') || streamUrl.includes('.pls')) {
    // For playlist files, we should technically download and parse them
    // But since we can't do that easily with CORS issues, return as is for now
    return streamUrl;
  }
  
  // Clean up the URL if needed
  if (!streamUrl.startsWith('http://') && !streamUrl.startsWith('https://')) {
    return `https://${streamUrl}`;
  }
  
  return streamUrl;
};
