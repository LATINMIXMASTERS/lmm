
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
      'x-amz-content-sha256': 'UNSIGNED-PAYLOAD'
    };
    
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
    
    // Create canonical request with fixed payload hash
    const canonicalRequest = [
      method,
      canonicalURI,
      canonicalQueryString,
      canonicalHeaders,
      signedHeadersString,
      'UNSIGNED-PAYLOAD'
    ].join('\n');
    
    // Create string to sign
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;

    // Hash the canonical request using the Web Crypto API
    const canonicalRequestHash = await hashString(canonicalRequest);
    
    const stringToSign = [
      algorithm,
      amzDate,
      credentialScope,
      canonicalRequestHash
    ].join('\n');
    
    // Calculate signature using explicit browser-compatible implementations
    const kDate = await hmacSha256(`AWS4${config.secretAccessKey}`, dateStamp);
    const kRegion = await hmacSha256ArrayBuffer(kDate, region);
    const kService = await hmacSha256ArrayBuffer(kRegion, service); 
    const kSigning = await hmacSha256ArrayBuffer(kService, 'aws4_request');
    const signature = await hmacSha256ArrayBufferToHex(kSigning, stringToSign);
    
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
 * Helper function to create HMAC-SHA256 signature from string key
 */
async function hmacSha256(key: string, message: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const messageBuffer = encoder.encode(message);
  const keyBuffer = encoder.encode(key).buffer;
  
  // Create a crypto key using the Web Crypto API
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    false,
    ['sign']
  );
  
  return await window.crypto.subtle.sign('HMAC', cryptoKey, messageBuffer);
}

/**
 * Helper function to create HMAC-SHA256 signature from ArrayBuffer key
 */
async function hmacSha256ArrayBuffer(key: ArrayBuffer, message: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const messageBuffer = encoder.encode(message);
  
  // Create a crypto key using the Web Crypto API
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    false,
    ['sign']
  );
  
  return await window.crypto.subtle.sign('HMAC', cryptoKey, messageBuffer);
}

/**
 * Helper function to create HMAC-SHA256 signature from ArrayBuffer and convert to hex
 */
async function hmacSha256ArrayBufferToHex(key: ArrayBuffer, message: string): Promise<string> {
  const signature = await hmacSha256ArrayBuffer(key, message);
  return arrayBufferToHex(signature);
}

/**
 * Helper function to hash a string using SHA-256
 */
async function hashString(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hash = await window.crypto.subtle.digest('SHA-256', data);
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
