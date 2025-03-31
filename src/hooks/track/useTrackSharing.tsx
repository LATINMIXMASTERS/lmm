
import { useTrack } from '@/hooks/useTrackContext';
import { Track } from '@/models/Track';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard } from '@/utils/trackUtils';
import { ToastAction } from '@/components/ui/toast';

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
    const text = encodeURIComponent(`Check out this awesome mix on LMM: ${track.artist} - ${track.title}\n${shareUrl}`);
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
    const text = encodeURIComponent(`Check out this awesome mix on LMM: ${track.artist} - ${track.title}\n${shareUrl}`);
    window.open(`sms:?&body=${text}`, '_blank');
  };

  /**
   * Copies the sharing URL to clipboard
   * @param shareUrl - The URL to copy
   */
  const copyShareUrl = (shareUrl: string) => {
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
  };

  /**
   * Displays a custom sharing dialog with various sharing options
   * @param track - The track to share
   */
  const showSharingOptions = (track: Track) => {
    // Generate the share URL with artist name and track title for better SEO
    const artistSlug = track.artist.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    const titleSlug = track.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    const shareUrl = `${window.location.origin}/mixes/${artistSlug}/${titleSlug}`;
    
    // Show toast notification with proper JSX for the action
    toast({
      title: "Share this track",
      description: `${track.artist} - ${track.title}`,
      action: <ToastAction altText="Open sharing options" onClick={() => console.log("Opening sharing options")}>Share Options</ToastAction>,
    });
    
    // Return the shareUrl and sharing methods so they can be used by the caller
    return {
      shareUrl,
      shareToWhatsApp: () => shareToWhatsApp(track, shareUrl),
      shareToFacebook: () => shareToFacebook(shareUrl),
      shareViaSMS: () => shareViaSMS(track, shareUrl),
      copyShareUrl: () => copyShareUrl(shareUrl)
    };
  };

  return {
    handleShareTrack,
    shareToWhatsApp,
    shareToFacebook,
    shareViaSMS,
    copyShareUrl,
    showSharingOptions
  };
};
