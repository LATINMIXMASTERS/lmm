
/**
 * Extracts the base stream URL from various formats
 */
export const extractStreamUrl = (rawUrl: string): string => {
  if (!rawUrl) return '';
  
  let streamUrl = rawUrl.trim();
  
  // Handle missing protocol
  if (!streamUrl.startsWith('http://') && !streamUrl.startsWith('https://')) {
    streamUrl = `https://${streamUrl}`;
  }
  
  try {
    // Handle Shoutcast specific URLs with better patterns
    if (isShoutcastUrl(streamUrl)) {
      // Handle lmmradiocast.com URLs specifically
      if (streamUrl.includes('lmmradiocast.com')) {
        console.log('Special handling for lmmradiocast URL');
        // Format specifically for lmmradiocast.com URLs
        if (streamUrl.endsWith('/lmmradio') || streamUrl.endsWith('/lmmradio/')) {
          // URL is already in the correct format
          streamUrl = streamUrl.endsWith('/') ? streamUrl.slice(0, -1) : streamUrl;
        } else if (!streamUrl.includes('/lmmradio')) {
          // Add /lmmradio if it's missing
          streamUrl = streamUrl.endsWith('/') 
            ? `${streamUrl}lmmradio` 
            : `${streamUrl}/lmmradio`;
        }
        return streamUrl;
      }
      
      // For other Shoutcast servers
      if (!streamUrl.endsWith('/stream') && 
          !streamUrl.includes(';stream.') && 
          !streamUrl.endsWith('/listen') &&
          !streamUrl.endsWith('.mp3') &&
          !streamUrl.endsWith('/1')) {
        
        streamUrl = streamUrl.endsWith('/') 
          ? `${streamUrl}stream` 
          : `${streamUrl}/stream`;
      }
    }
    // Handle Icecast streams
    else if (streamUrl.includes('icecast') && !streamUrl.endsWith('/stream')) {
      streamUrl = streamUrl.endsWith('/') 
        ? `${streamUrl}stream` 
        : `${streamUrl}/stream`;
    }
    
    // Remove any extra query parameters for .m3u8 streams (HLS)
    if (streamUrl.includes('.m3u8?')) {
      streamUrl = streamUrl.split('?')[0];
    }
    
    console.log('Extracted stream URL:', streamUrl);
    return streamUrl;
  } catch (error) {
    console.error("Error in extractStreamUrl:", error);
    // Return the original URL with https:// prepended if necessary
    return streamUrl;
  }
};

/**
 * Checks if a URL is a valid stream URL
 */
export const isValidStreamUrl = (url: string): boolean => {
  if (!url) return false;
  
  const validPatterns = [
    /^https?:\/\//i,                   // Must start with http:// or https://
    /\.(mp3|aac|ogg|m3u8|pls)$/i,      // Common audio formats
    /\/(stream|listen|lmmradio)(\?|\/|$)/i,  // Common stream endpoints
    /(icecast|shoutcast|radio)/i,      // Common streaming server types
    /:\d+\//                           // URLs with port numbers (common for streams)
  ];
  
  // Check if at least one pattern matches
  return validPatterns.some(pattern => pattern.test(url));
};

/**
 * Detects if a URL is likely a Shoutcast server
 */
export const isShoutcastUrl = (url: string): boolean => {
  return url.includes('shoutcast') || 
         url.includes('radionomy') || 
         url.includes('radiocast') || 
         url.includes('lmmradio') ||
         url.includes('lmmradiocast.com') ||
         /:\d+\//.test(url); // Often Shoutcast uses port numbers
}
