
import React from 'react';

interface VideoPlayerEmptyStateProps {
  embedded?: boolean;
}

const VideoPlayerEmptyState: React.FC<VideoPlayerEmptyStateProps> = ({ embedded = false }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
      <div className="text-center p-4">
        <p className="text-white mb-2">No video stream URL configured</p>
        <p className="text-gray-400 text-sm">
          {embedded 
            ? 'Set a stream URL in the broadcast controls section above' 
            : 'Radio hosts can add a stream URL in the host dashboard'}
        </p>
      </div>
    </div>
  );
};

export default VideoPlayerEmptyState;
