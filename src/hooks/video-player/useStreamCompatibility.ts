
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useStreamCompatibility(streamUrl: string) {
  const [shouldUseFallback, setShouldUseFallback] = useState(false);
  const { toast } = useToast();

  // Check for known problematic stream formats
  useEffect(() => {
    if (streamUrl) {
      // Known problematic domains or URL patterns that need special handling
      const problematicPatterns = [
        'lmmappstore.com',
        '.m3u8'  // All m3u8 streams should use our specialized fallback player
      ];
      
      // Check if URL matches any problematic patterns
      const needsSpecialHandling = problematicPatterns.some(pattern => 
        streamUrl.toLowerCase().includes(pattern)
      );
      
      if (needsSpecialHandling) {
        console.log("Stream URL requires special handling:", streamUrl);
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
