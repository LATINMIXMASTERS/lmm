
export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  genre: string;
  coverImage: string;
  audioFile: string;
  fileSize: number;
  uploadDate: string;
  uploadedBy: string;
  likes: number;
  duration?: number; // Duration in seconds
  waveformData?: number[]; // Array of amplitude data for waveform display
  comments?: Comment[];
  playCount?: number; // Track play count
  description?: string; // Add description field
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  date: string;
}

export interface Genre {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  trackCount?: number; // Adding trackCount property
}
