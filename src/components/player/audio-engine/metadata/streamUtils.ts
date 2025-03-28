
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
  
  // Handle Shoutcast specific URLs with better patterns
  if (isShoutcastUrl(streamUrl)) {
    // If URL already ends with /stream or /;stream.mp3, don't modify
    if (!streamUrl.endsWith('/stream') && 
        !streamUrl.includes(';stream.') && 
        !streamUrl.endsWith('/listen') &&
        !streamUrl.endsWith('.mp3') &&
        !streamUrl.endsWith('/1')) {
      
      // Check for lmmradiocast.com or similar
      if (streamUrl.includes('lmmradiocast.com')) {
        console.log('Special handling for lmmradiocast URL');
        // Only add /lmmradio if not already in the URL
        if (!streamUrl.endsWith('/lmmradio')) {
          streamUrl = streamUrl.endsWith('/') 
            ? `${streamUrl}lmmradio` 
            : `${streamUrl}/lmmradio`;
        }
      } else {
        // Generic shoutcast URL, add /stream suffix
        streamUrl = streamUrl.endsWith('/') 
          ? `${streamUrl}stream` 
          : `${streamUrl}/stream`;
      }
    }
  }
  // Handle Icecast streams
  else if (streamUrl.includes('icecast') && !streamUrl.endsWith('/stream')) {
    streamUrl = `${streamUrl}/stream`;
  }
  
  // Remove any extra query parameters for .m3u8 streams (HLS)
  if (streamUrl.includes('.m3u8?')) {
    streamUrl = streamUrl.split('?')[0];
  }
  
  console.log('Extracted stream URL:', streamUrl);
  return streamUrl;
};

/**
 * Checks if a URL is a valid stream URL
 */
export const isValidStreamUrl = (url: string): boolean => {
  if (!url) return false;
  
  const validPatterns = [
    /^https?:\/\//i,                   // Must start with http:// or https://
    /\.(mp3|aac|ogg|m3u8|pls)$/i,      // Common audio formats
    /\/(stream|listen)(\?|\/|$)/i,     // Common stream endpoints
    /(icecast|shoutcast|radio)/i,      // Common streaming server types
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
