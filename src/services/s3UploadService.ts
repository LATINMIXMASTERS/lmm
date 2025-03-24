
import { fileToDataUrl } from './imageUploadService';
import { S3StorageConfig } from '@/components/admin-dashboard/s3-config/S3ConfigTypes';

/**
 * Gets the S3 configuration from localStorage
 */
export const getS3Config = (): S3StorageConfig | null => {
  const savedConfig = localStorage.getItem('latinmixmasters_s3config');
  if (!savedConfig) return null;
  
  try {
    return JSON.parse(savedConfig);
  } catch (error) {
    console.error('Error parsing S3 configuration:', error);
    return null;
  }
};

/**
 * Check if S3 storage is properly configured
 */
export const isS3Configured = (): boolean => {
  const config = getS3Config();
  if (!config) {
    console.warn('No S3 configuration found');
    return false;
  }
  
  if (!config.bucketName || !config.region || !config.accessKeyId || !config.secretAccessKey) {
    console.warn('Incomplete S3 configuration', { 
      hasBucket: !!config.bucketName, 
      hasRegion: !!config.region,
      hasAccessKey: !!config.accessKeyId,
      hasSecretKey: !!config.secretAccessKey
    });
    return false;
  }
  
  return true;
};

/**
 * Generate a unique file name for S3 uploads
 */
export const generateS3FileName = (file: File): string => {
  const timestamp = new Date().getTime();
  const randomString = Math.random().toString(36).substring(2, 10);
  const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '-');
  const extension = safeFileName.split('.').pop();
  return `${timestamp}-${randomString}.${extension}`;
};

// Helper function to convert string to hex
function stringToHex(str: string): string {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const hex = str.charCodeAt(i).toString(16);
    result += hex.length === 2 ? hex : '0' + hex;
  }
  return result;
}

// SHA-256 hash function (browser-compatible)
async function sha256(message: string): Promise<string> {
  // Convert the message string to an ArrayBuffer
  const msgBuffer = new TextEncoder().encode(message);
  // Hash the message
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  // Convert ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper function to create HMAC signature (browser-compatible)
async function hmacSha256(key: ArrayBuffer, message: string): Promise<ArrayBuffer> {
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
async function createSignatureV4(
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
  let key = new TextEncoder().encode(`AWS4${config.secretAccessKey}`);
  key = await hmacSha256(key, dateStamp);
  key = await hmacSha256(key, region);
  key = await hmacSha256(key, service);
  key = await hmacSha256(key, 'aws4_request');
  
  // Calculate the signature
  const signature = stringToHex(new Uint8Array(await hmacSha256(key, stringToSign)));
  
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

/**
 * Upload a file to S3-compatible storage using fetch API
 */
export const uploadFileToS3 = async (
  file: File,
  folder: string = 'audio',
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; url: string; error?: string }> => {
  // Log the upload attempt
  console.log(`Attempting to upload file to S3: ${file.name} (${file.size} bytes) to folder: ${folder}`);
  
  const config = getS3Config();
  
  if (!config || !isS3Configured()) {
    console.warn('S3 storage is not configured properly. Using fallback storage method.');
    return uploadToLocalStorage(file, folder, onProgress);
  }

  try {
    // Generate a unique file name for S3
    const fileName = generateS3FileName(file);
    const s3Path = `${config.bucketName}/${folder}/${fileName}`;
    
    // Initialize progress reporting
    if (onProgress) {
      onProgress(0);
    }
    
    // Determine the endpoint URL, removing any trailing slashes
    const endpoint = config.endpoint?.replace(/\/$/, '') || `https://s3.${config.region}.wasabisys.com`;
    const host = new URL(endpoint).host;
    
    // Prepare the request URL (without the bucket in the path for signature calculation)
    const uploadUrl = `${endpoint}/${folder}/${fileName}`;
    console.log(`Uploading to S3 URL: ${uploadUrl}`);
    
    // Prepare headers for signature
    const headers: Record<string, string> = {
      'Host': host,
      'Content-Type': file.type || 'application/octet-stream'
    };
    
    // Generate AWS signature v4
    const signedHeaders = await createSignatureV4(
      config,
      'PUT',
      `${folder}/${fileName}`,
      config.region,
      's3',
      'UNSIGNED-PAYLOAD',
      headers
    );
    
    console.log('Signed headers:', signedHeaders);
    
    // Upload the file to S3 using fetch API with proper AWS auth
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: signedHeaders,
      body: file
    });
    
    console.log("S3 response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("S3 upload error response:", errorText);
      throw new Error(`S3 upload failed with status ${response.status}: ${errorText}`);
    }
    
    // Update progress to 100% on successful upload
    if (onProgress) {
      onProgress(100);
    }
    
    // Construct the public URL
    let publicUrl;
    
    if (config.publicUrlBase) {
      // Use the configured public base URL if provided
      publicUrl = `${config.publicUrlBase.replace(/\/$/, '')}/${folder}/${fileName}`;
    } else {
      // Construct URL based on the bucket endpoint
      publicUrl = `${endpoint}/${folder}/${fileName}`;
    }
    
    console.log(`S3 upload successful. Public URL: ${publicUrl}`);
    
    return {
      success: true,
      url: publicUrl
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return {
      success: false,
      url: '',
      error: error instanceof Error ? error.message : 'Unknown upload error'
    };
  }
};

/**
 * Fallback method to use local storage when S3 is not configured
 */
const uploadToLocalStorage = async (
  file: File,
  folder: string = 'audio',
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; url: string; error?: string }> => {
  try {
    console.log('Using local storage fallback for file upload');
    const dataUrl = await fileToDataUrl(file);
    
    // Simulate upload progress
    if (onProgress) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        onProgress(progress > 100 ? 100 : progress);
        if (progress >= 100) clearInterval(interval);
      }, 200);
    }
    
    // Simulate network delay
    const delay = Math.min(2000, file.size / 50000);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return {
      success: true,
      url: dataUrl
    };
  } catch (error) {
    console.error('Error with local storage fallback:', error);
    return {
      success: false,
      url: '',
      error: 'Failed to process file for local storage'
    };
  }
};
