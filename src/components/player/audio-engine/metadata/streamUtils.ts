
// Extract and format the stream URL correctly
export const extractStreamUrl = (url: string): string => {
  // Clean up the URL
  let streamUrl = url.trim();
  
  // If it's already a proper URL (with protocol), return it as is
  if (streamUrl.startsWith('http://') || streamUrl.startsWith('https://')) {
    return streamUrl;
  }
  
  // For simple host:port format
  if (streamUrl.includes(':')) {
    return `http://${streamUrl}`;
  }
  
  // Add default http protocol if missing
  return `http://${streamUrl}`;
};

// Standardize stream URL for consistent usage
export const standardizeStreamUrl = (url: string): string => {
  return extractStreamUrl(url);
};

// Check if a URL is a Shoutcast URL
export const isShoutcastUrl = (url: string): boolean => {
  return url.includes('/stream') || url.includes(':8000');
};

// Check if a URL is valid for streaming
export const isValidStreamUrl = (url: string): boolean => {
  if (!url) return false;
  if (url === 'http://' || url === 'https://') return false;
  return url.startsWith('http://') || url.startsWith('https://');
};
