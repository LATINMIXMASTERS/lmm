
import { RadioMetadata } from '@/models/RadioStation';

// Latin music artists and songs for simulation
const latinArtists = [
  'Bad Bunny',
  'Karol G',
  'J Balvin',
  'Shakira',
  'Daddy Yankee',
  'Maluma',
  'Ozuna',
  'Luis Fonsi',
  'Nicky Jam',
  'Rosalía',
  'Rauw Alejandro',
  'Anuel AA',
  'Sech',
  'Becky G',
  'Romeo Santos',
  'Farruko',
  'Marc Anthony',
  'Enrique Iglesias',
  'Prince Royce',
  'Ricky Martin'
];

const latinSongs = [
  'Monaco',
  'Tusa',
  'La Canción',
  'TQG',
  'Despacito',
  'Felices los 4',
  'Dákiti',
  'Con Calma',
  'X',
  'Con Altura',
  'Todo de Ti',
  'China',
  'Otro Trago',
  'Sin Pijama',
  'Propuesta Indecente',
  'Pepas',
  'Vivir Mi Vida',
  'Bailando',
  'Darte un Beso',
  'Livin\' la Vida Loca'
];

// Album covers for Latin artists
const albumCovers = [
  'https://i.scdn.co/image/ab67616d0000b2739416ed64daf84936d89e671c', // Un Verano Sin Ti
  'https://i.scdn.co/image/ab67616d0000b273a543f68c31b395bb46d6f8c0', // KG0516
  'https://i.scdn.co/image/ab67616d0000b273fc2101e6c215cc5d3a45c0c4', // Colores
  'https://i.scdn.co/image/ab67616d0000b273a9e6784e5d6ad8a4c983d31e', // El Dorado
  'https://i.scdn.co/image/ab67616d0000b273ef0d4234e1a645740f77d59c', // Legendaddy
  'https://i.scdn.co/image/ab67616d0000b2738b752d1f529a8e7a3a328c0a'  // 11:11
];

/**
 * Generates simulated metadata for a radio station
 * @returns Object containing a formatted track string and RadioMetadata object
 */
export const generateSimulatedMetadata = (): { 
  trackString: string; 
  metadata: RadioMetadata;
} => {
  // Get random artist and song
  const artistIndex = Math.floor(Math.random() * latinArtists.length);
  const songIndex = Math.floor(Math.random() * latinSongs.length);
  
  const artist = latinArtists[artistIndex];
  const title = latinSongs[songIndex];
  
  // Get random album cover
  const coverIndex = Math.floor(Math.random() * albumCovers.length);
  const coverArt = albumCovers[coverIndex];
  
  // Create track string and metadata object
  const trackString = `${artist} - ${title}`;
  const metadata: RadioMetadata = {
    artist,
    title,
    album: 'Latin Mix Masters Radio',
    coverArt,
    startedAt: new Date(),
    duration: Math.floor(Math.random() * 180) + 120 // Random duration between 2-5 minutes
  };
  
  return { trackString, metadata };
};
