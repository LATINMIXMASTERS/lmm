
import { S3StorageConfig } from './types';

/**
 * Helper function to convert string to hex
 */
export function stringToHex(str: string): string {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const hex = str.charCodeAt(i).toString(16);
    result += hex.length === 2 ? hex : '0' + hex;
  }
  return result;
}

/**
 * SHA-256 hash function (browser-compatible)
 */
export async function sha256(message: string): Promise<string> {
  // Convert the message string to an ArrayBuffer
  const msgBuffer = new TextEncoder().encode(message);
  // Hash the message
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  // Convert ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
    new TextEncoder().encode(message)
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
  payload: string,
  headers: Record<string, string>
): Promise<Record<string, string>> {
  // Format date and time for AWS signature
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substring(0, 8);
  
  // Add required headers
  headers['x-amz-date'] = amzDate;
  headers['x-amz-content-sha256'] = await sha256(payload || '');
  
  // Sort headers and create canonical headers string
  const sortedHeaderKeys = Object.keys(headers).sort();
  const canonicalHeaders = sortedHeaderKeys
    .map(key => `${key.toLowerCase()}:${headers[key]}\n`)
    .join('');
  const signedHeaders = sortedHeaderKeys.map(key => key.toLowerCase()).join(';');
  
  // Create canonical request
  const canonicalRequest = [
    method.toUpperCase(),
    '/' + path,
    '', // query string
    canonicalHeaders,
    signedHeaders,
    headers['x-amz-content-sha256']
  ].join('\n');
  
  console.log('Canonical request:', canonicalRequest);
  
  // Create string to sign
  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    await sha256(canonicalRequest)
  ].join('\n');
  
  console.log('String to sign:', stringToSign);
  
  // Calculate signature
  // Create the signing key
  let keyBytes = new TextEncoder().encode(`AWS4${config.secretAccessKey}`);
  let k1 = await hmacSha256(keyBytes, dateStamp);
  let k2 = await hmacSha256(k1, region);
  let k3 = await hmacSha256(k2, service);
  let k4 = await hmacSha256(k3, 'aws4_request');
  
  // Calculate the signature
  const signatureArrayBuffer = await hmacSha256(k4, stringToSign);
  const signatureBytes = new Uint8Array(signatureArrayBuffer);
  const signature = Array.from(signatureBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Create authorization header
  const authHeader = `${algorithm} ` +
    `Credential=${config.accessKeyId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, ` +
    `Signature=${signature}`;
  
  return {
    ...headers,
    'Authorization': authHeader
  };
}
