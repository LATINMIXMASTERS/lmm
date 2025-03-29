
import { RadioMetadata } from '@/models/RadioStation';
import { fetchWithTimeout } from '../utils';
import { extractArtistAndTitle } from '../parseMetadata';

/**
 * Fetches metadata from a Shoutcast server
 * @param streamUrl The URL of the Shoutcast stream
 * @returns Promise with the metadata
 */
export const fetchShoutcastMetadata = async (streamUrl: string): Promise<Partial<RadioMetadata>> => {
  console.log('Fetching Shoutcast metadata from:', streamUrl);
  
  // Try multiple methods to get metadata from Shoutcast
  // 1. First try the status-json.xsl endpoint
  const statusUrl = streamUrl.endsWith('/') 
    ? `${streamUrl}status-json.xsl` 
    : `${streamUrl}/status-json.xsl`;
  
  try {
    console.log('Fetching from Shoutcast status URL:', statusUrl);
    const statusResponse = await fetchWithTimeout(statusUrl, { 
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    }, 3000);
    
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('Shoutcast status data:', statusData);
      
      // Extract data from Shoutcast response
      if (statusData.streams && statusData.streams.length > 0) {
        // Try to get from the first stream
        const stream = statusData.streams[0];
        
        // Get the current song title from the stream
        if (stream.songtitle) {
          const { artist, title } = extractArtistAndTitle(stream.songtitle);
          return { 
            artist: artist || stream.artist || '',
            title: title || stream.songtitle || '',
            album: stream.station_name || '',
            coverArt: statusData.serverimage || statusData.serverlogo || ''
          };
        }
      } else if (statusData.songtitle || statusData.servertitle) {
        // Alternative format
        const songInfo = statusData.songtitle || statusData.servertitle || '';
        const { artist, title } = extractArtistAndTitle(songInfo);
        
        return { 
          artist: artist || statusData.artist || '',
          title: title || songInfo,
          album: statusData.servertitle || '',
          coverArt: statusData.serverimage || statusData.serverlogo || ''
        };
      }
    }
  } catch (statusError) {
    console.log('Error fetching Shoutcast status:', statusError);
  }
  
  // 2. Try the /7.html endpoint (legacy Shoutcast v1)
  try {
    const legacyUrl = streamUrl.endsWith('/') 
      ? `${streamUrl}7.html` 
      : `${streamUrl}/7.html`;
    
    console.log('Trying legacy Shoutcast endpoint:', legacyUrl);
    const legacyResponse = await fetchWithTimeout(legacyUrl, { 
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    }, 3000);
    
    if (legacyResponse.ok) {
      const htmlText = await legacyResponse.text();
      // Parse the HTML to extract current song
      const songMatch = htmlText.match(/<body>(.*?)<\/body>/i);
      if (songMatch && songMatch[1]) {
        const songText = songMatch[1].trim();
        const { artist, title } = extractArtistAndTitle(songText);
        
        return { 
          artist: artist || '',
          title: title || songText,
          album: 'Live Stream',
          coverArt: ''
        };
      }
    }
  } catch (legacyError) {
    console.log('Error fetching from legacy Shoutcast endpoint:', legacyError);
  }
  
  // 3. Try the /currentsong?sid=1 endpoint (another Shoutcast variant)
  try {
    const currentSongUrl = streamUrl.endsWith('/') 
      ? `${streamUrl}currentsong?sid=1` 
      : `${streamUrl}/currentsong?sid=1`;
    
    console.log('Trying currentsong endpoint:', currentSongUrl);
    const songResponse = await fetchWithTimeout(currentSongUrl, { 
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    }, 3000);
    
    if (songResponse.ok) {
      const songText = await songResponse.text();
      if (songText) {
        const { artist, title } = extractArtistAndTitle(songText);
        
        return { 
          artist: artist || '',
          title: title || songText,
          album: 'Live Stream',
          coverArt: ''
        };
      }
    }
  } catch (currentSongError) {
    console.log('Error fetching from currentsong endpoint:', currentSongError);
  }
  
  // If all methods fail, return minimal metadata
  return {
    title: 'Live Stream',
    artist: 'Shoutcast Radio',
    coverArt: ''
  };
};
