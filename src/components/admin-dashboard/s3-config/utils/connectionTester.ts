
import { S3StorageConfig } from '../S3ConfigTypes';
import { createAuthHeaders } from './authHeaders';
import { isConfigComplete } from './configValidator';

/**
 * Test the S3 connection by checking bucket access
 */
export const testS3Connection = async (
  config: S3StorageConfig
): Promise<{ success: boolean; message: string }> => {
  if (!isConfigComplete(config)) {
    return { success: false, message: "Missing required configuration" };
  }
  
  try {
    // Ensure the endpoint is a valid URL
    let endpoint = config.endpoint || '';
    
    // Make sure it starts with https://
    if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
      endpoint = `https://${endpoint}`;
    }
    
    // Remove any trailing slashes to avoid double slashes in URLs
    endpoint = endpoint.replace(/\/+$/, '');
    
    console.log("Testing S3 connection with endpoint:", endpoint);
    console.log("Bucket:", config.bucketName);
    console.log("Region:", config.region);
    
    // Validate URL before proceeding
    try {
      new URL(endpoint);
    } catch (error) {
      console.error("Invalid endpoint URL:", endpoint);
      return { 
        success: false, 
        message: `Invalid endpoint URL: ${endpoint}. Make sure it's a complete URL like https://s3.us-east-005.backblazeb2.com` 
      };
    }
    
    // Get auth headers for the request
    const headers = await createAuthHeaders(config, 'GET', '');
    
    // For Backblaze B2, we need to list the bucket contents to verify access
    const listUrl = `${endpoint}/${config.bucketName}?list-type=2&max-keys=1`;
    
    // Make a GET request to list bucket contents
    const response = await fetch(listUrl, {
      method: 'GET',
      headers
    });
    
    console.log("B2 test response status:", response.status);
    
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
        console.log("Error response:", text);
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");
        const code = xmlDoc.getElementsByTagName("Code")[0]?.textContent;
        const message = xmlDoc.getElementsByTagName("Message")[0]?.textContent;
        
        errorMessage = code && message 
          ? `${code}: ${message}`
          : `HTTP ${response.status} - ${response.statusText}`;
      } catch (e) {
        console.error("Error parsing response:", e);
        errorMessage = `HTTP ${response.status} - ${response.statusText}`;
      }
      
      return {
        success: false,
        message: `Failed to connect: ${errorMessage}`
      };
    }
  } catch (error) {
    console.error("B2 connection test error:", error);
    return {
      success: false,
      message: error instanceof Error 
        ? `Connection error: ${error.message}`
        : "Unknown connection error"
    };
  }
};
