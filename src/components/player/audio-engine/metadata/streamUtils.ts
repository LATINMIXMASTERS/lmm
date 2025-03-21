
/**
 * Utility function to extract and format stream URLs from different formats
 * @param streamUrl - The raw stream URL
 * @returns A properly formatted stream URL
 */
export const extractStreamUrl = (streamUrl: string): string => {
  // Handle different URL formats
  if (streamUrl.includes('.m3u') || streamUrl.includes('.pls')) {
    // For playlist files, we should technically download and parse them
    // But since we can't do that easily with CORS issues, return as is for now
    return streamUrl;
  }
  
  // Clean up the URL if needed
  if (!streamUrl.startsWith('http://') && !streamUrl.startsWith('https://')) {
    return `https://${streamUrl}`;
  }
  
  return streamUrl;
};

/**
 * Determines if a URL is valid for metadata fetching
 * @param url - The URL to check
 * @returns Boolean indicating if the URL is valid
 */
export const isValidStreamUrl = (url: string): boolean => {
  return Boolean(url && (url.startsWith('http://') || url.startsWith('https://')));
};
