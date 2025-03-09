
export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string; // Added to store the actual user ID
  genre: string;
  coverImage: string;
  audioFile: string;
  fileSize: number; // Size in bytes
  uploadDate: string;
  uploadedBy: string;
  likes: number;
  comments?: Comment[];
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
}
