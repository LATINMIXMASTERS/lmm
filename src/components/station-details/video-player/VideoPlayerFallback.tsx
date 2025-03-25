
import React, { useRef, useEffect } from 'react';

interface VideoPlayerFallbackProps {
  streamUrl: string;
  isVisible: boolean;
}

const VideoPlayerFallback: React.FC<VideoPlayerFallbackProps> = ({ 
  streamUrl,
  isVisible
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  useEffect(() => {
    if (isVisible && streamUrl && iframeRef.current) {
      iframeRef.current.src = `https://player.castr.io/live?source=${encodeURIComponent(streamUrl)}`;
    }
  }, [isVisible, streamUrl]);
  
  if (!streamUrl) {
    return null;
  }
  
  return (
    <iframe
      ref={iframeRef}
      src={`https://player.castr.io/live?source=${encodeURIComponent(streamUrl)}`}
      className="w-full h-full absolute inset-0 z-20"
      allow="autoplay; fullscreen"
      allowFullScreen
    ></iframe>
  );
};

export default VideoPlayerFallback;
