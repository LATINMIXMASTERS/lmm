
import { S3StorageConfig } from './types';

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
  // Ensure path has a leading slash, no spaces, and is properly encoded
  const canonicalUri = path.startsWith('/') ? path : `/${path}`;
  
  const canonicalRequest = [
    method.toUpperCase(),
    canonicalUri,
    '', // query string
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');
  
  console.log('Canonical request:', canonicalRequest);
  
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
  
  console.log('String to sign:', stringToSign);
  
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
