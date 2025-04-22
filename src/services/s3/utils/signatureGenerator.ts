
import { S3StorageConfig } from '../types';

/**
 * Create AWS Signature V4 for Backblaze B2 S3-compatible API
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
    // Get current date in ISO format
    const date = new Date();
    const amzDate = date.toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const dateStamp = amzDate.substring(0, 8);
    
    // Add required headers for AWS Signature V4
    const signedHeaders: Record<string, string> = {
      ...headers,
      'x-amz-date': amzDate,
      'x-amz-content-sha256': typeof payload === 'string' ? payload : 'UNSIGNED-PAYLOAD'
    };
    
    // Get the canonical request parts
    const canonicalURI = encodeRFC3986(path).replace(/%2F/g, '/');
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
    const canonicalRequest = [
      method,
      canonicalURI,
      canonicalQueryString,
      canonicalHeaders,
      signedHeadersString,
      typeof payload === 'string' ? payload : 'UNSIGNED-PAYLOAD'
    ].join('\n');
    
    // Create string to sign
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = [
      algorithm,
      amzDate,
      credentialScope,
      await hashString('SHA-256', canonicalRequest)
    ].join('\n');
    
    // Calculate signature
    const kDate = await hmacSha256('AWS4' + config.secretAccessKey, dateStamp);
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
 * Helper function to URL-encode strings per RFC3986
 */
function encodeRFC3986(str: string): string {
  return encodeURIComponent(str).replace(/[!'()*]/g, c => 
    '%' + c.charCodeAt(0).toString(16).toUpperCase()
  );
}

/**
 * Helper function to create HMAC-SHA256 signature
 */
async function hmacSha256(key: string | ArrayBuffer, message: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const messageBuffer = encoder.encode(message);
  
  let keyBuffer: ArrayBuffer;
  if (typeof key === 'string') {
    keyBuffer = encoder.encode(key);
  } else {
    keyBuffer = key;
  }
  
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
