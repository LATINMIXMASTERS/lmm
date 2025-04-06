
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
    // Determine the endpoint URL
    let endpoint = config.endpoint || `https://s3.${config.region}.backblazeb2.com`;
    
    // For Backblaze B2, ensure we have the correct domain format
    if (!endpoint.includes('backblazeb2.com') && config.region && !endpoint.includes(config.region)) {
      endpoint = `https://s3.${config.region}.backblazeb2.com`;
      console.log("Corrected Backblaze B2 endpoint for testing:", endpoint);
    }
    
    console.log("Testing S3 connection with endpoint:", endpoint);
    console.log("Bucket:", config.bucketName);
    console.log("Region:", config.region);
    
    // Get auth headers for the request
    const headers = await createAuthHeaders(config, 'GET', '');
    
    // Display headers for debugging (removing secret key)
    const debugHeaders = {...headers};
    if (headers.Authorization) {
      debugHeaders.Authorization = headers.Authorization.substring(0, 50) + '...';
    }
    console.log("Auth headers:", debugHeaders);
    
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
