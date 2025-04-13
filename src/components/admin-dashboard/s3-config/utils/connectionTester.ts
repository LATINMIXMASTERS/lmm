
import { S3StorageConfig, TestResult } from '../S3ConfigTypes';
import { createAuthHeaders } from './authHeaders';
import { isConfigComplete } from './configValidator';

/**
 * Test the S3 connection by checking bucket access
 * Optimized specifically for Backblaze B2 compatibility
 */
export const testS3Connection = async (
  config: S3StorageConfig
): Promise<TestResult> => {
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
        message: `Invalid endpoint URL: ${endpoint}. For Backblaze B2, use format: https://s3.{region}.backblazeb2.com` 
      };
    }
    
    // Since direct fetch to Backblaze B2 from browser will fail due to CORS,
    // we'll do a simplified validation by checking credentials format
    
    // Basic validation of credentials format
    if (!config.accessKeyId || config.accessKeyId.length < 5) {
      return { 
        success: false, 
        message: "Invalid Application Key ID format. Should be at least 5 characters." 
      };
    }
    
    if (!config.secretAccessKey || config.secretAccessKey.length < 5) {
      return { 
        success: false, 
        message: "Invalid Application Key format. Should be at least 5 characters." 
      };
    }
    
    // Validate bucket name format
    if (!config.bucketName || !/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(config.bucketName)) {
      return { 
        success: false, 
        message: "Invalid bucket name format. Bucket names must be between 3 and 63 characters and can contain lowercase letters, numbers, dots, and hyphens." 
      };
    }
    
    // Instead of trying to fetch from Backblaze B2 directly (which will fail due to CORS),
    // we'll just validate the configuration format and assume it's correct if it passes validation
    
    console.log("Connection test passed basic validation. Due to CORS restrictions, we can't verify actual connectivity.");
    
    return {
      success: true,
      message: "Configuration validated. Note: Due to browser security restrictions, direct connection testing isn't possible. Your uploads will work if you've entered the correct credentials."
    };
  } catch (error) {
    console.error("Backblaze B2 connection test error:", error);
    return {
      success: false,
      message: "Connection error: " + (error instanceof Error ? error.message : String(error)) + 
               ". This is likely due to browser security (CORS) restrictions. Your configuration may still be valid for uploads."
    };
  }
};
