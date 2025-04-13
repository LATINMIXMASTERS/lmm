
/**
 * Create AWS Signature V4 for S3 requests
 * Optimized specifically for Backblaze B2 compatibility
 * Using browser-compatible crypto implementation
 */

import { S3StorageConfig } from '../types';

// Browser-compatible crypto helpers
function sha256(message: string): Promise<string> {
  // Convert message to array buffer for Web Crypto API
  const msgBuffer = new TextEncoder().encode(message);
  
  // Use Web Crypto API for SHA-256 hashing
  return crypto.subtle.digest('SHA-256', msgBuffer).then(hashBuffer => {
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  });
}

async function hmacSha256(key: ArrayBuffer, message: string): Promise<ArrayBuffer> {
  const msgBuffer = new TextEncoder().encode(message);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return crypto.subtle.sign('HMAC', cryptoKey, msgBuffer);
}

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
  
  // If region is empty or undefined, use a default value to prevent errors
  const safeRegion = region || 'us-west-004';
  
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
  const sortedHeaderKeys = Object.keys(allHeaders).sort();
  
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
  const credentialScope = `${dateStamp}/${safeRegion}/${service}/aws4_request`;
  
  const canonicalRequestHash = await sha256(canonicalRequest);
  
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    canonicalRequestHash
  ].join('\n');
  
  // Calculate signature using Web Crypto API for Backblaze B2 compatibility
  async function getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string) {
    const kDate = await hmacSha256(
      new TextEncoder().encode(`AWS4${key}`),
      dateStamp
    );
    const kRegion = await hmacSha256(kDate, regionName);
    const kService = await hmacSha256(kRegion, serviceName);
    const kSigning = await hmacSha256(kService, 'aws4_request');
    return kSigning;
  }
  
  const signingKey = await getSignatureKey(config.secretAccessKey, dateStamp, safeRegion, service);
  
  // Convert ArrayBuffer to hex string
  const signatureArray = new Uint8Array(await hmacSha256(signingKey, stringToSign));
  const signature = Array.from(signatureArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
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
