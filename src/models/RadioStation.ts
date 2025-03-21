export interface RadioStation {
  id: string;
  name: string;
  genre: string;
  description: string;
  image: string;
  listeners: number;
  isLive?: boolean;
  chatEnabled?: boolean;
  streamUrl?: string;
  broadcastTime?: string;
  hosts?: string[];
  streamDetails?: {
    url: string;
    port: string;
    password: string;
  };
  s3Image?: string; // S3 storage URL for station image
  currentMetadata?: RadioMetadata; // Current track metadata
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
  currentMetadata?: RadioMetadata; // Added metadata field
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
  endpoint?: string;
  publicUrlBase?: string;
}

export interface S3FileReference {
  key: string;          // S3 object key
  bucketName: string;   // Bucket name
  fileName: string;     // Original file name
  fileType: string;     // MIME type
  fileSize: number;     // File size in bytes
  publicUrl: string;    // Public accessible URL
  uploadedAt: Date;     // Upload timestamp
  metadata?: {          // Additional metadata
    [key: string]: string;
  };
}

// Track storage info specifically for audio files
export interface TrackStorageInfo extends S3FileReference {
  duration?: number;    // Track duration in seconds
  waveformData?: number[]; // Processed waveform data
  transcoded?: boolean; // Whether the file has been transcoded
  transcodedFormats?: string[]; // Available transcoded formats
}
