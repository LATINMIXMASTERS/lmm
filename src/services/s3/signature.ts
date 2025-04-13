
import { S3StorageConfig, S3UploadResult } from './types';
import * as crypto from 'crypto';

/**
 * Creates AWS Signature and uploads a file to S3-compatible storage
 */
export async function createAwsSignature(
  config: S3StorageConfig,
  file: File,
  filePath: string,
  onProgress?: (progress: number) => void
): Promise<S3UploadResult> {
  try {
    // Ensure endpoint is a valid URL
    let endpoint = config.endpoint || '';
    
    // Make sure it starts with https://
    if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
      endpoint = `https://${endpoint}`;
    }
    
    // Remove any trailing slashes to avoid double slashes
    endpoint = endpoint.replace(/\/+$/, '');
    
    if (!endpoint) {
      // Fallback to regional endpoint if none provided
      endpoint = `https://s3.${config.region}.backblazeb2.com`;
    }
    
    // Validate URL to avoid 'Invalid URL' errors
    try {
      new URL(endpoint);
    } catch (error) {
      console.error("Invalid endpoint URL:", endpoint);
      if (onProgress) onProgress(0);
      throw new Error(`Invalid endpoint URL: ${endpoint}. Please check your Backblaze B2 configuration.`);
    }
    
    // Extract host from valid URL
    const host = new URL(endpoint).host;
    
    // Create the full path for the signature
    const s3Path = `${config.bucketName}/${filePath}`;
    
    // Standard headers for S3 upload
    const headers: Record<string, string> = {
      'Host': host,
      'Content-Type': file.type || 'application/octet-stream',
      'Content-Length': file.size.toString(),
      'Cache-Control': 'public, max-age=31536000',
      'x-amz-acl': 'public-read'  // Add this to ensure files are publicly readable
    };
    
    // Use 'UNSIGNED-PAYLOAD' for browser compatibility
    const payloadHash = 'UNSIGNED-PAYLOAD';
    
    if (onProgress) onProgress(10);
    
    console.log('Generating signature for:', {
      endpoint,
      bucket: config.bucketName,
      path: filePath,
      region: config.region,
      host
    });
    
    // Generate AWS signature v4
    const signedHeaders = await createSignatureV4(
      config,
      'PUT',
      s3Path,
      config.region,
      's3',
      payloadHash,
      headers
    );
    
    // Upload URL
    const uploadUrl = `${endpoint}/${config.bucketName}/${filePath}`;
    
    console.log('Uploading to URL:', uploadUrl);
    
    if (onProgress) onProgress(20);
    
    // Upload the file to S3 using XHR with progress tracking
    const xhr = new XMLHttpRequest();
    
    // Set up progress monitoring
    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          // Scale from 20-90%
          const percentComplete = 20 + Math.round((event.loaded / event.total) * 70);
          onProgress(percentComplete);
        }
      };
    }
    
    // Create a promise to handle the XHR response
    const uploadPromise = new Promise<S3UploadResult>((resolve, reject) => {
      xhr.open('PUT', uploadUrl, true);
      
      // Add all signed headers
      Object.keys(signedHeaders).forEach(key => {
        xhr.setRequestHeader(key, signedHeaders[key]);
      });
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log('S3 upload successful with status:', xhr.status);
          
          // Construct the public URL
          let publicUrl;
          
          if (config.publicUrlBase) {
            // Use the configured public URL base if provided
            const cleanPublicUrlBase = config.publicUrlBase.replace(/\/+$/, '');
            publicUrl = `${cleanPublicUrlBase}/${filePath}`;
          } else {
            // Construct URL based on the bucket and endpoint
            publicUrl = `${endpoint}/${config.bucketName}/${filePath}`;
          }
          
          // Indicate complete
          if (onProgress) onProgress(100);
          
          resolve({
            success: true,
            url: publicUrl
          });
        } else {
          console.error('B2 upload failed with status:', xhr.status);
          console.error('Response text:', xhr.responseText);
          if (onProgress) onProgress(0);
          reject(new Error(`B2 upload failed with status ${xhr.status}: ${xhr.responseText}`));
        }
      };
      
      xhr.onerror = () => {
        console.error('B2 upload network error');
        if (onProgress) onProgress(0);
        reject(new Error('Network error during B2 upload'));
      };
      
      xhr.onabort = () => {
        console.error('B2 upload aborted');
        if (onProgress) onProgress(0);
        reject(new Error('B2 upload was aborted'));
      };
      
      // Send the file
      xhr.send(file);
    });
    
    return await uploadPromise;
  } catch (error) {
    console.error('B2 upload error:', error);
    
    // Ensure we return 0 progress on error
    if (onProgress) {
      onProgress(0);
    }
    
    throw error;
  }
}

/**
 * Create AWS Signature V4 for S3 requests
 */
async function createSignatureV4(
  config: S3StorageConfig,
  method: string,
  path: string,
  region: string,
  service: string,
  payloadHash: string,
  headers: Record<string, string>
): Promise<Record<string, string>> {
  if (!config.secretAccessKey || !config.accessKeyId) {
    throw new Error('Missing S3 credentials');
  }
  
  // Format date and time for AWS signature
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substring(0, 8);
  
  // Add required headers
  const allHeaders = {
    ...headers,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': payloadHash
  };
  
  // Sort headers by lowercase key name (important for signature calculation)
  const sortedHeaderKeys = Object.keys(allHeaders).sort((a, b) => 
    a.toLowerCase().localeCompare(b.toLowerCase())
  );
  
  // Create canonical headers string with lowercase header names
  const canonicalHeaders = sortedHeaderKeys
    .map(key => `${key.toLowerCase()}:${allHeaders[key].trim()}\n`)
    .join('');
  
  // Create signed headers string with lowercase header names
  const signedHeaders = sortedHeaderKeys
    .map(key => key.toLowerCase())
    .join(';');
  
  // Create canonical request
  const canonicalUri = path.startsWith('/') ? path : `/${path}`;
  
  const canonicalRequest = [
    method.toUpperCase(),
    canonicalUri,
    '', // query string
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');
  
  // Create string to sign
  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  
  const canonicalRequestHash = crypto.createHash('sha256').update(canonicalRequest, 'utf8').digest('hex');
  
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    canonicalRequestHash
  ].join('\n');
  
  // Calculate signature
  const getSignatureKey = (key: string, dateStamp: string, regionName: string, serviceName: string) => {
    const kDate = crypto.createHmac('sha256', `AWS4${key}`).update(dateStamp).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(regionName).digest();
    const kService = crypto.createHmac('sha256', kRegion).update(serviceName).digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
    return kSigning;
  };
  
  const signingKey = getSignatureKey(config.secretAccessKey, dateStamp, region, service);
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');
  
  // Create authorization header
  const authorization = `${algorithm} ` +
    `Credential=${config.accessKeyId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, ` +
    `Signature=${signature}`;
  
  return {
    ...allHeaders,
    'Authorization': authorization
  };
}
