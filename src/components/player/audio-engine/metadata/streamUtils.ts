
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
  
  // Handle special URLs based on stream type
  // Icecast streams often end with /stream
  if (streamUrl.includes('icecast') && !streamUrl.endsWith('/stream')) {
    streamUrl = `${streamUrl}/stream`;
  }
  
  // Handle SHOUTcast streams
  if (streamUrl.includes('shoutcast') && !streamUrl.includes('/stream') && !streamUrl.includes(';')) {
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
