
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

    // Special handling for Shoutcast URLs
    if (streamUrl.includes('lmmradiocast.com') || isShoutcastUrl(streamUrl)) {
      console.log('Detected Shoutcast URL, trying to fetch status data');
      
      // For Shoutcast, we need to use the /status-json.xsl endpoint
      const statusUrl = streamUrl.endsWith('/') 
        ? `${streamUrl}status-json.xsl` 
        : `${streamUrl}/status-json.xsl`;
      
      try {
        console.log('Fetching from Shoutcast status URL:', statusUrl);
        const statusResponse = await fetch(statusUrl, { 
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });
        
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
                album: stream.station_name || ''
              };
            }
          } else if (statusData.songtitle || statusData.servertitle) {
            // Alternative format
            const songInfo = statusData.songtitle || statusData.servertitle || '';
            const { artist, title } = extractArtistAndTitle(songInfo);
            
            return { 
              artist: artist || statusData.artist || '',
              title: title || songInfo,
              album: statusData.servertitle || ''
            };
          }
        }
      } catch (statusError) {
        console.log('Error fetching Shoutcast status:', statusError);
        // Continue with other methods if this fails
      }
      
      // If status-json.xsl fails, try the /7.html endpoint (legacy Shoutcast v1)
      try {
        const legacyUrl = streamUrl.endsWith('/') 
          ? `${streamUrl}7.html` 
          : `${streamUrl}/7.html`;
        
        console.log('Trying legacy Shoutcast endpoint:', legacyUrl);
        const legacyResponse = await fetch(legacyUrl, { 
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });
        
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
              album: 'Live Stream'
            };
          }
        }
      } catch (legacyError) {
        console.log('Error fetching from legacy Shoutcast endpoint:', legacyError);
      }
    }

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

// Helper function to identify Shoutcast URLs
function isShoutcastUrl(url: string): boolean {
  return url.includes('shoutcast') || 
         url.includes('radionomy') || 
         url.includes('radiocast') || 
         url.includes('lmmradio') ||
         /:\d+\//.test(url); // Often Shoutcast uses port numbers
}
