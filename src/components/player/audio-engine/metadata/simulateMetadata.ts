
import { RadioMetadata } from '@/models/RadioStation';

// Sample artists and titles for simulated metadata
const sampleArtists = [
  'DJ Ramirez', 'LATINMIXMASTERS Crew', 'DJ Latino', 'Salsa Kings',
  'Reggaeton Masters', 'Cumbia Collective', 'Bachata Legends', 'Latin House DJs'
];

const sampleTitles = [
  'Summer Vibes Mix', 'Latin Party Anthems', 'Reggaeton Hits 2023',
  'Salsa Classics Remix', 'Tropical House Session', 'Bachata Love Songs',
  'Cumbia Revolution', 'Urban Latino Mix'
];

/**
 * Generates simulated metadata for stations without real metadata
 */
export const generateSimulatedMetadata = (): {
  trackString: string;
  metadata: RadioMetadata;
} => {
  const artist = sampleArtists[Math.floor(Math.random() * sampleArtists.length)];
  const title = sampleTitles[Math.floor(Math.random() * sampleTitles.length)];
  
  // Add a timestamp to avoid the same metadata appearing multiple times
  const now = new Date();
  const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return {
    trackString: `${artist} - ${title} (${timestamp})`,
    metadata: {
      artist,
      title: `${title} (${timestamp})`,
      startedAt: now,
      album: 'LATINMIXMASTERS Radio',
      coverArt: `https://picsum.photos/seed/${Math.random().toString(36).substring(7)}/300/300`
    }
  };
};
