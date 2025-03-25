
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
      console.log("Setting up fallback player for URL:", streamUrl);
      
      // For .m3u8 streams from lmmappstore.com, use direct embed with HLS.js player
      if (streamUrl.includes('lmmappstore.com') || streamUrl.endsWith('.m3u8')) {
        // Use a special player that can handle m3u8 streams directly
        const hlsPlayerUrl = `https://player.castr.io/live?source=${encodeURIComponent(streamUrl)}`;
        console.log("Using HLS player URL:", hlsPlayerUrl);
        iframeRef.current.src = hlsPlayerUrl;
      } else {
        // For other URLs, use a direct embed
        iframeRef.current.src = streamUrl;
      }
    }
  }, [isVisible, streamUrl]);
  
  if (!streamUrl) {
    return null;
  }
  
  // Add additional CSS to ensure full compatibility
  return (
    <div className="w-full h-full absolute inset-0 z-20 bg-black">
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        src=""
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        allowFullScreen
        title="Video Stream Player"
        sandbox="allow-same-origin allow-scripts allow-forms allow-presentation"
      ></iframe>
    </div>
  );
};

export default VideoPlayerFallback;
