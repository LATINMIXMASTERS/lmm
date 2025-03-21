
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
