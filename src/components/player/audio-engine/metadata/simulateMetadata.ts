
import { RadioMetadata } from '@/models/RadioStation';

// Generate simulated metadata for testing
export const generateSimulatedMetadata = (): RadioMetadata => {
  return {
    artist: 'Simulated Artist',
    title: 'Simulated Track',
    timestamp: Date.now()
  };
};
