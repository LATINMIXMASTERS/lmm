
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
  
  // Use either HLS.js or iframe based on browser capabilities and URL type
  const shouldUseIframe = () => {
    // Always use iframe for these domains
    if (streamUrl.includes('lmmappstore.com')) return true;
    
    // For other HLS streams, try HLS.js if supported
    if (streamUrl.endsWith('.m3u8') && !Hls.isSupported()) {
      console.log("HLS.js not supported, falling back to iframe");
      return true;
    }
    
    return false;
  };
  
  useEffect(() => {
    if (!isVisible || !streamUrl) return;
    
    console.log("Setting up fallback player for URL:", streamUrl);
    
    // Decide whether to use iframe or HLS.js
    if (shouldUseIframe()) {
      if (iframeRef.current) {
        // Use a special player that can handle m3u8 streams directly
        const hlsPlayerUrl = `https://player.castr.io/live?source=${encodeURIComponent(streamUrl)}`;
        console.log("Using iframe HLS player URL:", hlsPlayerUrl);
        iframeRef.current.src = hlsPlayerUrl;
      }
    } else if (streamUrl.endsWith('.m3u8') && videoRef.current) {
      console.log("Using HLS.js for playback");
      
      // Clean up any existing HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      
      try {
        // Create a new HLS instance
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          fragLoadingMaxRetry: 5,
          manifestLoadingMaxRetry: 5,
          levelLoadingMaxRetry: 5
        });
        
        hlsRef.current = hls;
        
        // Bind HLS to the video element
        hls.loadSource(streamUrl);
        hls.attachMedia(videoRef.current);
        
        // Start playing when media is loaded
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("HLS manifest parsed, starting playback");
          videoRef.current?.play().catch(e => {
            console.error("Error auto-playing video:", e);
          });
        });
        
        // Error handling
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
                break;
            }
          }
        });
      } catch (error) {
        console.error("Error initializing HLS:", error);
      }
    } else if (videoRef.current) {
      // For other formats, use native video playback
      videoRef.current.src = streamUrl;
      videoRef.current.play().catch(e => {
        console.error("Error playing video:", e);
      });
    }
    
    // Cleanup function
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
  
  return (
    <div className="w-full h-full absolute inset-0 z-20 bg-black">
      {/* For HLS.js playback */}
      {streamUrl.endsWith('.m3u8') && !shouldUseIframe() && (
        <video
          ref={videoRef}
          className="w-full h-full"
          controls
          playsInline
          autoPlay
        />
      )}
      
      {/* For iframe-based playback */}
      {shouldUseIframe() && (
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
      
      {/* For direct video playback of non-HLS formats */}
      {!streamUrl.endsWith('.m3u8') && !shouldUseIframe() && (
        <video
          ref={videoRef}
          className="w-full h-full"
          controls
          playsInline
          autoPlay
        />
      )}
    </div>
  );
};

export default VideoPlayerFallback;
