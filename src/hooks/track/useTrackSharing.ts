
import { useTrack } from '@/hooks/useTrackContext';
import { Track } from '@/models/Track';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard } from '@/utils/trackUtils';

/**
 * Custom hook for track sharing functionality
 * Provides handlers for sharing tracks to multiple platforms
 */
export const useTrackSharing = () => {
  const { shareTrack } = useTrack();
  const { toast } = useToast();

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

  /**
   * Displays a custom sharing dialog with various sharing options
   * @param track - The track to share
   */
  const showSharingOptions = (track: Track) => {
    // Generate the share URL
    const shareUrl = `${window.location.origin}/mixes?track=${track.id}`;
    
    // Show sharing options using toast
    toast({
      title: "Share this track",
      description: `${track.artist} - ${track.title}`,
      action: (
        <div className="flex space-x-2 mt-2">
          <button 
            onClick={() => shareToWhatsApp(track, shareUrl)}
            className="px-3 py-1 rounded bg-green-500 hover:bg-green-600 text-white text-xs"
          >
            WhatsApp
          </button>
          <button 
            onClick={() => shareToFacebook(shareUrl)}
            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs"
          >
            Facebook
          </button>
          <button 
            onClick={() => shareViaSMS(track, shareUrl)}
            className="px-3 py-1 rounded bg-gray-500 hover:bg-gray-600 text-white text-xs"
          >
            SMS
          </button>
          <button 
            onClick={() => {
              copyToClipboard(shareUrl)
                .then(() => {
                  toast({
                    title: "Link copied!",
                    description: "Share link copied to clipboard",
                  });
                })
                .catch(() => {
                  toast({
                    title: "Failed to copy",
                    description: "Could not copy the link to clipboard",
                    variant: "destructive"
                  });
                });
            }}
            className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-800 text-white text-xs"
          >
            Copy
          </button>
        </div>
      ),
    });
  };

  return {
    handleShareTrack,
    shareToWhatsApp,
    shareToFacebook,
    shareViaSMS,
    showSharingOptions
  };
};
