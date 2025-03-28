
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
    let endpoint = config.endpoint || `https://s3.${config.region}.wasabisys.com`;
    
    // For Wasabi, ensure we have the correct domain format
    if (!endpoint.includes('wasabisys.com') && config.region && !endpoint.includes(config.region)) {
      endpoint = `https://s3.${config.region}.wasabisys.com`;
      console.log("Corrected Wasabi endpoint for testing:", endpoint);
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
    
    // Make a GET request to check bucket location
    const response = await fetch(`${endpoint}/${config.bucketName}?location`, {
      method: 'GET',
      headers
    });
    
    console.log("S3 test response status:", response.status);
    
    if (response.ok) {
      return { 
        success: true, 
        message: "Successfully connected to S3 storage" 
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
    console.error("S3 connection test error:", error);
    return {
      success: false,
      message: error instanceof Error 
        ? `Connection error: ${error.message}`
        : "Unknown connection error"
    };
  }
};
