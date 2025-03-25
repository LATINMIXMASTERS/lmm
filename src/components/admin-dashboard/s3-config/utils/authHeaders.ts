
import { S3StorageConfig } from '../S3ConfigTypes';
import { createSignatureV4 } from './signatures';

/**
 * Create proper AWS signature v4 headers for S3 requests
 */
export const createAuthHeaders = async (
  config: S3StorageConfig, 
  method: string, 
  path: string
): Promise<Record<string, string>> => {
  if (!config.secretAccessKey || !config.accessKeyId) {
    throw new Error('Missing S3 credentials');
  }
  
  // Determine the endpoint URL, removing any trailing slashes
  const endpoint = config.endpoint?.replace(/\/$/, '') || 
    `https://s3.${config.region}.wasabisys.com`;
  const host = new URL(endpoint).host;
  
  // Prepare headers for signature
  const headers: Record<string, string> = {
    'Host': host,
    'Content-Type': 'application/json',
    // Ensure proper cache control
    'Cache-Control': 'no-cache'
  };
  
  // Use 'UNSIGNED-PAYLOAD' for browser compatibility with empty requests
  const payloadHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'; // empty string hash
  
  // Generate AWS signature v4
  return await createSignatureV4(
    config,
    method,
    path,
    config.region,
    's3',
    payloadHash,
    headers
  );
};
