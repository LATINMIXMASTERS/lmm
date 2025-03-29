
import { RadioMetadata } from '@/models/RadioStation';
import { fetchWithTimeout } from '../utils';

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
    }, 3000);
    
    if (response.ok) {
      // Extract ICY metadata from headers
      const icyName = response.headers.get('icy-name') || '';
      const icyDescription = response.headers.get('icy-description') || '';
      const icyGenre = response.headers.get('icy-genre') || '';
      const icyUrl = response.headers.get('icy-url') || '';
      
      return {
        title: icyDescription || icyName || 'Icecast Stream',
        artist: icyGenre || '',
        album: icyName || 'Live Radio',
        coverArt: icyUrl || ''
      };
    }
  } catch (error) {
    console.error('Error fetching Icecast metadata:', error);
  }
  
  return {
    title: 'Live Stream',
    artist: 'Icecast Radio',
    coverArt: ''
  };
};
