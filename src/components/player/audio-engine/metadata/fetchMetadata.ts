
import { extractArtistAndTitle } from './parseMetadata';
import { RadioMetadata } from '@/models/RadioStation';

/**
 * Fetches metadata from a radio stream
 * @param streamUrl The URL of the stream
 * @returns Promise with the metadata
 */
export const fetchStreamMetadata = async (streamUrl: string): Promise<Partial<RadioMetadata>> => {
  try {
    // For security and CORS reasons, we try to proxy through a compatible service
    const proxyUrl = `https://cors-anywhere.herokuapp.com/${streamUrl}`;
    const corsProxyUrls = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(streamUrl)}`,
      proxyUrl,
      streamUrl // Direct access as fallback
    ];

    // Try different proxies in sequence until one works
    for (const url of corsProxyUrls) {
      try {
        console.log(`Attempting to fetch stream metadata from: ${url}`);
        
        // Set a timeout for fetch operations
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(url, { 
          method: 'GET',
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          console.log(`Fetch failed with status: ${response.status}`);
          continue; // Try next proxy
        }
        
        // Extract ICY metadata from headers if available
        const icyMetadata = response.headers.get('icy-metaint') || 
                           response.headers.get('Icy-MetaInt') ||
                           response.headers.get('icy-name');
        
        if (icyMetadata) {
          console.log('Found ICY metadata:', icyMetadata);
          const icyName = response.headers.get('icy-name') || '';
          const icyDescription = response.headers.get('icy-description') || '';
          const icyGenre = response.headers.get('icy-genre') || '';
          
          // Parse and return the available metadata
          return {
            title: icyDescription || icyName,
            artist: icyGenre || '',
            album: icyName
          };
        }
        
        // For SHOUTcast stations, try to access status information
        if (url.includes('shoutcast')) {
          const statusUrl = url.replace('/stream', '/status-json.xsl');
          console.log('Trying SHOUTcast status URL:', statusUrl);
          
          try {
            // Attempt to fetch SHOUTcast status information
            const statusController = new AbortController();
            const statusTimeoutId = setTimeout(() => statusController.abort(), 2000);
            
            const statusResponse = await fetch(statusUrl, { 
              signal: statusController.signal 
            });
            
            clearTimeout(statusTimeoutId);
            
            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              if (statusData.songtitle) {
                const { artist, title } = extractArtistAndTitle(statusData.songtitle);
                return { artist, title };
              }
            }
          } catch (statusError) {
            console.log('Error fetching SHOUTcast status:', statusError);
          }
        }
        
        // We got a successful response but no metadata, extract what we can
        const contentType = response.headers.get('content-type') || '';
        
        return {
          title: 'Live Stream',
          artist: contentType.includes('audio') ? 'Radio Station' : ''
        };
      } catch (proxyError) {
        console.log(`Error using proxy ${url}:`, proxyError);
        // Continue to the next proxy
      }
    }
    
    // If all proxies fail, return minimal metadata
    console.log('All proxies failed, returning minimal metadata');
    return {
      title: 'Live Stream',
      artist: 'Radio Station'
    };
  } catch (error) {
    console.error('Error fetching stream metadata:', error);
    return {
      title: 'Live Stream',
      artist: 'Radio Station'
    };
  }
};
