
import { RadioMetadata } from '@/models/RadioStation';
import { isShoutcastUrl } from './streamUtils';
import { 
  fetchShoutcastMetadata, 
  fetchIcecastMetadata, 
  fetchGenericMetadata 
} from './providers';

/**
 * Fetches metadata from a radio stream
 * @param streamUrl The URL of the stream
 * @returns Promise with the metadata
 */
export const fetchStreamMetadata = async (streamUrl: string): Promise<Partial<RadioMetadata>> => {
  try {
    console.log('Attempting to fetch metadata from stream:', streamUrl);
    
    // Special handling for Shoutcast URLs
    if (isShoutcastUrl(streamUrl)) {
      console.log('Detected Shoutcast URL, using specialized fetcher');
      return await fetchShoutcastMetadata(streamUrl);
    }
    
    // Try Icecast metadata approach
    try {
      const icecastMetadata = await fetchIcecastMetadata(streamUrl);
      if (icecastMetadata.title && icecastMetadata.title !== 'Live Stream') {
        return icecastMetadata;
      }
    } catch (icecastError) {
      console.log('Icecast metadata approach failed:', icecastError);
    }
    
    // Fallback to generic approach
    return await fetchGenericMetadata(streamUrl);
    
  } catch (error) {
    console.error('Error fetching stream metadata:', error);
    return {
      title: 'Live Stream',
      artist: 'Radio Station',
      coverArt: ''
    };
  }
};
