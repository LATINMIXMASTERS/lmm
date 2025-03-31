
export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  genre: string;
  coverImage: string;
  audioFile: string;
  audioUrl?: string;
  fileSize: number;
  uploadedBy: string;
  uploadDate: string;
  likes: number;
  comments?: Comment[];
  waveformData?: number[];
  description?: string;
  duration?: number;
  playCount?: number;
  plays?: number;
}

export interface Genre {
  id: string;
  name: string;
  count: number;
  createdBy?: string;
  createdAt?: string;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  date: string;
  userAvatar?: string;
}
