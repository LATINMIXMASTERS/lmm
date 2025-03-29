
import { S3StorageConfig } from '../types';

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
  const canonicalUri = `/${path}`;
  
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
  
  // Calculate hash of canonical request
  const canonicalRequestHash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(canonicalRequest)
  );
  const canonicalRequestHashHex = Array.from(new Uint8Array(canonicalRequestHash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    canonicalRequestHashHex
  ].join('\n');
  
  // Calculate signature
  const kDate = await hmacSha256(
    `AWS4${config.secretAccessKey}`,
    dateStamp
  );
  
  const kRegion = await hmacSha256(
    kDate,
    region
  );
  
  const kService = await hmacSha256(
    kRegion,
    service
  );
  
  const kSigning = await hmacSha256(
    kService,
    'aws4_request'
  );
  
  const signature = await hmacSha256(
    kSigning,
    stringToSign
  );
  
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
 * Helper function to calculate HMAC SHA256
 */
async function hmacSha256(key: string, message: string): Promise<string> {
  const keyData = typeof key === 'string' 
    ? new TextEncoder().encode(key)
    : key;
  
  // Import the key
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    typeof keyData === 'string' ? new TextEncoder().encode(keyData) : keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  // Calculate HMAC
  const signature = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    new TextEncoder().encode(message)
  );
  
  // Convert to hex string
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
