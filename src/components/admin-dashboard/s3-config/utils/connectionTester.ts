
import { S3StorageConfig } from '../S3ConfigTypes';
import { createAuthHeaders } from './authHeaders';
import { isConfigComplete } from './configValidator';

/**
 * Test the S3 connection by checking bucket access
 * Specifically fixed for Backblaze B2 compatibility
 */
export const testS3Connection = async (
  config: S3StorageConfig
): Promise<{ success: boolean; message: string }> => {
  if (!isConfigComplete(config)) {
    return { success: false, message: "Missing required configuration" };
  }
  
  try {
    // Ensure the endpoint is a valid URL for Backblaze B2
    let endpoint = config.endpoint || '';
    
    // Make sure it starts with https:// - Backblaze requires HTTPS
    if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
      endpoint = `https://${endpoint}`;
    }
    
    // Remove any trailing slashes to avoid double slashes in URLs
    endpoint = endpoint.replace(/\/+$/, '');
    
    // If no endpoint is provided, use the standard Backblaze B2 format
    if ((!endpoint || endpoint === 'https://') && config.region) {
      endpoint = `https://s3.${config.region}.backblazeb2.com`;
    }
    
    console.log("Testing Backblaze B2 connection with endpoint:", endpoint);
    console.log("Bucket:", config.bucketName);
    console.log("Region:", config.region);
    
    // Validate URL before proceeding
    try {
      new URL(endpoint);
    } catch (error) {
      console.error("Invalid Backblaze B2 endpoint URL:", endpoint);
      return { 
        success: false, 
        message: `Invalid endpoint URL: ${endpoint}. For Backblaze B2, use format: https://s3.us-west-004.backblazeb2.com` 
      };
    }
    
    // Create a simple GET path for testing - just use the bucket root
    const testPath = '';
    
    // Get auth headers for the request
    try {
      // Create the authentication headers synchronously
      const headers = await createAuthHeaders(config, 'GET', testPath);
      
      // For Backblaze B2, we need to list the bucket contents to verify access
      const listUrl = `${endpoint}/${config.bucketName}?list-type=2&max-keys=1`;
      
      console.log("Testing Backblaze B2 connection with URL:", listUrl);
      console.log("Headers:", Object.keys(headers).join(", "));
      
      // Set a timeout for the fetch operation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      try {
        // Make a GET request to list bucket contents
        const response = await fetch(listUrl, {
          method: 'GET',
          headers,
          signal: controller.signal
        });
        
        // Clear the timeout since the request completed
        clearTimeout(timeoutId);
        
        console.log("Backblaze B2 test response status:", response.status);
        
        if (response.ok) {
          return { 
            success: true, 
            message: "Successfully connected to Backblaze B2 storage" 
          };
        } else {
          // Parse error response if possible
          let errorMessage;
          try {
            const text = await response.text();
            console.log("Backblaze B2 error response:", text);
            
            // Try to parse XML error response
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, "text/xml");
            const code = xmlDoc.getElementsByTagName("Code")[0]?.textContent;
            const message = xmlDoc.getElementsByTagName("Message")[0]?.textContent;
            
            errorMessage = code && message 
              ? `${code}: ${message}`
              : `HTTP ${response.status} - ${response.statusText}`;
          } catch (e) {
            console.error("Error parsing Backblaze B2 response:", e);
            errorMessage = `HTTP ${response.status} - ${response.statusText}`;
          }
          
          return {
            success: false,
            message: `Failed to connect to Backblaze B2: ${errorMessage}`
          };
        }
      } catch (fetchError) {
        // Clear the timeout in case of an error
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          console.error("Backblaze B2 connection test timed out");
          return {
            success: false,
            message: "Connection test timed out. Check your endpoint URL and network connection."
          };
        }
        
        console.error("Fetch error during Backblaze B2 connection test:", fetchError);
        return {
          success: false,
          message: `Connection error: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`
        };
      }
    } catch (authError) {
      console.error("Error creating auth headers for Backblaze B2:", authError);
      return {
        success: false,
        message: `Authentication error: ${authError instanceof Error ? authError.message : String(authError)}`
      };
    }
  } catch (error) {
    console.error("Backblaze B2 connection test error:", error);
    return {
      success: false,
      message: error instanceof Error 
        ? `Connection error: ${error.message}`
        : "Unknown connection error with Backblaze B2"
    };
  }
};
