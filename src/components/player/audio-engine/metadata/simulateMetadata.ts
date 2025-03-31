
import { RadioMetadata } from '@/models/RadioStation';

interface TrackSimulation {
  artist: string;
  title: string;
  album?: string;
  coverArt?: string;
}

// Sample tracks for simulation
const sampleTracks: TrackSimulation[] = [
  {
    artist: "Marc Anthony",
    title: "Vivir Mi Vida",
    album: "3.0",
    coverArt: "https://example.com/images/marcanthony.jpg"
  },
  {
    artist: "Bad Bunny",
    title: "Callaíta",
    album: "X 100PRE",
    coverArt: "https://example.com/images/badbunny.jpg"
  },
  {
    artist: "Daddy Yankee",
    title: "Gasolina",
    album: "Barrio Fino",
    coverArt: "https://example.com/images/daddyyankee.jpg"
  },
  {
    artist: "Shakira",
    title: "Hips Don't Lie",
    album: "Oral Fixation Vol. 2",
    coverArt: "https://example.com/images/shakira.jpg"
  },
  {
    artist: "J Balvin",
    title: "Mi Gente",
    album: "Vibras",
    coverArt: "https://example.com/images/jbalvin.jpg"
  },
  {
    artist: "Ozuna",
    title: "Taki Taki",
    album: "Aura",
    coverArt: "https://example.com/images/ozuna.jpg"
  },
  {
    artist: "Enrique Iglesias",
    title: "Bailando",
    album: "Sex and Love",
    coverArt: "https://example.com/images/enrique.jpg"
  },
  {
    artist: "Maluma",
    title: "Felices los 4",
    album: "F.A.M.E.",
    coverArt: "https://example.com/images/maluma.jpg"
  },
  {
    artist: "Karol G",
    title: "Tusa",
    album: "KG0516",
    coverArt: "https://example.com/images/karolg.jpg"
  },
  {
    artist: "Nicky Jam",
    title: "El Amante",
    album: "Fénix",
    coverArt: "https://example.com/images/nickyjam.jpg"
  }
];

const bachataArtists = ["Romeo Santos", "Prince Royce", "Juan Luis Guerra", "Aventura", "Monchy & Alexandra"];
const reggaetonArtists = ["Bad Bunny", "J Balvin", "Daddy Yankee", "Ozuna", "Anuel AA"];
const salsaArtists = ["Marc Anthony", "Héctor Lavoe", "Celia Cruz", "Willie Colón", "El Gran Combo"];

// A table of genre-specific data we can use for different stations
const genreSpecificData: Record<string, TrackSimulation[]> = {
  "Bachata": bachataArtists.map(artist => ({
    artist,
    title: `Bachata Mix ${Math.floor(Math.random() * 100)}`,
    album: "Bachata Hits",
    coverArt: `https://example.com/images/bachata${Math.floor(Math.random() * 5)}.jpg`
  })),
  "Reggaeton": reggaetonArtists.map(artist => ({
    artist,
    title: `Reggaeton Mix ${Math.floor(Math.random() * 100)}`,
    album: "Reggaeton Hits",
    coverArt: `https://example.com/images/reggaeton${Math.floor(Math.random() * 5)}.jpg`
  })),
  "Salsa": salsaArtists.map(artist => ({
    artist,
    title: `Salsa Mix ${Math.floor(Math.random() * 100)}`,
    album: "Salsa Hits",
    coverArt: `https://example.com/images/salsa${Math.floor(Math.random() * 5)}.jpg`
  }))
};

/**
 * Simulates metadata from a stream for testing purposes
 * @param stationId The ID of the station
 * @returns Simulated metadata
 */
export const simulateMetadata = (stationId: string): RadioMetadata => {
  // Select a random track based on the stationId if possible
  let selectedTrack: TrackSimulation;
  
  // Try to match by station ID
  if (stationId.includes("bachata")) {
    const tracks = genreSpecificData["Bachata"] || sampleTracks;
    selectedTrack = tracks[Math.floor(Math.random() * tracks.length)];
  } else if (stationId.includes("reggaeton")) {
    const tracks = genreSpecificData["Reggaeton"] || sampleTracks;
    selectedTrack = tracks[Math.floor(Math.random() * tracks.length)];
  } else if (stationId.includes("salsa")) {
    const tracks = genreSpecificData["Salsa"] || sampleTracks;
    selectedTrack = tracks[Math.floor(Math.random() * tracks.length)];
  } else {
    // Default to random track
    selectedTrack = sampleTracks[Math.floor(Math.random() * sampleTracks.length)];
  }
  
  // Create metadata with required timestamp
  const metadata: RadioMetadata = {
    artist: selectedTrack.artist,
    title: selectedTrack.title,
    album: selectedTrack.album,
    coverArt: selectedTrack.coverArt,
    timestamp: Date.now()
  };
  
  return metadata;
};
