
import { S3StorageConfig, S3UploadResult } from './types';

/**
 * Helper function to convert ArrayBuffer to hex string
 */
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert string to Uint8Array for crypto operations
 */
function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * SHA-256 hash function (browser-compatible)
 */
export async function sha256(message: string): Promise<string> {
  const msgBuffer = stringToUint8Array(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return bufferToHex(hashBuffer);
}

/**
 * Helper function to create HMAC signature (browser-compatible)
 */
export async function hmacSha256(key: ArrayBuffer, message: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    stringToUint8Array(message)
  );
}

/**
 * Create AWS Signature V4 for S3 requests
 */
export async function createSignatureV4(
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
  
  // Sort headers and create canonical headers string
  const sortedHeaderKeys = Object.keys(allHeaders).sort();
  const canonicalHeaders = sortedHeaderKeys
    .map(key => `${key.toLowerCase()}:${allHeaders[key]}\n`)
    .join('');
  const signedHeaders = sortedHeaderKeys.map(key => key.toLowerCase()).join(';');
  
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
  
  const stringToSignHash = await sha256(canonicalRequest);
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    stringToSignHash
  ].join('\n');
  
  // Calculate signature
  // Create the signing key
  const kDate = await hmacSha256(
    stringToUint8Array(`AWS4${config.secretAccessKey}`),
    dateStamp
  );
  
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  const kSigning = await hmacSha256(kService, 'aws4_request');
  
  // Calculate the signature
  const signatureArrayBuffer = await hmacSha256(kSigning, stringToSign);
  const signature = bufferToHex(signatureArrayBuffer);
  
  // Create authorization header
  const authHeader = `${algorithm} ` +
    `Credential=${config.accessKeyId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, ` +
    `Signature=${signature}`;
  
  return {
    ...allHeaders,
    'Authorization': authHeader
  };
}

/**
 * Handles the full AWS signature and upload process
 */
export async function createAwsSignature(
  config: S3StorageConfig,
  file: File,
  filePath: string,
  onProgress?: (progress: number) => void
): Promise<S3UploadResult> {
  try {
    // Determine the endpoint URL, removing any trailing slashes
    const endpoint = config.endpoint?.replace(/\/$/, '') || 
      `https://s3.${config.region}.wasabisys.com`;
    const host = new URL(endpoint).host;
    
    // Prepare headers for signature
    const headers: Record<string, string> = {
      'Host': host,
      'Content-Type': file.type || 'application/octet-stream',
      // Ensure proper cache control
      'Cache-Control': 'public, max-age=31536000'
    };
    
    // Use 'UNSIGNED-PAYLOAD' for browser compatibility
    const payloadHash = 'UNSIGNED-PAYLOAD';
    
    // Generate AWS signature v4
    const signedHeaders = await createSignatureV4(
      config,
      'PUT',
      `${config.bucketName}/${filePath}`,
      config.region,
      's3',
      payloadHash,
      headers
    );
    
    // Upload URL
    const uploadUrl = `${endpoint}/${config.bucketName}/${filePath}`;
    
    console.log('Uploading to URL:', uploadUrl);
    console.log('With headers:', signedHeaders);
    
    // Upload the file to S3 using fetch API
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: signedHeaders,
      body: file
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('S3 error response:', errorText);
      throw new Error(`S3 upload failed with status ${response.status}: ${errorText}`);
    }
    
    // Construct the public URL
    let publicUrl;
    
    if (config.publicUrlBase) {
      // Use the configured public base URL if provided
      publicUrl = `${config.publicUrlBase.replace(/\/$/, '')}/${filePath}`;
    } else {
      // Construct URL based on the bucket endpoint
      publicUrl = `${endpoint}/${config.bucketName}/${filePath}`;
    }
    
    return {
      success: true,
      url: publicUrl
    };
  } catch (error) {
    console.error('S3 upload error details:', error);
    throw error;
  }
}
