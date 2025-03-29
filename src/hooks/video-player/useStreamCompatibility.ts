
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useStreamCompatibility(streamUrl: string) {
  const [shouldUseFallback, setShouldUseFallback] = useState(false);
  const { toast } = useToast();

  // Check for known problematic stream formats
  useEffect(() => {
    if (streamUrl) {
      // Known problematic URL patterns that need special handling
      const problematicPatterns = ['.m3u8'];
      
      // Check if URL matches any problematic patterns and we're on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const needsSpecialHandling = problematicPatterns.some(pattern => 
        streamUrl.toLowerCase().includes(pattern)
      ) && isMobile;
      
      if (needsSpecialHandling) {
        console.log("Stream URL may require special handling:", streamUrl);
        setShouldUseFallback(true);
      }
    }
  }, [streamUrl]);

  const showFallbackPlayerToast = (errorMessage: string) => {
    toast({
      title: "Switching to Compatible Player",
      description: errorMessage,
      variant: "default"
    });
  };

  return {
    shouldUseFallback,
    setShouldUseFallback,
    showFallbackPlayerToast
  };
}
