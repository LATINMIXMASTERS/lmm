
/**
 * Cryptographic utilities for AWS signature calculation
 */

// Convert string to Uint8Array
export function stringToUint8Array(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

// Calculate SHA-256 hash
export async function sha256(message: string): Promise<string> {
  const msgBuffer = stringToUint8Array(message);
  
  // Use the crypto subtle API
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  
  return bufferToHex(hashBuffer);
}

// Calculate HMAC-SHA256
export async function hmacSha256(key: Uint8Array, message: string): Promise<ArrayBuffer> {
  const algorithm = { name: 'HMAC', hash: 'SHA-256' };
  
  // Convert the key to a proper crypto key
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    algorithm,
    false,
    ['sign']
  );
  
  // Calculate the HMAC
  return crypto.subtle.sign(
    algorithm.name,
    cryptoKey,
    stringToUint8Array(message)
  );
}

// Convert ArrayBuffer to hex string
export function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
