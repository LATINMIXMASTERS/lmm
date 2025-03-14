
export interface RadioStation {
  id: string;
  name: string;
  genre: string;
  description: string;
  image: string;
  listeners: number;
  isLive?: boolean;
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

export interface FileUpload {
  file: File;
  dataUrl: string;
}
