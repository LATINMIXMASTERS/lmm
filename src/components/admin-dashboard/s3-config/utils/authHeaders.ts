
import { S3StorageConfig } from '../S3ConfigTypes';
import { createSignatureV4 } from './signatures';

/**
 * Create proper AWS signature v4 headers for S3 requests
 * Optimized specifically for Backblaze B2 compatibility
 */
export const createAuthHeaders = async (
  config: S3StorageConfig, 
  method: string, 
  path: string
): Promise<Record<string, string>> => {
  if (!config.secretAccessKey || !config.accessKeyId) {
    throw new Error('Missing Backblaze B2 credentials');
  }
  
  // Ensure endpoint is a valid URL
  let endpoint = config.endpoint || '';
  
  // Make sure it starts with https://
  if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
    endpoint = `https://${endpoint}`;
  }
  
  // Remove any trailing slashes
  endpoint = endpoint.replace(/\/+$/, '');
  
  // If no endpoint is provided or it's just the protocol, use the B2 specific format
  if ((!endpoint || endpoint === 'https://') && config.region) {
    endpoint = `https://s3.${config.region}.backblazeb2.com`;
  }
  
  // Validate URL to avoid 'Invalid URL' errors
  try {
    new URL(endpoint);
  } catch (error) {
    console.error("Invalid Backblaze B2 endpoint URL:", endpoint);
    throw new Error(`Invalid Backblaze B2 endpoint URL: ${endpoint}. Please use format: https://s3.{region}.backblazeb2.com`);
  }
  
  const host = new URL(endpoint).host;
  
  // Prepare headers for signature with B2 specific requirements
  const headers: Record<string, string> = {
    'Host': host,
    'Content-Type': 'application/json',
    'x-amz-acl': 'public-read', // Critical for Backblaze B2 - make objects public
    'Cache-Control': 'no-cache'
  };
  
  // Use empty string hash for browser compatibility with empty requests
  const payloadHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'; // empty string hash
  
  // Determine the proper path for the request
  // For bucket listing, empty string as path and add bucket in query params
  const requestPath = path || '';
  
  // Set default region if not provided
  const region = config.region || 'us-west-004';
  
  console.log('Creating auth headers for Backblaze B2:', {
    host,
    method,
    path: requestPath,
    region,
    endpoint
  });
  
  // Generate AWS signature v4 for Backblaze B2
  try {
    const signedHeaders = await createSignatureV4(
      config,
      method,
      requestPath,
      region,
      's3',
      payloadHash,
      headers
    );
    
    console.log('Generated signed headers for Backblaze B2:', Object.keys(signedHeaders).join(', '));
    return signedHeaders;
  } catch (error) {
    console.error('Error generating Backblaze B2 signature:', error);
    throw new Error(`Failed to create Backblaze B2 signature: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
