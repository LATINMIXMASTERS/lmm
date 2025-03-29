
import { RadioStation, BookingSlot, ChatMessage } from '@/models/RadioStation';

export interface StationDetailsState {
  station: RadioStation | null;
  stationBookings: BookingSlot[];
  showVideoPlayer: boolean;
  lastSyncTime: Date;
  loadingState: {
    isLoading: boolean;
    hasError: boolean;
    errorMessage: string;
  };
  setShowVideoPlayer: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface StationDetailsActions {
  handlePlayToggle: () => void;
  handleBookShow: () => void;
  handleToggleLiveStatus: () => void;
  handleToggleChat: () => void;
  handleToggleVideo: () => void;
  handleUpdateVideoStreamUrl: (url: string) => void;
  handleSendMessage: (message: string) => void;
  setShowVideoPlayer: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface StationDetailsResult extends StationDetailsState, StationDetailsActions {
  isPlaying: boolean;
  isPrivilegedUser: boolean;
  chatMessages: ChatMessage[];
}
