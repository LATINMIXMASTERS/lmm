
export interface RadioStation {
  id: string;
  name: string;
  genre: string;
  description: string;
  image: string;
  streamUrl: string;
  isLive: boolean;
  listeners: number;
  hosts: Host[];
  currentMetadata?: RadioMetadata;
  streamDetails?: StreamDetails;
  videoStreamUrl?: string;
  s3Image?: string;
}

export interface Host {
  id: string;
  name: string;
  role: string;
  image?: string;
}

export interface StreamDetails {
  url: string;
  port: string;
  password: string;
}

export interface RadioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  coverArt?: string;
  genre?: string;
  year?: string;
  timestamp?: number; // Adding timestamp field for tracking updates
}

export interface UpcomingShow {
  id: string;
  title: string;
  host: string;
  hostId: string;
  startTime: string;
  endTime: string;
  description?: string;
  image?: string;
}

export interface StationChat {
  messages: ChatMessage[];
  isConnected: boolean;
  lastSync?: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
  userRole?: string;
  userAvatar?: string;
}
