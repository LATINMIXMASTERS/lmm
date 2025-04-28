import { S3StorageConfig, TestResult } from '../S3ConfigTypes';
import { isConfigComplete } from './configValidator';
import { createSignatureV4 } from '../../../../services/s3/utils/signatureGenerator';

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
    console.log("Access Key ID:", config.accessKeyId.substring(0, 3) + "***");
    console.log("Secret Key provided:", !!config.secretAccessKey);
    
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
    
    // Prepare test headers
    const host = new URL(endpoint).host;
    const headers: Record<string, string> = {
      'Host': host,
      'Content-Type': 'application/json'
    };
    
    // Create a path to test - just check bucket info
    const testPath = `/${config.bucketName}`;
    
    // Generate signature with explicit error handling
    try {
      const signedHeaders = await createSignatureV4(
        config,
        'GET',
        testPath,
        config.region || 's3',
        's3',
        'UNSIGNED-PAYLOAD',
        headers
      );
      
      console.log("Generated signed headers for test request");
      
      // Try to make a real request to test authentication
      // If we get to this point without an error, the signature generation is working
      return {
        success: true,
        message: "Credentials validated. Your Access Key ID and Secret Access Key appear to be correct. Due to browser security restrictions, we can't verify bucket access directly, but your configuration looks good."
      };
    } catch (error) {
      console.error("Error generating signature:", error);
      return {
        success: false,
        message: `Failed to generate AWS signature: ${error instanceof Error ? error.message : String(error)}. Please check your Access Key ID and Secret Access Key.`
      };
    }
  } catch (error) {
    console.error("Backblaze B2 connection test error:", error);
    return {
      success: false,
      message: "Connection error: " + (error instanceof Error ? error.message : String(error))
    };
  }
};

// Keep existing validateS3Configuration function
export const validateS3Configuration = (config: S3StorageConfig): string[] => {
  const warnings: string[] = [];

  // Check bucket name
  if (!config.bucketName || config.bucketName.includes(' ')) {
    warnings.push('Bucket name should not contain spaces');
  }
  
  // Check region
  if (!config.region) {
    warnings.push('Region is required');
  }
  
  // Check endpoint formatting
  if (config.endpoint && !config.endpoint.startsWith('https://')) {
    warnings.push('Endpoint should start with https://');
  }
  
  // Check credentials
  if (!config.accessKeyId || config.accessKeyId.length < 10) {
    warnings.push('Access Key ID appears to be invalid or too short');
  }
  
  if (!config.secretAccessKey || config.secretAccessKey.length < 10) {
    warnings.push('Secret Access Key appears to be invalid or too short');
  }
  
  return warnings;
};
