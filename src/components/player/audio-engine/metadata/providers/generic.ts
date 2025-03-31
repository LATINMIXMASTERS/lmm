
import { RadioMetadata } from '@/models/RadioStation';

// Generic metadata fetcher as fallback
export const fetchGenericMetadata = async (streamUrl: string): Promise<Partial<RadioMetadata>> => {
  try {
    // This is a placeholder implementation
    return {
      artist: 'Radio Station',
      title: 'Live Stream',
      timestamp: Date.now()
    };
  } catch (error) {
    console.error("Error in fetchGenericMetadata:", error);
    throw error;
  }
};
