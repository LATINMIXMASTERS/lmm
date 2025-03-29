
import React, { useRef, useEffect } from 'react';
import Hls from 'hls.js';

interface VideoPlayerFallbackProps {
  streamUrl: string;
  isVisible: boolean;
}

const VideoPlayerFallback: React.FC<VideoPlayerFallbackProps> = ({ 
  streamUrl,
  isVisible
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  // More reliable method to determine correct player type
  const getPlayerType = () => {
    // Check if it's a known domain that needs iframe
    if (streamUrl.includes('lmmappstore.com')) {
      return 'iframe';
    }
    
    // For m3u8 streams
    if (streamUrl.endsWith('.m3u8')) {
      // On iOS, use native player
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        return 'native';
      }
      
      // On Android, use JW Player iframe
      if (/Android/i.test(navigator.userAgent)) {
        return 'jwplayer';
      }
      
      // On desktop, try HLS.js if supported
      return Hls.isSupported() ? 'hlsjs' : 'jwplayer';
    }
    
    // Default to native player for MP4, etc.
    return 'native';
  };
  
  useEffect(() => {
    if (!isVisible || !streamUrl) return;
    
    console.log("Setting up fallback player for URL:", streamUrl);
    const playerType = getPlayerType();
    console.log("Selected player type:", playerType);
    
    // Clean up any existing instances
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    
    switch (playerType) {
      case 'iframe':
        if (iframeRef.current) {
          // Use specialized player for problematic URLs
          const encodedUrl = encodeURIComponent(streamUrl);
          iframeRef.current.src = `https://player.castr.io/live?source=${encodedUrl}`;
        }
        break;
        
      case 'jwplayer':
        if (iframeRef.current) {
          // JW Player handles m3u8 well across platforms
          const encodedUrl = encodeURIComponent(streamUrl);
          iframeRef.current.src = `https://cdn.jwplayer.com/players/VhcUJrxZ-J9kX1Y8O.html?videoURL=${encodedUrl}`;
        }
        break;
        
      case 'hlsjs':
        if (videoRef.current && Hls.isSupported()) {
          try {
            const hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
              fragLoadingMaxRetry: 5,
              manifestLoadingMaxRetry: 5,
              levelLoadingMaxRetry: 5
            });
            
            hlsRef.current = hls;
            hls.loadSource(streamUrl);
            hls.attachMedia(videoRef.current);
            
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              console.log("HLS manifest parsed, starting playback");
              videoRef.current?.play().catch(e => {
                console.error("Error auto-playing video:", e);
              });
            });
            
            hls.on(Hls.Events.ERROR, (event, data) => {
              console.error("HLS error:", data);
              if (data.fatal) {
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    console.log("Fatal network error, trying to recover");
                    hls.startLoad();
                    break;
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    console.log("Fatal media error, trying to recover");
                    hls.recoverMediaError();
                    break;
                  default:
                    console.log("Fatal error, cannot recover");
                    hls.destroy();
                    // Switch to JW Player as last resort
                    if (iframeRef.current) {
                      const encodedUrl = encodeURIComponent(streamUrl);
                      iframeRef.current.src = `https://cdn.jwplayer.com/players/VhcUJrxZ-J9kX1Y8O.html?videoURL=${encodedUrl}`;
                    }
                    break;
                }
              }
            });
          } catch (error) {
            console.error("Error initializing HLS:", error);
            // Switch to JW Player as fallback
            if (iframeRef.current) {
              const encodedUrl = encodeURIComponent(streamUrl);
              iframeRef.current.src = `https://cdn.jwplayer.com/players/VhcUJrxZ-J9kX1Y8O.html?videoURL=${encodedUrl}`;
            }
          }
        }
        break;
        
      case 'native':
        if (videoRef.current) {
          videoRef.current.src = streamUrl;
          videoRef.current.play().catch(e => {
            console.error("Error playing video:", e);
          });
        }
        break;
    }
    
    return () => {
      if (hlsRef.current) {
        console.log("Destroying HLS instance");
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [isVisible, streamUrl]);
  
  if (!streamUrl) {
    return null;
  }
  
  const playerType = getPlayerType();
  
  return (
    <div className="w-full h-full absolute inset-0 z-20 bg-black">
      {/* For HLS.js or native playback */}
      {(playerType === 'hlsjs' || playerType === 'native') && (
        <video
          ref={videoRef}
          className="w-full h-full"
          controls
          playsInline
          autoPlay
        />
      )}
      
      {/* For iframe-based players */}
      {(playerType === 'iframe' || playerType === 'jwplayer') && (
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          src=""
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          title="Video Stream Player"
          sandbox="allow-same-origin allow-scripts allow-forms allow-presentation"
        ></iframe>
      )}
    </div>
  );
};

export default VideoPlayerFallback;
