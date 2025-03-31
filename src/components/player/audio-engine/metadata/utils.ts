
/**
 * Fetch with timeout and retry capability
 * @param url The URL to fetch
 * @param options Fetch options
 * @param timeout Timeout in milliseconds
 * @param retries Number of retries
 * @param retryDelay Delay between retries in milliseconds
 * @returns Promise with the fetch response
 */
export const fetchWithTimeout = async (
  url: string, 
  options: RequestInit = {}, 
  timeout: number = 8000,
  retries: number = 2,
  retryDelay: number = 1000
): Promise<Response> => {
  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const fetchOptions = {
      ...options,
      signal: controller.signal
    };
    
    try {
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // If we have retries left, try again after delay
      if (retries > 0) {
        console.log(`Retrying fetch to ${url}, ${retries} attempts left`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return fetchWithTimeout(url, options, timeout, retries - 1, retryDelay);
      }
      
      throw error;
    }
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

/**
 * Safely parse JSON with error handling
 * @param jsonString String to parse
 * @param fallback Default value if parsing fails
 * @returns Parsed object or fallback
 */
export const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return fallback;
  }
};

/**
 * Extract a specific value from a JSON path
 * @param obj Object to extract from
 * @param path Path to the value (e.g. 'a.b.c')
 * @param defaultValue Default value if path doesn't exist
 * @returns Value at path or default
 */
export const getValueFromPath = (obj: any, path: string, defaultValue: any = null): any => {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current !== undefined ? current : defaultValue;
};

/**
 * Try to extract artist and title from a single string
 * @param trackString String containing artist and title
 * @returns Object with artist and title
 */
export const extractArtistAndTitle = (trackString: string): { artist: string; title: string } => {
  // Common patterns: "Artist - Title", "Title by Artist", etc.
  if (!trackString) {
    return { artist: '', title: '' };
  }
  
  // Try "Artist - Title" format
  const dashMatch = trackString.match(/^(.*?)\s*-\s*(.*)$/);
  if (dashMatch) {
    return { artist: dashMatch[1].trim(), title: dashMatch[2].trim() };
  }
  
  // Try "Title by Artist" format
  const byMatch = trackString.match(/^(.*?)\s*by\s*(.*)$/i);
  if (byMatch) {
    return { artist: byMatch[2].trim(), title: byMatch[1].trim() };
  }
  
  // Default: assume it's all title
  return { artist: '', title: trackString.trim() };
};

/**
 * Find a good image URL from metadata
 * @param metadata Metadata object with possible image URLs
 * @returns Best image URL found or null
 */
export const findBestImageUrl = (metadata: any): string | null => {
  if (!metadata) return null;
  
  // Check common paths for cover art
  const potentialPaths = [
    'coverArt',
    'cover',
    'artworkUrl',
    'artwork_url',
    'image',
    'album_art',
    'thumbnail',
    'artwork',
    'picture'
  ];
  
  for (const path of potentialPaths) {
    const value = getValueFromPath(metadata, path);
    if (value && typeof value === 'string' && value.match(/^https?:\/\//)) {
      return value;
    }
  }
  
  // Look for any URL-like string in the metadata
  const allValues = JSON.stringify(metadata);
  const urlMatch = allValues.match(/"(https?:\/\/[^"]*\.(jpg|jpeg|png|gif|webp))"/i);
  if (urlMatch) {
    return urlMatch[1];
  }
  
  return null;
};
