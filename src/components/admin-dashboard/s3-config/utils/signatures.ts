
import { S3StorageConfig } from '../S3ConfigTypes';

/**
 * Create AWS Signature V4 for S3 requests
 * Optimized specifically for Backblaze B2 compatibility
 * Using browser-compatible Web Crypto API
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
    throw new Error('Missing Backblaze B2 credentials');
  }
  
  // Prepare date for signing
  const date = new Date();
  const amzDate = date.toISOString().replace(/[:\-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  
  // Add required headers
  const allHeaders: Record<string, string> = {
    ...headers,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': payloadHash
  };
  
  // Sort headers and create canonical headers string
  const sortedHeaderKeys = Object.keys(allHeaders).sort();
  const canonicalHeaders = sortedHeaderKeys
    .map(key => `${key.toLowerCase()}:${allHeaders[key].trim()}\n`)
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
  
  // Hash the canonical request using Web Crypto API
  const canonicalRequestHash = await sha256(canonicalRequest);
  
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    canonicalRequestHash
  ].join('\n');
  
  // Calculate signature using the Web Crypto API
  const signingKey = await getSignatureKey(config.secretAccessKey, dateStamp, region, service);
  const signature = await hexHmacSha256(signingKey, stringToSign);
  
  // Create authorization header
  const authorization = `${algorithm} ` +
    `Credential=${config.accessKeyId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, ` +
    `Signature=${signature}`;
  
  // Return all headers including the authorization
  return {
    ...allHeaders,
    'Authorization': authorization
  };
}

// Browser-compatible crypto helpers
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hmacSha256(key: ArrayBuffer, message: string): Promise<ArrayBuffer> {
  const msgBuffer = new TextEncoder().encode(message);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    false,
    ['sign']
  );
  return crypto.subtle.sign('HMAC', cryptoKey, msgBuffer);
}

async function hexHmacSha256(key: ArrayBuffer, message: string): Promise<string> {
  const signatureBuffer = await hmacSha256(key, message);
  return Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string): Promise<ArrayBuffer> {
  const kDate = await hmacSha256(
    new TextEncoder().encode(`AWS4${key}`),
    dateStamp
  );
  const kRegion = await hmacSha256(kDate, regionName);
  const kService = await hmacSha256(kRegion, serviceName);
  return hmacSha256(kService, 'aws4_request');
}
