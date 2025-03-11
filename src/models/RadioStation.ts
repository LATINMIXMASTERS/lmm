
export interface RadioStation {
  id: string;
  name: string;
  genre: string;
  description: string;
  image: string;
  listeners: number;
  broadcastTime?: string;
  hosts?: string[];
  streamDetails?: {
    url: string;
    port: string;
    password: string;
  };
}
