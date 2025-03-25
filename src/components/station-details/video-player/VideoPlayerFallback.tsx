
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
      // For known problematic URLs like the lmmappstore one, use a direct embed approach
      if (streamUrl.includes('lmmappstore.com')) {
        iframeRef.current.src = streamUrl;
      } else {
        // For other URLs, use the Castr player which has better HLS support
        iframeRef.current.src = `https://player.castr.io/live?source=${encodeURIComponent(streamUrl)}`;
      }
    }
  }, [isVisible, streamUrl]);
  
  if (!streamUrl) {
    return null;
  }
  
  // Select the appropriate source based on the URL
  const iframeSrc = streamUrl.includes('lmmappstore.com') 
    ? streamUrl 
    : `https://player.castr.io/live?source=${encodeURIComponent(streamUrl)}`;
  
  return (
    <iframe
      ref={iframeRef}
      src={iframeSrc}
      className="w-full h-full absolute inset-0 z-20"
      allow="autoplay; fullscreen"
      allowFullScreen
    ></iframe>
  );
};

export default VideoPlayerFallback;
