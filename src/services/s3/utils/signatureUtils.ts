
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
  const kSecret = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(`AWS4${config.secretAccessKey}`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const kDate = await crypto.subtle.sign(
    'HMAC',
    kSecret,
    new TextEncoder().encode(dateStamp)
  );
  
  const kRegion = await crypto.subtle.sign(
    'HMAC',
    await crypto.subtle.importKey(
      'raw',
      kDate,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ),
    new TextEncoder().encode(region)
  );
  
  const kService = await crypto.subtle.sign(
    'HMAC',
    await crypto.subtle.importKey(
      'raw',
      kRegion,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ),
    new TextEncoder().encode(service)
  );
  
  const kSigning = await crypto.subtle.sign(
    'HMAC',
    await crypto.subtle.importKey(
      'raw',
      kService,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ),
    new TextEncoder().encode('aws4_request')
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    await crypto.subtle.importKey(
      'raw',
      kSigning,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ),
    new TextEncoder().encode(stringToSign)
  );
  
  // Convert signature to hex
  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Create authorization header
  const authHeader = `${algorithm} ` +
    `Credential=${config.accessKeyId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, ` +
    `Signature=${signatureHex}`;
  
  return {
    ...allHeaders,
    'Authorization': authHeader
  };
}
