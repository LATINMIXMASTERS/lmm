export interface RadioStation {
  id: string;
  name: string;
  genre: string;
  image: string;
  description?: string;
  listeners?: number;
  isLive?: boolean;
  chatEnabled?: boolean;
  streamDetails?: {
    url: string;
    port: string;
    password: string;
  };
  streamUrl?: string;
  videoStreamUrl?: string;
  currentMetadata?: RadioMetadata;
  s3Image?: string;
  hosts?: string[];
  broadcastTime?: string;
}

export interface RadioMetadata {
  title: string;       // Current track title
  artist: string;      // Current track artist
  album?: string;      // Optional album name
  coverArt?: string;   // Cover art URL if available
  startedAt?: Date;    // When the track started playing
  duration?: number;   // Track duration in seconds if available
}

export interface BookingSlot {
  id: string;
  stationId: string;
  hostId: string;
  hostName: string;
  startTime: string | Date;
  endTime: string | Date;
  title: string;
  approved: boolean;
  rejected?: boolean;
  rejectionReason?: string;
}

export interface ChatMessage {
  id: string;
  stationId: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string | Date;
}

export interface FileUpload {
  file: File;
  dataUrl: string;
}

export interface AudioState {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentTrack: string | null;
  currentStation: string | null;
  currentMetadata?: RadioMetadata;
}

export interface ProfileUpdate {
  profileImage?: string;
  biography?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    soundcloud?: string;
    youtube?: string;
  };
}

export interface S3StorageConfig {
  bucketName: string;
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  endpoint?: string;
  publicUrlBase?: string;
  secretKey?: string;
}

export interface S3FileReference {
  key: string;
  bucketName: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  publicUrl: string;
  uploadedAt: Date;
  metadata?: {
    [key: string]: string;
  };
}

export interface TrackStorageInfo extends S3FileReference {
  duration?: number;
  waveformData?: number[];
  transcoded?: boolean;
  transcodedFormats?: string[];
}
