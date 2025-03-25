
import React from 'react';

interface VideoPlayerElementProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  streamUrl: string;
  onTimeUpdate: () => void;
  onDurationChange: () => void;
  onLoadStart: () => void;
  onCanPlay: () => void;
  onError: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
}

const VideoPlayerElement: React.FC<VideoPlayerElementProps> = ({
  videoRef,
  streamUrl,
  onTimeUpdate,
  onDurationChange,
  onLoadStart,
  onCanPlay,
  onError
}) => {
  return (
    <video 
      ref={videoRef}
      className="w-full h-full"
      src={streamUrl}
      playsInline
      onTimeUpdate={onTimeUpdate}
      onDurationChange={onDurationChange}
      onLoadStart={onLoadStart}
      onCanPlay={onCanPlay}
      onError={onError}
    >
      Your browser does not support HTML5 video.
    </video>
  );
};

export default VideoPlayerElement;
