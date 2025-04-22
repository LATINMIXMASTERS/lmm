
import { S3StorageConfig } from '../S3ConfigTypes';

/**
 * Create authentication headers for S3 requests
 */
export const createAuthHeaders = (
  config: S3StorageConfig,
  method: string = 'GET',
  path: string = '/',
  contentType: string = 'application/json'
): Headers => {
  const date = new Date().toUTCString();
  
  const headers = new Headers({
    'Host': new URL(config.endpoint).host,
    'Date': date,
    'Content-Type': contentType,
    'Authorization': `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${date.substring(0, 8)}/${config.region}/s3/aws4_request`
  });
  
  return headers;
};
