
/**
 * Detect if a URL is likely a Shoutcast stream
 * @param url Stream URL to check
 * @returns Boolean indicating if it's a Shoutcast URL
 */
export const isShoutcastUrl = (url: string): boolean => {
  const shoutcastPatterns = [
    /shoutcast/i,
    /\.pls$/i,
    /\.m3u$/i,
    /:8000\/?$/,  // Common Shoutcast port
    /:8010\/?$/,  // Common Shoutcast port
    /:8005\/?$/,  // Common Shoutcast port
    /:9000\/?$/   // Common Shoutcast port
  ];
  
  return shoutcastPatterns.some(pattern => url.match(pattern));
};

/**
 * Detect if a URL is likely an Icecast stream
 * @param url Stream URL to check
 * @returns Boolean indicating if it's an Icecast URL
 */
export const isIcecastUrl = (url: string): boolean => {
  const icecastPatterns = [
    /icecast/i,
    /\.ogg$/i,
    /\.opus$/i,
    /:8080\/?$/,  // Common Icecast port
    /:8443\/?$/,  // Common Icecast port
    /:8000\/.*\.mp3$/i,  // MP3 mountpoint
    /\/stream$/i  // Common Icecast mountpoint
  ];
  
  return icecastPatterns.some(pattern => url.match(pattern));
};

/**
 * Check if a URL is potentially a valid stream URL
 * @param url URL to check
 * @returns Boolean indicating if it's likely a valid stream URL
 */
export const isValidStreamUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Check if it's a URL with http/https
  if (!/^https?:\/\//i.test(url)) return false;
  
  // Check if it has a valid hostname
  try {
    const urlObj = new URL(url);
    return !!urlObj.hostname;
  } catch (e) {
    return false;
  }
};

/**
 * Get a standardized stream URL from various formats
 * @param url Input URL (may be incomplete)
 * @returns Properly formatted stream URL
 */
export const standardizeStreamUrl = (url: string): string => {
  if (!url) return '';
  
  // Convert common IP:port format to full URL
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(url)) {
    return `http://${url}`;
  }
  
  // Add http:// if missing
  if (!/^https?:\/\//i.test(url)) {
    return `http://${url}`;
  }
  
  return url;
};

/**
 * Extract a clean stream URL from any URL format
 * @param url Original URL that may need formatting
 * @returns Properly formatted stream URL
 */
export const extractStreamUrl = (url: string): string => {
  return standardizeStreamUrl(url);
};

/**
 * Process playlist files to extract the actual stream URL
 * @param content Playlist content (.pls or .m3u file)
 * @returns Extracted stream URL or null
 */
export const extractStreamUrlFromPlaylist = (content: string): string | null => {
  // Check for .pls format
  const plsMatch = content.match(/File\d+=([^\r\n]+)/i);
  if (plsMatch && plsMatch[1]) {
    return plsMatch[1].trim();
  }
  
  // Check for .m3u format - first non-comment line
  const lines = content.split(/[\r\n]+/).filter(line => line.trim() && !line.startsWith('#'));
  if (lines.length > 0) {
    return lines[0].trim();
  }
  
  return null;
};

/**
 * Extract cover art URL from metadata object
 * @param metadata Metadata object
 * @returns Cover art URL or null
 */
export const extractCoverArtUrl = (metadata: any): string | null => {
  if (!metadata) return null;
  
  // Some common paths in different metadata formats
  const potentialPaths = [
    'coverArt',
    'cover',
    'artworkUrl',
    'artwork_url',
    'image',
    'album_art',
    'artwork',
    'picture'
  ];
  
  for (const path of potentialPaths) {
    if (metadata[path] && typeof metadata[path] === 'string') {
      return metadata[path];
    }
  }
  
  // Look for any URL in metadata that seems like an image
  const metadataStr = JSON.stringify(metadata);
  const urlMatch = metadataStr.match(/"(https?:\/\/[^"]*\.(jpg|jpeg|png|gif|webp))"/i);
  if (urlMatch) {
    return urlMatch[1];
  }
  
  return null;
};
