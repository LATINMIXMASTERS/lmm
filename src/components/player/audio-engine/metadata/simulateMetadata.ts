
import { RadioMetadata } from '@/models/RadioStation';
import { extractArtistAndTitle } from './parseMetadata';

// Sample tracks for simulation
const SAMPLE_TRACKS = [
  "DJ Lobo - Bachata Mix 2025",
  "Marc Anthony - Vivir Mi Vida",
  "Bad Bunny - Tití Me Preguntó",
  "Romeo Santos - Propuesta Indecente",
  "Daddy Yankee - Gasolina (Club Mix)",
  "Luis Fonsi - Despacito (Radio Edit)",
  "Aventura - Obsesión",
  "Rauw Alejandro - Todo de Ti"
];

/**
 * Generates random metadata for simulation purposes
 * @returns A random track with metadata
 */
export const generateSimulatedMetadata = (): { trackString: string, metadata: RadioMetadata } => {
  const randomTrack = SAMPLE_TRACKS[Math.floor(Math.random() * SAMPLE_TRACKS.length)];
  const { artist, title } = extractArtistAndTitle(randomTrack);
  
  const metadata: RadioMetadata = {
    title,
    artist,
    startedAt: new Date()
  };
  
  return { trackString: randomTrack, metadata };
};
