
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
  
  return [
    `${baseHostUrl}/status-json.xsl`,     // Icecast
    `${baseHostUrl}/7.html`,              // Shoutcast v1
    `${baseHostUrl}/stats`,               // Shoutcast v2
    `${baseHostUrl}/currentsong`,         // Some custom endpoints
    `${baseHostUrl}/metadata`,            // Some custom endpoints
    `${baseHostUrl}/now_playing.json`,    // Another common endpoint
    `${baseUrl}/status-json.xsl`,         // Try with full path too
    `${baseUrl}/7.html`,                  // Try with full path too
    `${baseUrl}/stats`                    // Try with full path too
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
    console.log(`Trying to fetch metadata from: ${endpoint}`);
    
    const response = await fetch(`${corsProxy}${encodeURIComponent(endpoint)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
      },
      cache: 'no-cache'
    });
    
    const data = await parseResponse(response);
    if (!data) return null;
    
    const metadata = processResponseData(data);
    if (Object.keys(metadata).length > 0) {
      console.log(`Found metadata at ${endpoint}:`, metadata);
    }
    
    return metadata;
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
    if (!streamUrl.startsWith('http://') && !streamUrl.startsWith('https://')) {
      formattedStreamUrl = `http://${streamUrl}`;
    }
    
    // Generate endpoints to try
    const endpoints = getMetadataEndpoints(formattedStreamUrl);
    console.log("Trying these metadata endpoints:", endpoints);
    
    // Try each endpoint until we get metadata
    for (const endpoint of endpoints) {
      const metadata = await fetchEndpointMetadata(endpoint);
      
      if (metadata && Object.keys(metadata).length > 0) {
        console.log("Successfully found metadata at:", endpoint);
        return metadata;
      }
    }
    
    // If no metadata found from endpoints, try to extract directly from the stream
    console.log("No metadata found in stream endpoints, simulating metadata");
    return {};
    
  } catch (error) {
    console.error('Error fetching stream metadata:', error);
    return {};
  }
};
