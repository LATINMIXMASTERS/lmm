
import { RadioMetadata } from '@/models/RadioStation';
import { fetchWithTimeout, safeJsonParse } from '../utils';

/**
 * Fetches metadata from an Icecast server
 * @param streamUrl The URL of the Icecast stream
 * @returns Promise with the metadata
 */
export const fetchIcecastMetadata = async (streamUrl: string): Promise<Partial<RadioMetadata>> => {
  console.log('Fetching Icecast metadata from:', streamUrl);
  
  try {
    // Icecast stations typically provide metadata through HTTP headers
    const response = await fetchWithTimeout(streamUrl, {
      method: 'HEAD'
    }, 3000, 2, 1000);
    
    if (response.ok) {
      // Extract ICY metadata from headers
      const icyName = response.headers.get('icy-name') || '';
      const icyDescription = response.headers.get('icy-description') || '';
      const icyGenre = response.headers.get('icy-genre') || '';
      const icyUrl = response.headers.get('icy-url') || '';
      
      // Try to get more info from status-json.xsl if available
      let additionalInfo: { title?: string; artist?: string } = {};
      try {
        const statusUrl = new URL(streamUrl);
        // Replace any path with /status-json.xsl
        statusUrl.pathname = '/status-json.xsl';
        
        const statusResponse = await fetchWithTimeout(statusUrl.toString(), {
          method: 'GET'
        }, 2000, 1);
        
        if (statusResponse.ok) {
          const data = await statusResponse.json();
          if (data?.icestats?.source) {
            const source = Array.isArray(data.icestats.source) 
              ? data.icestats.source[0] 
              : data.icestats.source;
              
            additionalInfo = {
              title: source.title || source.server_name || icyDescription || icyName,
              artist: source.artist || icyGenre
            };
          }
        }
      } catch (statusError) {
        console.log('Could not fetch additional Icecast info:', statusError);
      }
      
      return {
        title: additionalInfo.title || icyDescription || icyName || 'Icecast Stream',
        artist: additionalInfo.artist || icyGenre || '',
        album: icyName || 'Live Radio',
        coverArt: icyUrl || ''
      };
    }
    
    throw new Error(`Failed to fetch Icecast metadata: ${response.status}`);
  } catch (error) {
    console.error('Error fetching Icecast metadata:', error);
    throw error; // Let the main function handle fallback
  }
};
