
/**
 * Format error messages from failed S3 requests
 * Optimized for Backblaze B2 compatibility
 */
export function formatErrorMessage(
  statusCode: number,
  statusText: string,
  responseText: string
): string {
  // Try to parse XML error response from Backblaze B2
  if (responseText && responseText.includes('<Error>')) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(responseText, "text/xml");
      const code = xmlDoc.getElementsByTagName("Code")[0]?.textContent;
      const message = xmlDoc.getElementsByTagName("Message")[0]?.textContent;
      
      if (code || message) {
        return `Backblaze B2 Error: ${code || ''} - ${message || 'Unknown error'}`;
      }
    } catch (error) {
      console.error("Error parsing Backblaze B2 error response:", error);
    }
  }
  
  // Return generic error message with status code
  return `Backblaze B2 Error (HTTP ${statusCode}): ${statusText || 'Unknown error'}`;
}

/**
 * Handle network errors specifically for S3 operations
 */
export function handleNetworkError(error: unknown): string {
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return 'Network error: Unable to connect to Backblaze B2. Check your internet connection, B2 endpoint configuration, and ensure CORS is properly configured on your B2 bucket.';
  }
  
  if (error instanceof DOMException && error.name === 'AbortError') {
    return 'Connection timed out. Check your internet connection and B2 endpoint configuration.';
  }
  
  return `S3 error: ${error instanceof Error ? error.message : String(error)}`;
}
