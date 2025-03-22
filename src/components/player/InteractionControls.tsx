
import React from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  return (
    <div className="flex items-center space-x-4">
      <button 
        onClick={handleLike}
        className={cn(
          "transition-colors duration-300",
          isLiked ? "text-red-500" : "text-gray hover:text-red-500"
        )}
        aria-label={isLiked ? "Already liked" : "Like track"}
        disabled={isLiked}
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
        onClick={handleShare}
        className="text-gray hover:text-blue transition-colors duration-300"
        aria-label="Share track"
      >
        <Share2 className="w-5 h-5" />
      </button>
    </div>
  );
};

export default InteractionControls;
