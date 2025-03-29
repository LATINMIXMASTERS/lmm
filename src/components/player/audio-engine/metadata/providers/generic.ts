
import { RadioMetadata } from '@/models/RadioStation';
import { fetchWithTimeout } from '../utils';

/**
 * Fetches metadata using generic methods for unknown stream types
 * @param streamUrl The URL of the stream
 * @returns Promise with the metadata
 */
export const fetchGenericMetadata = async (streamUrl: string): Promise<Partial<RadioMetadata>> => {
  console.log('Attempting generic metadata fetch from:', streamUrl);
  
  // CORS proxy URLs to try
  const corsProxyUrls = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(streamUrl)}`,
    `https://cors-anywhere.herokuapp.com/${streamUrl}`,
    streamUrl // Direct access as fallback
  ];
  
  // Try different proxies in sequence until one works
  for (const url of corsProxyUrls) {
    try {
      console.log(`Attempting to fetch stream metadata from: ${url}`);
      
      const response = await fetchWithTimeout(url, { 
        method: 'GET',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      }, 3000);
      
      if (!response.ok) {
        console.log(`Fetch failed with status: ${response.status}`);
        continue; // Try next proxy
      }
      
      // Extract ICY metadata from headers if available
      const icyMetadata = response.headers.get('icy-metaint') || 
                        response.headers.get('Icy-MetaInt') ||
                        response.headers.get('icy-name');
      
      if (icyMetadata) {
        console.log('Found ICY metadata in headers:', icyMetadata);
        const icyName = response.headers.get('icy-name') || '';
        const icyDescription = response.headers.get('icy-description') || '';
        const icyGenre = response.headers.get('icy-genre') || '';
        const icyUrl = response.headers.get('icy-url') || '';
        
        // Parse and return the available metadata
        return {
          title: icyDescription || icyName || 'Live Stream',
          artist: icyGenre || '',
          album: icyName || '',
          coverArt: icyUrl || ''
        };
      }
      
      // We got a successful response but no metadata, extract what we can
      const contentType = response.headers.get('content-type') || '';
      
      return {
        title: 'Live Stream',
        artist: contentType.includes('audio') ? 'Radio Station' : '',
        coverArt: ''
      };
    } catch (proxyError) {
      console.log(`Error using proxy ${url}:`, proxyError);
      // Continue to the next proxy
    }
  }
  
  // If all proxies fail, return minimal metadata
  return {
    title: 'Live Stream',
    artist: 'Radio Station',
    coverArt: ''
  };
};
