
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
  return [
    `${baseUrl}/status-json.xsl`,     // Icecast
    `${baseUrl}/7.html`,              // Shoutcast v1
    `${baseUrl}/stats`,               // Shoutcast v2
    `${baseUrl}/currentsong`,         // Some custom endpoints
    `${baseUrl}/metadata`,            // Some custom endpoints
    `${baseUrl}/now_playing.json`     // Another common endpoint
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
};

/**
 * Processes response data to extract metadata
 * @param data - The parsed response data
 * @returns Partial RadioMetadata object
 */
export const processResponseData = (data: any): Partial<RadioMetadata> => {
  // Handle text response
  if (data.isText) {
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
    const response = await fetch(`${corsProxy}${encodeURIComponent(endpoint)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
      },
      cache: 'no-cache'
    });
    
    const data = await parseResponse(response);
    if (!data) return null;
    
    return processResponseData(data);
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
    
    const endpoints = getMetadataEndpoints(streamUrl);
    
    // Try each endpoint until we get metadata
    for (const endpoint of endpoints) {
      const metadata = await fetchEndpointMetadata(endpoint);
      
      if (metadata && Object.keys(metadata).length > 0) {
        return metadata;
      }
    }
    
    console.log("No metadata found in stream endpoints");
    return {};
    
  } catch (error) {
    console.error('Error fetching stream metadata:', error);
    return {};
  }
};
