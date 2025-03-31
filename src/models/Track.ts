export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  genre: string;
  coverImage: string;
  audioFile: string;
  audioUrl?: string; // Added as optional
  fileSize: number;
  uploadedBy: string;
  uploadDate: string;
  likes: number;
  comments?: Comment[];
  waveformData?: number[];
}

export interface Genre {
  id: string;
  name: string;
  count: number;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  date: string;
  userAvatar?: string;
}
