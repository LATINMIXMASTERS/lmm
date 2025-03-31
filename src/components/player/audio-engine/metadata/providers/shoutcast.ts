
import { RadioMetadata } from '@/models/RadioStation';
import { fetchWithTimeout, extractArtistAndTitle } from '../utils';
import { standardizeStreamUrl } from '../streamUtils';

/**
 * Fetches metadata from a Shoutcast server
 * @param streamUrl The URL of the Shoutcast stream
 * @returns Promise with the metadata
 */
export const fetchShoutcastMetadata = async (streamUrl: string): Promise<Partial<RadioMetadata>> => {
  console.log('Fetching Shoutcast metadata from:', streamUrl);
  
  try {
    const standardUrl = standardizeStreamUrl(streamUrl);
    
    // Try to get the status page URL
    const statusUrl = new URL(standardUrl);
    const hostPort = statusUrl.host;
    
    // Different Shoutcast versions have different status endpoints
    const endpoints = [
      // Shoutcast v2 status endpoints
      `http://${hostPort}/status-json.xsl`,
      `http://${hostPort}/7.html`,
      `http://${hostPort}/stats`,
      
      // Shoutcast v1 status endpoints
      `http://${hostPort}/7.html`,
      `http://${hostPort}/index.html`,
      
      // Last resort - try direct stream headers
      standardUrl
    ];
    
    // Try each endpoint in sequence
    for (const endpoint of endpoints) {
      try {
        const response = await fetchWithTimeout(endpoint, {
          method: 'GET',
          headers: { 'User-Agent': 'Mozilla/5.0' }
        }, 3000, 1);
        
        if (!response.ok) continue;
        
        // Check content type to determine response format
        const contentType = response.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
          // Parse JSON response (Shoutcast v2)
          const data = await response.json();
          
          if (data?.streams?.[0]) {
            // Shoutcast v2 JSON format
            const stream = data.streams[0];
            const songTitle = stream.songtitle || stream.song || '';
            const { artist, title } = extractArtistAndTitle(songTitle);
            
            return {
              title: title || songTitle || 'Live Stream',
              artist: artist || stream.artist || '',
              album: stream.album || '',
              coverArt: stream.artwork || ''
            };
          } else if (data?.icestats?.source) {
            // Alternative JSON format (sometimes used)
            const source = Array.isArray(data.icestats.source) 
              ? data.icestats.source[0] 
              : data.icestats.source;
              
            const songTitle = source.title || source.song || '';
            const { artist, title } = extractArtistAndTitle(songTitle);
            
            return {
              title: title || songTitle || 'Live Stream',
              artist: artist || source.artist || '',
              album: source.server_name || '',
              coverArt: ''
            };
          }
        } else {
          // Handle HTML or text response (Shoutcast v1 or simple status)
          const text = await response.text();
          
          // Look for song info in the response
          const songMatch = text.match(/<body>(.*?)<\/body>/s) || 
                           text.match(/StreamTitle='(.*?)';/) ||
                           text.match(/currentsong=(.*?)&/);
                           
          if (songMatch && songMatch[1]) {
            const songTitle = songMatch[1].replace(/\+/g, ' ').trim();
            const { artist, title } = extractArtistAndTitle(songTitle);
            
            return {
              title: title || songTitle || 'Live Stream',
              artist: artist || '',
              album: 'Live Radio',
              coverArt: ''
            };
          }
        }
      } catch (endpointError) {
        console.log(`Error with endpoint ${endpoint}:`, endpointError);
        // Continue to next endpoint
      }
    }
    
    // If all endpoints fail, return minimal info
    return {
      title: 'Live Stream',
      artist: 'Radio Station',
      album: 'Live Radio',
      coverArt: ''
    };
    
  } catch (error) {
    console.error('Error fetching Shoutcast metadata:', error);
    throw error;
  }
};
