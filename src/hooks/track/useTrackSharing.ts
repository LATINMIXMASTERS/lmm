
import { useTrack } from '@/hooks/useTrackContext';
import { Track } from '@/models/Track';

/**
 * Custom hook for track sharing functionality
 * Provides handlers for sharing tracks to multiple platforms
 */
export const useTrackSharing = () => {
  const { shareTrack } = useTrack();

  /**
   * Handles sharing a track with the Web Share API if available,
   * or falls back to specific platform sharing
   * @param trackId - ID of the track to share
   * @param e - Mouse event (used to stop event propagation)
   */
  const handleShareTrack = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    shareTrack(trackId);
  };

  /**
   * Shares a track to WhatsApp
   * @param track - The track to share
   * @param shareUrl - The URL to share
   */
  const shareToWhatsApp = (track: Track, shareUrl: string) => {
    const text = encodeURIComponent(`Check out this awesome mix on Latin Mix Masters: ${track.artist} - ${track.title}\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  /**
   * Shares a track to Facebook
   * @param shareUrl - The URL to share
   */
  const shareToFacebook = (shareUrl: string) => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
  };

  /**
   * Shares a track via SMS text message
   * @param track - The track to share
   * @param shareUrl - The URL to share
   */
  const shareViaSMS = (track: Track, shareUrl: string) => {
    const text = encodeURIComponent(`Check out this awesome mix on Latin Mix Masters: ${track.artist} - ${track.title}\n${shareUrl}`);
    window.open(`sms:?&body=${text}`, '_blank');
  };

  return {
    handleShareTrack,
    shareToWhatsApp,
    shareToFacebook,
    shareViaSMS
  };
};
