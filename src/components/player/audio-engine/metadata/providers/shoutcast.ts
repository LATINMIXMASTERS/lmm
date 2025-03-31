
import { RadioMetadata } from '@/models/RadioStation';
import { fetchWithTimeout, getValueFromPath, findBestImageUrl } from '../utils';
import { extractStreamUrl, standardizeStreamUrl } from '../streamUtils';

// Fetch metadata from a Shoutcast stream
export const fetchShoutcastMetadata = async (streamUrl: string): Promise<Partial<RadioMetadata>> => {
  try {
    // Remove trailing slashes from URL
    let baseUrl = streamUrl.replace(/\/+$/, '');
    
    // Common Shoutcast API endpoints
    const statusEndpoint = `${baseUrl}/status-json.xsl`;
    const statsEndpoint = `${baseUrl}/stats`;
    const infoEndpoint = `${baseUrl}/7.html`;
    
    // Try to fetch from status-json.xsl first (Shoutcast v2)
    try {
      const response = await fetchWithTimeout(statusEndpoint);
      
      if (response.ok) {
        const data = await response.json();
        
        // Extract metadata from Shoutcast v2 API
        const serverName = getValueFromPath(data, 'servertitle') || '';
        const artist = getValueFromPath(data, 'streams.0.artist') || '';
        const title = getValueFromPath(data, 'streams.0.title') || '';
        const song = getValueFromPath(data, 'streams.0.songtitle') || '';
        
        // Try to find an image
        const coverArt = findBestImageUrl(data) || '';
        
        // Construct metadata
        return {
          artist: artist || (song.includes('-') ? song.split('-')[0].trim() : ''),
          title: title || (song.includes('-') ? song.split('-')[1].trim() : song),
          album: serverName,
          coverArt,
          timestamp: Date.now()
        };
      }
    } catch (error) {
      console.warn("Failed to fetch Shoutcast v2 status:", error);
    }
    
    // Try fallback to stats endpoint (Shoutcast v1)
    try {
      const response = await fetchWithTimeout(statsEndpoint);
      
      if (response.ok) {
        const text = await response.text();
        const currentSongMatch = text.match(/Current Song: <\/td><td[^>]*>([^<]+)</i);
        
        if (currentSongMatch && currentSongMatch[1]) {
          const song = currentSongMatch[1];
          
          // Most songs are formatted as "Artist - Title"
          const parts = song.split(' - ');
          const artist = parts.length > 1 ? parts[0].trim() : '';
          const title = parts.length > 1 ? parts.slice(1).join(' - ').trim() : song.trim();
          
          return {
            artist,
            title,
            timestamp: Date.now()
          };
        }
      }
    } catch (error) {
      console.warn("Failed to fetch Shoutcast v1 stats:", error);
    }
    
    // Minimal fallback response
    return {
      artist: '',
      title: 'Live Broadcast',
      timestamp: Date.now()
    };
    
  } catch (error) {
    console.error("Error in fetchShoutcastMetadata:", error);
    throw error;
  }
};
