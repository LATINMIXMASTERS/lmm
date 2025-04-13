
import { S3StorageConfig, S3UploadResult } from './types';
import * as crypto from 'crypto';

/**
 * Creates AWS Signature and uploads a file to S3-compatible storage
 * Fixed for Backblaze B2 compatibility
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
      // Fallback to B2 specific endpoint format
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
    
    // Initialize progress tracking
    if (onProgress) onProgress(5);
    
    // Create the full path for the signature - use bucket name for Backblaze
    // Backblaze path format is <bucket_name>/<file_path>
    const s3Path = `${config.bucketName}/${filePath}`;
    
    // Set appropriate content-type based on file
    const contentType = file.type || 'application/octet-stream';
    
    // Standard headers for S3 upload with Backblaze-specific additions
    const headers: Record<string, string> = {
      'Host': host,
      'Content-Type': contentType,
      'Content-Length': file.size.toString(),
      'Cache-Control': 'public, max-age=31536000',
      'x-amz-acl': 'public-read'  // Add this to ensure files are publicly readable
    };
    
    // Use 'UNSIGNED-PAYLOAD' for browser compatibility
    const payloadHash = 'UNSIGNED-PAYLOAD';
    
    if (onProgress) onProgress(10);
    
    console.log('Preparing signature for upload to:', {
      endpoint,
      bucket: config.bucketName,
      path: filePath,
      region: config.region,
      host,
      fileType: contentType,
      fileSize: file.size
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
    
    // Construct the full upload URL for Backblaze
    const uploadUrl = `${endpoint}/${config.bucketName}/${filePath}`;
    
    console.log('Uploading to URL:', uploadUrl);
    
    if (onProgress) onProgress(20);
    
    // Upload the file using a promise-based XHR for better error handling
    return new Promise<S3UploadResult>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            // Scale from 20-95% for upload progress
            const percentComplete = 20 + Math.round((event.loaded / event.total) * 75);
            onProgress(Math.min(percentComplete, 95));
          }
        };
      }
      
      xhr.open('PUT', uploadUrl, true);
      
      // Add all signed headers
      Object.keys(signedHeaders).forEach(key => {
        xhr.setRequestHeader(key, signedHeaders[key]);
      });
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log('B2 upload successful with status:', xhr.status);
          
          // Construct the public URL based on configs
          let publicUrl;
          if (config.publicUrlBase) {
            // Use custom CDN or endpoint if provided
            publicUrl = `${config.publicUrlBase.replace(/\/+$/, '')}/${filePath}`;
          } else {
            // Use standard B2 URL format
            publicUrl = `${endpoint}/${config.bucketName}/${filePath}`;
          }
          
          // Complete progress
          if (onProgress) onProgress(100);
          
          resolve({
            success: true,
            url: publicUrl
          });
        } else {
          console.error('B2 upload failed with status:', xhr.status);
          console.error('Response text:', xhr.responseText);
          if (onProgress) onProgress(0);
          
          let errorMsg = `Upload failed with status ${xhr.status}`;
          try {
            // Try to parse XML error response
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xhr.responseText, "text/xml");
            const code = xmlDoc.getElementsByTagName("Code")[0]?.textContent;
            const message = xmlDoc.getElementsByTagName("Message")[0]?.textContent;
            if (code || message) {
              errorMsg = `${code || 'Error'}: ${message || xhr.responseText}`;
            }
          } catch (e) {
            console.error("Error parsing response:", e);
          }
          
          reject(new Error(errorMsg));
        }
      };
      
      xhr.onerror = () => {
        console.error('B2 upload network error');
        if (onProgress) onProgress(0);
        reject(new Error('Network error during B2 upload. Check your network connection and B2 configuration.'));
      };
      
      xhr.ontimeout = () => {
        console.error('B2 upload timed out');
        if (onProgress) onProgress(0);
        reject(new Error('Upload timed out. Try with a smaller file or check your network connection.'));
      };
      
      // Set timeout to prevent hanging uploads
      xhr.timeout = 120000; // 2 minutes timeout
      
      // Send the file
      try {
        xhr.send(file);
      } catch (e) {
        console.error('Error sending file:', e);
        if (onProgress) onProgress(0);
        reject(new Error(`Error sending file: ${e instanceof Error ? e.message : 'Unknown error'}`));
      }
    });
  } catch (error) {
    console.error('Error preparing S3 upload:', error);
    
    // Ensure we return 0 progress on error
    if (onProgress) {
      onProgress(0);
    }
    
    throw error;
  }
}

/**
 * Create AWS Signature V4 for S3 requests
 * Fixed implementation for Backblaze B2 compatibility
 */
function createSignatureV4(
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
  
  // Create canonical request - critical for correct Backblaze signature
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
  
  return Promise.resolve({
    ...allHeaders,
    'Authorization': authorization
  });
}
