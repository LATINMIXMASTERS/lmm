
import { S3StorageConfig } from '../types';

/**
 * Create AWS Signature V4 for Backblaze B2 S3-compatible API
 * Using browser-compatible Web Crypto API
 */
export async function createSignatureV4(
  config: S3StorageConfig,
  method: string,
  path: string,
  region: string,
  service: string,
  payload: string | ArrayBuffer,
  headers: Record<string, string>
): Promise<Record<string, string>> {
  try {
    if (!config.secretAccessKey || !config.accessKeyId) {
      throw new Error('Missing Backblaze B2 credentials');
    }

    // Get current date in ISO format
    const date = new Date();
    const amzDate = date.toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const dateStamp = amzDate.substring(0, 8);
    
    // Add required headers for AWS Signature V4
    const signedHeaders: Record<string, string> = {
      ...headers,
      'x-amz-date': amzDate,
    };
    
    // Add content hash header if payload is a string
    if (typeof payload === 'string') {
      signedHeaders['x-amz-content-sha256'] = await hashString('SHA-256', payload);
    } else {
      signedHeaders['x-amz-content-sha256'] = 'UNSIGNED-PAYLOAD';
    }
    
    // Get the canonical request parts
    const canonicalURI = path.startsWith('/') ? path : `/${path}`;
    const canonicalQueryString = '';
    
    // Generate canonical headers string
    const canonicalHeadersArray = Object.keys(signedHeaders)
      .sort()
      .map(key => `${key.toLowerCase()}:${signedHeaders[key].trim()}`);
    
    const canonicalHeaders = canonicalHeadersArray.join('\n') + '\n';
    
    // Generate signed headers string
    const signedHeadersString = Object.keys(signedHeaders)
      .sort()
      .map(key => key.toLowerCase())
      .join(';');
    
    // Create canonical request
    let payloadHash = 'UNSIGNED-PAYLOAD';
    if (typeof payload === 'string') {
      payloadHash = await hashString('SHA-256', payload);
    }
    
    const canonicalRequest = [
      method,
      canonicalURI,
      canonicalQueryString,
      canonicalHeaders,
      signedHeadersString,
      payloadHash
    ].join('\n');
    
    // Create string to sign
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;

    // Hash the canonical request - using the browser Web Crypto API
    const canonicalRequestHash = await hashString('SHA-256', canonicalRequest);
    
    const stringToSign = [
      algorithm,
      amzDate,
      credentialScope,
      canonicalRequestHash
    ].join('\n');
    
    // Calculate signature - with explicit browser-compatible implementations
    const kDate = await hmacSha256(`AWS4${config.secretAccessKey}`, dateStamp);
    const kRegion = await hmacSha256(kDate, region);
    const kService = await hmacSha256(kRegion, service);
    const kSigning = await hmacSha256(kService, 'aws4_request');
    const signature = await hmacSha256ToHex(kSigning, stringToSign);
    
    // Add Authorization header
    const authHeader = [
      `${algorithm} Credential=${config.accessKeyId}/${credentialScope}`,
      `SignedHeaders=${signedHeadersString}`,
      `Signature=${signature}`
    ].join(', ');
    
    return {
      ...signedHeaders,
      'Authorization': authHeader
    };
  } catch (error) {
    console.error('Error creating AWS signature:', error);
    throw error;
  }
}

/**
 * Helper function to create HMAC-SHA256 signature
 * Properly implemented for browser environment
 */
async function hmacSha256(key: string | ArrayBuffer, message: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const messageBuffer = encoder.encode(message);
  
  let keyBuffer: ArrayBuffer;
  if (typeof key === 'string') {
    keyBuffer = encoder.encode(key).buffer;
  } else {
    keyBuffer = key;
  }
  
  // Create a crypto key using the Web Crypto API
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    false,
    ['sign']
  );
  
  return await crypto.subtle.sign('HMAC', cryptoKey, messageBuffer);
}

/**
 * Helper function to create HMAC-SHA256 signature and convert to hex
 */
async function hmacSha256ToHex(key: ArrayBuffer, message: string): Promise<string> {
  const signature = await hmacSha256(key, message);
  return arrayBufferToHex(signature);
}

/**
 * Helper function to hash a string using the specified algorithm
 */
async function hashString(algorithm: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hash = await crypto.subtle.digest(algorithm, data);
  return arrayBufferToHex(hash);
}

/**
 * Helper function to convert ArrayBuffer to hex string
 */
function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
