
/**
 * Utility functions for handling S3 URLs and endpoints
 */

/**
 * Ensures the endpoint is a valid, properly formatted URL
 */
export function normalizeEndpointUrl(endpoint?: string, region?: string): string {
  // Ensure endpoint is a valid URL
  let normalizedEndpoint = endpoint || '';
  
  // Make sure it starts with https://
  if (!normalizedEndpoint.startsWith('http://') && !normalizedEndpoint.startsWith('https://')) {
    normalizedEndpoint = `https://${normalizedEndpoint}`;
  }
  
  // Remove any trailing slashes to avoid double slashes
  normalizedEndpoint = normalizedEndpoint.replace(/\/+$/, '');
  
  // If no endpoint is provided, use the standard Backblaze B2 format
  if (!normalizedEndpoint && region) {
    normalizedEndpoint = `https://s3.${region}.backblazeb2.com`;
  }
  
  // Validate the URL
  try {
    new URL(normalizedEndpoint);
  } catch (error) {
    console.error("Invalid endpoint URL:", normalizedEndpoint);
    throw new Error(`Invalid endpoint URL: ${normalizedEndpoint}. Please check your S3 configuration.`);
  }
  
  return normalizedEndpoint;
}

/**
 * Creates a public URL for an uploaded file
 */
export function createPublicUrl(
  endpoint: string, 
  bucketName: string, 
  filePath: string, 
  customPublicUrl?: string
): string {
  if (customPublicUrl) {
    // Use custom CDN or endpoint if provided
    return `${customPublicUrl.replace(/\/+$/, '')}/${filePath}`;
  } else {
    // Use standard URL format
    return `${endpoint}/${bucketName}/${filePath}`;
  }
}
