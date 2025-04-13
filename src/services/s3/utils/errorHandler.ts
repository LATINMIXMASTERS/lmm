
/**
 * Error handling utilities for S3 uploads
 */

/**
 * Parse S3 XML error response
 */
export function parseErrorResponse(responseText: string): string {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(responseText, "text/xml");
    const code = xmlDoc.getElementsByTagName("Code")[0]?.textContent;
    const message = xmlDoc.getElementsByTagName("Message")[0]?.textContent;
    
    if (code || message) {
      return `${code || 'Error'}: ${message || responseText}`;
    }
    
    return responseText;
  } catch (e) {
    console.error("Error parsing XML response:", e);
    return responseText;
  }
}

/**
 * Create a standardized error message
 */
export function formatErrorMessage(status: number, statusText: string, responseText: string): string {
  let errorMsg = `Upload failed with status ${status}`;
  
  if (responseText) {
    try {
      const parsedError = parseErrorResponse(responseText);
      return `${errorMsg}: ${parsedError}`;
    } catch (e) {
      console.error("Error formatting error message:", e);
    }
  }
  
  return `${errorMsg}: ${statusText}`;
}
