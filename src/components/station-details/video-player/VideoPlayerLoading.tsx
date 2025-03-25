
import React from 'react';
import { Spinner } from '@/components/ui/spinner';

interface VideoPlayerLoadingProps {
  message?: string;
}

const VideoPlayerLoading: React.FC<VideoPlayerLoadingProps> = ({ 
  message = 'Loading video stream...' 
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
      <div className="text-center">
        <Spinner className="mx-auto mb-2" />
        <p className="text-white text-sm">{message}</p>
      </div>
    </div>
  );
};

export default VideoPlayerLoading;
