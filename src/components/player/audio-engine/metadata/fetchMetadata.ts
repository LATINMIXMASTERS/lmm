
import { RadioMetadata } from '@/models/RadioStation';
import { 
  parseIcecastJson, 
  parseShoutcastData, 
  parseNowPlayingJson, 
  parseTextMetadata 
} from './parseMetadata';

/**
 * List of common metadata endpoints for different stream formats
 * @param baseUrl - The base URL of the stream
 * @returns Array of endpoint URLs to try
 */
export const getMetadataEndpoints = (baseUrl: string): string[] => {
  // Clean up the URL to get just the base part
  const urlObj = new URL(baseUrl);
  const baseHostUrl = `${urlObj.protocol}//${urlObj.hostname}`;
  const basePathUrl = baseHostUrl + urlObj.pathname.split('/').slice(0, -1).join('/');
  
  return [
    // Standard Icecast endpoints
    `${baseHostUrl}/status-json.xsl`,
    `${basePathUrl}/status-json.xsl`,
    `${baseUrl}/status-json.xsl`,
    
    // Shoutcast endpoints
    `${baseHostUrl}/stats`,
    `${baseHostUrl}/7.html`,
    `${baseHostUrl}/played`,
    `${basePathUrl}/stats`,
    `${basePathUrl}/7.html`,
    
    // Common alternative endpoints
    `${baseHostUrl}/currentsong`,
    `${baseHostUrl}/metadata`,
    `${baseHostUrl}/now_playing`,
    `${baseHostUrl}/now_playing.json`,
    `${baseHostUrl}/api/live/nowplaying`,
    `${baseHostUrl}/api/nowplaying_proxy`,
    
    // Direct stream metadata (last resort)
    `${baseUrl}?metadata=1`
  ];
};

/**
 * Attempts to parse response data based on content type
 * @param response - Fetch response object
 * @returns Parsed data or null
 */
export const parseResponse = async (response: Response): Promise<any | null> => {
  if (!response.ok) return null;
  
  const contentType = response.headers.get('content-type');
  
  try {
    // Handle different response formats
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      // Try to parse as JSON first, if fails treat as text
      try {
        const text = await response.text();
        return JSON.parse(text);
      } catch (e) {
        const text = await response.text();
        return { text, isText: true };
      }
    }
  } catch (error) {
    console.error("Error parsing response:", error);
    return null;
  }
};

/**
 * Processes response data to extract metadata
 * @param data - The parsed response data
 * @returns Partial RadioMetadata object
 */
export const processResponseData = (data: any): Partial<RadioMetadata> => {
  // Handle text response
  if (data?.isText) {
    return parseTextMetadata(data.text);
  }
  
  // Process different known formats
  const icecastData = parseIcecastJson(data);
  if (Object.keys(icecastData).length > 0) return icecastData;
  
  const shoutcastData = parseShoutcastData(data);
  if (Object.keys(shoutcastData).length > 0) return shoutcastData;
  
  const nowPlayingData = parseNowPlayingJson(data);
  if (Object.keys(nowPlayingData).length > 0) return nowPlayingData;
  
  return {};
};

/**
 * Fetches metadata from a single endpoint
 * @param endpoint - The endpoint URL to fetch from
 * @param corsProxy - Optional CORS proxy URL
 * @returns Partial RadioMetadata object or null on failure
 */
export const fetchEndpointMetadata = async (
  endpoint: string, 
  corsProxy: string = 'https://corsproxy.io/?'
): Promise<Partial<RadioMetadata> | null> => {
  try {
    console.log(`Trying to fetch metadata from: ${endpoint}`);
    
    // Use a different CORS proxy as fallback if the main one fails
    const proxies = [
      corsProxy,
      'https://proxy.cors.sh/',
      'https://api.allorigins.win/raw?url='
    ];
    
    let lastError = null;
    
    // Try each proxy until one works
    for (const proxy of proxies) {
      try {
        const response = await fetch(`${proxy}${encodeURIComponent(endpoint)}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json, text/plain, */*',
          },
          cache: 'no-cache',
          // Higher timeout for potentially slow responses
          signal: AbortSignal.timeout(5000)
        });
        
        const data = await parseResponse(response);
        if (!data) continue;
        
        const metadata = processResponseData(data);
        if (Object.keys(metadata).length > 0) {
          console.log(`Found metadata at ${endpoint}:`, metadata);
          return metadata;
        }
      } catch (error) {
        lastError = error;
        console.log(`Error with proxy ${proxy} for ${endpoint}:`, error);
        // Try next proxy
      }
    }
    
    if (lastError) {
      throw lastError;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    return null;
  }
};

/**
 * Directly fetch metadata from different stream formats by trying multiple endpoints
 * @param streamUrl - The stream URL
 * @returns Partial RadioMetadata object
 */
export const fetchStreamMetadata = async (streamUrl: string): Promise<Partial<RadioMetadata>> => {
  try {
    console.log("Fetching metadata from stream:", streamUrl);
    
    // If the URL isn't properly formatted, add http:// prefix
    let formattedStreamUrl = streamUrl;
    if (!formattedStreamUrl.startsWith('http://') && !formattedStreamUrl.startsWith('https://')) {
      formattedStreamUrl = `https://${streamUrl}`;
      // Try HTTPS first, fallback to HTTP if needed
      try {
        new URL(formattedStreamUrl);
      } catch (e) {
        formattedStreamUrl = `http://${streamUrl}`;
      }
    }
    
    // Generate endpoints to try
    const endpoints = getMetadataEndpoints(formattedStreamUrl);
    console.log("Trying these metadata endpoints:", endpoints);
    
    // Try each endpoint until we get metadata
    for (const endpoint of endpoints) {
      try {
        const metadata = await fetchEndpointMetadata(endpoint);
        
        if (metadata && Object.keys(metadata).length > 0) {
          console.log("Successfully found metadata at:", endpoint);
          return metadata;
        }
      } catch (error) {
        // Continue to next endpoint on error
        console.error(`Error with endpoint ${endpoint}:`, error);
      }
    }
    
    // If no metadata found from endpoints, generate simulated metadata
    console.log("No metadata found in stream endpoints, using simulated metadata");
    
    // Return minimal metadata to show station is playing
    return {
      title: "Live Stream", 
      artist: "Latin Mix Masters",
      startedAt: new Date()
    };
    
  } catch (error) {
    console.error('Error fetching stream metadata:', error);
    return {
      title: "Live Stream", 
      artist: "Latin Mix Masters",
      startedAt: new Date()
    };
  }
};
