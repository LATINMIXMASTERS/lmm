
export interface StreamDetails {
  url: string;
  port: string;
  password: string;
}

export interface RadioStation {
  id: string;
  name: string;
  genre: string;
  image: string;
  description: string;
  listeners: number;
  isLive: boolean;
  currentDJ?: string;
  streamDetails?: StreamDetails;
  streamUrl?: string;
}

export interface BookingSlot {
  id: string;
  stationId: string;
  hostId: string;
  hostName: string;
  startTime: Date;
  endTime: Date;
  title: string;
  approved: boolean;
  rejected?: boolean;
  rejectionReason?: string;
}

