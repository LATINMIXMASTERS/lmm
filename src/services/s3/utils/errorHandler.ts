
/**
 * Error handling utilities for S3 uploads
 * Optimized for Backblaze B2 error responses
 */

/**
 * Parse S3/Backblaze XML error response
 */
export function parseErrorResponse(responseText: string): string {
  try {
    // Check if the response is XML (common for Backblaze B2 errors)
    if (responseText.includes('<?xml') || responseText.includes('<Error>')) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(responseText, "text/xml");
      const code = xmlDoc.getElementsByTagName("Code")[0]?.textContent;
      const message = xmlDoc.getElementsByTagName("Message")[0]?.textContent;
      
      if (code || message) {
        return `${code || 'Error'}: ${message || responseText}`;
      }
    }
    
    // Handle potential JSON responses
    if (responseText.startsWith('{') && responseText.endsWith('}')) {
      try {
        const jsonResponse = JSON.parse(responseText);
        if (jsonResponse.message || jsonResponse.error) {
          return jsonResponse.message || jsonResponse.error;
        }
      } catch (e) {
        // Not valid JSON, continue to default handling
      }
    }
    
    return responseText;
  } catch (e) {
    console.error("Error parsing Backblaze B2 error response:", e);
    return responseText;
  }
}

/**
 * Create a standardized error message for Backblaze B2 errors
 */
export function formatErrorMessage(status: number, statusText: string, responseText: string): string {
  let errorMsg = `Upload to Backblaze B2 failed with status ${status}`;
  
  // Add detailed handling for common Backblaze B2 error codes
  if (status === 400) {
    errorMsg = `Bad request to Backblaze B2 (400)`;
  } else if (status === 401 || status === 403) {
    errorMsg = `Authentication failed with Backblaze B2 (${status})`;
  } else if (status === 404) {
    errorMsg = `Bucket or endpoint not found on Backblaze B2 (404)`;
  } else if (status >= 500) {
    errorMsg = `Backblaze B2 server error (${status})`;
  }
  
  if (responseText) {
    try {
      const parsedError = parseErrorResponse(responseText);
      return `${errorMsg}: ${parsedError}`;
    } catch (e) {
      console.error("Error formatting Backblaze B2 error message:", e);
    }
  }
  
  return `${errorMsg}: ${statusText}`;
}
