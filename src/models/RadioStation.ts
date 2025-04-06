
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
  chatEnabled?: boolean;
  broadcastTime?: string;
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
  timestamp: number; // Making timestamp required with a type
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
  stationId?: string;
}

// Add BookingSlot interface
export interface BookingSlot {
  id: string;
  stationId: string;
  userId: string;
  hostName: string;
  stationName: string; // Added the missing stationName property
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  approved?: boolean;
  rejected?: boolean;
  rejectionReason?: string;
}

// Add AudioState interface
export interface AudioState {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentTrack: string | null;
  currentStation: string | null;
  hasError: boolean;
  errorMessage: string | null;
}

// Add FileUpload interface
export interface FileUpload {
  file: File;
  dataUrl: string;
}
