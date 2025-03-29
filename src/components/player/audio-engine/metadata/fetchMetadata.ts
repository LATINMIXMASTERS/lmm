
import { RadioMetadata } from '@/models/RadioStation';
import { isShoutcastUrl } from './streamUtils';
import { 
  fetchShoutcastMetadata, 
  fetchIcecastMetadata, 
  fetchGenericMetadata 
} from './providers';

/**
 * Fetches metadata from a radio stream with improved error handling and fallbacks
 * @param streamUrl The URL of the stream
 * @returns Promise with the metadata
 */
export const fetchStreamMetadata = async (streamUrl: string): Promise<Partial<RadioMetadata>> => {
  console.log('Attempting to fetch metadata from stream:', streamUrl);
  
  // Array to store all errors encountered during the process
  const errors: Error[] = [];
  
  try {
    // First, try the most specific approach based on URL pattern
    if (isShoutcastUrl(streamUrl)) {
      console.log('Detected Shoutcast URL, using specialized fetcher');
      try {
        return await fetchShoutcastMetadata(streamUrl);
      } catch (shoutcastError) {
        console.warn('Shoutcast metadata approach failed:', shoutcastError);
        errors.push(shoutcastError as Error);
        // Continue to next approach
      }
    }
    
    // Try Icecast metadata approach
    try {
      console.log('Attempting Icecast metadata approach');
      const icecastMetadata = await fetchIcecastMetadata(streamUrl);
      if (icecastMetadata.title && icecastMetadata.title !== 'Live Stream') {
        return icecastMetadata;
      }
    } catch (icecastError) {
      console.warn('Icecast metadata approach failed:', icecastError);
      errors.push(icecastError as Error);
      // Continue to generic approach
    }
    
    // Fallback to generic approach with retries
    try {
      console.log('Falling back to generic metadata approach');
      return await fetchGenericMetadata(streamUrl);
    } catch (genericError) {
      console.error('Generic metadata approach also failed:', genericError);
      errors.push(genericError as Error);
    }
    
    // If all approaches fail but we have metadata from a previous successful attempt
    // (This could be stored in a global cache or localStorage in a full implementation)
    
    console.error('All metadata fetching approaches failed');
    console.error('Errors encountered:', errors);
    
    // Return minimal metadata as last resort
    return {
      title: 'Live Stream',
      artist: 'Radio Station',
      coverArt: ''
    };
    
  } catch (error) {
    console.error('Unhandled error in fetchStreamMetadata:', error);
    return {
      title: 'Live Stream',
      artist: 'Radio Station',
      coverArt: ''
    };
  }
};

// Optionally export the error types for better type checking
export type MetadataFetchError = {
  source: 'shoutcast' | 'icecast' | 'generic';
  error: Error;
};
