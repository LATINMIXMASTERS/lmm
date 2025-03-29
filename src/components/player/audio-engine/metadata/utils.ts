
/**
 * Fetch with timeout and retry mechanism to avoid hanging requests
 * @param url The URL to fetch
 * @param options Request options
 * @param timeout Timeout in milliseconds
 * @param retries Number of retry attempts
 * @param retryDelay Delay between retries in milliseconds
 */
export const fetchWithTimeout = async (
  url: string, 
  options: RequestInit = {}, 
  timeout = 5000,
  retries = 2,
  retryDelay = 1000
): Promise<Response> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const { signal } = controller;
      
      const timeoutId = setTimeout(() => {
        controller.abort();
        throw new Error(`Request timeout for ${url}`);
      }, timeout);
      
      try {
        const response = await fetch(url, { ...options, signal });
        clearTimeout(timeoutId);
        
        if (!response.ok && attempt < retries) {
          console.log(`Attempt ${attempt + 1}/${retries + 1} failed with status ${response.status}, retrying...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        
        return response;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error(`Fetch attempt ${attempt + 1}/${retries + 1} failed:`, error);
      lastError = error as Error;
      
      if (attempt < retries) {
        console.log(`Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  throw lastError || new Error(`Failed to fetch ${url} after ${retries + 1} attempts`);
};

/**
 * Safely parses JSON with error handling
 */
export const safeJsonParse = (text: string) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return null;
  }
};

