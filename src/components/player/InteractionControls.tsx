
import React, { useState } from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTrackSharing } from '@/hooks/track/useTrackSharing';
import { useTrack } from '@/hooks/useTrackContext';
import { Track } from '@/models/Track';

interface InteractionControlsProps {
  handleLike: () => void;
  handleShare: () => void;
  setShowComments: (value: boolean) => void;
  isLiked: boolean;
  showComments: boolean;
}

const InteractionControls: React.FC<InteractionControlsProps> = ({
  handleLike,
  handleShare,
  setShowComments,
  isLiked,
  showComments
}) => {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const { shareToWhatsApp, shareToFacebook, shareViaSMS, copyShareUrl } = useTrackSharing();
  const { tracks, currentPlayingTrack, getTrackById } = useTrack();
  
  // Custom share handler function that opens a share drawer
  const onShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // First, call the original handleShare to show the toast
    handleShare();
    
    // Then, show our custom sharing options UI directly in the component
    setShowShareOptions(true);
    
    // Optional: Get the current track to provide more context to sharing methods
    const currentTrack = currentPlayingTrack && getTrackById 
      ? getTrackById(currentPlayingTrack) 
      : null;
      
    if (!currentTrack) return;
    
    // Generate share URL
    const shareUrl = `${window.location.origin}/mixes?track=${currentTrack.id}`;
    
    // You could use this info to customize the sharing experience
    console.log("Sharing track:", currentTrack.title, "with URL:", shareUrl);
  };
  
  return (
    <div className="relative">
      <div className="flex items-center space-x-4">
        <button 
          onClick={handleLike}
          className={cn(
            "transition-colors duration-300",
            isLiked ? "text-red-500" : "text-gray hover:text-red-500"
          )}
          aria-label={isLiked ? "Already liked" : "Like track"}
        >
          <Heart className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} />
        </button>
        
        <button
          onClick={() => setShowComments(!showComments)}
          className={cn(
            "transition-colors duration-300",
            showComments ? "text-blue" : "text-gray hover:text-blue"
          )}
          aria-label="Show comments"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
        
        <button
          onClick={onShare}
          className={cn(
            "text-gray hover:text-blue transition-colors duration-300",
            showShareOptions ? "text-blue" : ""
          )}
          aria-label="Share track"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>
      
      {/* Share options drawer/popup */}
      {showShareOptions && (
        <div className="absolute bottom-10 right-0 z-50 bg-white dark:bg-gray-900 shadow-lg rounded-lg p-3 min-w-[200px]">
          <div className="flex flex-col space-y-2">
            <button 
              onClick={() => {
                const currentTrack = currentPlayingTrack && getTrackById 
                  ? getTrackById(currentPlayingTrack) 
                  : null;
                if (currentTrack) {
                  const shareUrl = `${window.location.origin}/mixes?track=${currentTrack.id}`;
                  shareToWhatsApp(currentTrack, shareUrl);
                }
                setShowShareOptions(false);
              }}
              className="flex items-center px-3 py-2 rounded bg-green-500 hover:bg-green-600 text-white text-sm"
            >
              <span>WhatsApp</span>
            </button>
            
            <button 
              onClick={() => {
                const currentTrack = currentPlayingTrack && getTrackById 
                  ? getTrackById(currentPlayingTrack) 
                  : null;
                if (currentTrack) {
                  const shareUrl = `${window.location.origin}/mixes?track=${currentTrack.id}`;
                  shareToFacebook(shareUrl);
                }
                setShowShareOptions(false);
              }}
              className="flex items-center px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              <span>Facebook</span>
            </button>
            
            <button 
              onClick={() => {
                const currentTrack = currentPlayingTrack && getTrackById 
                  ? getTrackById(currentPlayingTrack) 
                  : null;
                if (currentTrack) {
                  const shareUrl = `${window.location.origin}/mixes?track=${currentTrack.id}`;
                  shareViaSMS(currentTrack, shareUrl);
                }
                setShowShareOptions(false);
              }}
              className="flex items-center px-3 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white text-sm"
            >
              <span>SMS</span>
            </button>
            
            <button 
              onClick={() => {
                const currentTrack = currentPlayingTrack && getTrackById 
                  ? getTrackById(currentPlayingTrack) 
                  : null;
                if (currentTrack) {
                  const shareUrl = `${window.location.origin}/mixes?track=${currentTrack.id}`;
                  copyShareUrl(shareUrl);
                }
                setShowShareOptions(false);
              }}
              className="flex items-center px-3 py-2 rounded bg-gray-700 hover:bg-gray-800 text-white text-sm"
            >
              <span>Copy Link</span>
            </button>
            
            <button 
              onClick={() => setShowShareOptions(false)}
              className="flex items-center px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm"
            >
              <span>Close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractionControls;
