
/**
 * Utility functions for handling S3 URLs and endpoints
 * Enhanced for Backblaze B2 compatibility
 */

/**
 * Ensures the endpoint is a valid, properly formatted URL for Backblaze B2
 */
export function normalizeEndpointUrl(endpoint?: string, region?: string): string {
  // Start with the provided endpoint or empty string
  let normalizedEndpoint = endpoint || '';
  
  // Make sure it starts with https:// (Backblaze B2 requires HTTPS)
  if (!normalizedEndpoint.startsWith('http://') && !normalizedEndpoint.startsWith('https://')) {
    normalizedEndpoint = `https://${normalizedEndpoint}`;
  }
  
  // Remove any trailing slashes to avoid double slashes in paths
  normalizedEndpoint = normalizedEndpoint.replace(/\/+$/, '');
  
  // If no endpoint is provided but we have a region, use the standard Backblaze B2 format
  if (!normalizedEndpoint && region) {
    normalizedEndpoint = `https://s3.${region}.backblazeb2.com`;
  }
  
  // Handle legacy Backblaze endpoints (without .backblazeb2.com)
  if (normalizedEndpoint && !normalizedEndpoint.includes('.') && region) {
    normalizedEndpoint = `https://s3.${region}.backblazeb2.com`;
  }
  
  console.log('Normalized Backblaze B2 endpoint:', normalizedEndpoint, 'from:', { original: endpoint, region });
  
  // Validate the URL
  try {
    new URL(normalizedEndpoint);
  } catch (error) {
    console.error("Invalid Backblaze B2 endpoint URL:", normalizedEndpoint);
    throw new Error(`Invalid Backblaze B2 endpoint URL: ${normalizedEndpoint}. Please check your B2 configuration.`);
  }
  
  return normalizedEndpoint;
}

/**
 * Creates a public URL for an uploaded file in Backblaze B2
 */
export function createPublicUrl(
  endpoint: string, 
  bucketName: string, 
  filePath: string, 
  customPublicUrl?: string
): string {
  if (customPublicUrl) {
    // Use custom CDN or endpoint if provided
    const cleanBase = customPublicUrl.replace(/\/+$/, '');
    return `${cleanBase}/${filePath}`;
  } else {
    // Use standard Backblaze B2 URL format
    return `${endpoint}/${bucketName}/${filePath}`;
  }
}
