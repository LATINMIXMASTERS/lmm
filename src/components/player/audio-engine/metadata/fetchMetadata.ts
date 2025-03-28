
import { extractArtistAndTitle } from './parseMetadata';
import { RadioMetadata } from '@/models/RadioStation';
import { isShoutcastUrl } from './streamUtils';

/**
 * Fetches metadata from a radio stream
 * @param streamUrl The URL of the stream
 * @returns Promise with the metadata
 */
export const fetchStreamMetadata = async (streamUrl: string): Promise<Partial<RadioMetadata>> => {
  try {
    console.log('Attempting to fetch metadata from stream:', streamUrl);
    
    // CORS proxy URLs to try
    const corsProxyUrls = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(streamUrl)}`,
      `https://cors-anywhere.herokuapp.com/${streamUrl}`,
      streamUrl // Direct access as fallback
    ];

    // Special handling for Shoutcast URLs, especially lmmradiocast.com
    if (isShoutcastUrl(streamUrl)) {
      console.log('Detected Shoutcast URL, trying to fetch status data');
      
      // For lmmradiocast.com specifically
      if (streamUrl.includes('lmmradiocast.com')) {
        console.log('Using special handling for lmmradiocast.com');
        
        // Try multiple methods to get metadata
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
      }
    }

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
          console.log('Found ICY metadata:', icyMetadata);
          const icyName = response.headers.get('icy-name') || '';
          const icyDescription = response.headers.get('icy-description') || '';
          const icyGenre = response.headers.get('icy-genre') || '';
          const icyUrl = response.headers.get('icy-url') || '';
          
          // Parse and return the available metadata
          return {
            title: icyDescription || icyName,
            artist: icyGenre || '',
            album: icyName,
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
    console.log('All proxies failed, returning minimal metadata');
    return {
      title: 'Live Stream',
      artist: 'Radio Station',
      coverArt: ''
    };
  } catch (error) {
    console.error('Error fetching stream metadata:', error);
    return {
      title: 'Live Stream',
      artist: 'Radio Station',
      coverArt: ''
    };
  }
};

/**
 * Fetch with timeout to avoid hanging requests
 */
const fetchWithTimeout = (url: string, options: RequestInit = {}, timeout = 5000): Promise<Response> => {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const { signal } = controller;
    
    const timeoutId = setTimeout(() => {
      controller.abort();
      reject(new Error(`Request timeout for ${url}`));
    }, timeout);
    
    fetch(url, { ...options, signal })
      .then(response => {
        clearTimeout(timeoutId);
        resolve(response);
      })
      .catch(error => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
};
