
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
  plays?: number; // Add plays property for compatibility
  description?: string; // Add description field
  
  // For compatibility - alias to audioFile
  get audioUrl(): string {
    return this.audioFile;
  }
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
