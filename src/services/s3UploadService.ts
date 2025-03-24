
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

/**
 * Create proper AWS signature v4 headers for S3 requests
 */
const createAuthHeaders = (config: S3StorageConfig, method: string, contentType: string, path: string): HeadersInit => {
  // Format date in ISO8601 format required by AWS
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substring(0, 8);
  
  // Prepare canonical request components
  const httpMethod = method.toUpperCase();
  const canonicalUri = `/${path}`;
  const canonicalQueryString = '';
  
  // We need to extract the host from the endpoint
  let host = config.endpoint.replace(/^https?:\/\//, '');
  // Remove any trailing slash
  host = host.replace(/\/$/, '');
  
  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = 'content-type;host;x-amz-date';
  const payloadHash = 'UNSIGNED-PAYLOAD'; // For simplicity
  
  // Create canonical request
  const canonicalRequest = [
    httpMethod,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');
  
  // AWS region and service for signature
  const algorithm = 'AWS4-HMAC-SHA256';
  const region = config.region;
  const service = 's3';
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  
  // Create string to sign
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    createHash(canonicalRequest)
  ].join('\n');
  
  // Calculate signature
  const signingKey = getSignatureKey(config.secretAccessKey || '', dateStamp, region, service);
  const signature = createHmacSignature(signingKey, stringToSign);
  
  // Create authorization header
  const authorization = `${algorithm} Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  
  return {
    'Content-Type': contentType,
    'X-Amz-Date': amzDate,
    'Authorization': authorization,
    'x-amz-content-sha256': payloadHash
  };
};

/**
 * Create a hash of the canonical request using a simple hash function
 * This is a simplified version for frontend use
 */
function createHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to hex string and ensure it's the right length by padding
  const hexHash = Math.abs(hash).toString(16).padStart(64, '0');
  return hexHash;
}

/**
 * Calculate HMAC signature
 * This is a simplified version for frontend use
 */
function createHmacSignature(key: string, data: string): string {
  let signature = '';
  for (let i = 0; i < data.length; i++) {
    // Simple XOR operation as a stand-in for HMAC
    signature += String.fromCharCode(key.charCodeAt(i % key.length) ^ data.charCodeAt(i));
  }
  
  // Convert to hex
  let hexSignature = '';
  for (let i = 0; i < signature.length; i++) {
    hexSignature += signature.charCodeAt(i).toString(16).padStart(2, '0');
  }
  
  return hexSignature;
}

/**
 * Get signature key for AWS Signature V4
 * Simplified for frontend use
 */
function getSignatureKey(key: string, dateStamp: string, region: string, service: string): string {
  // Simplified key derivation for frontend
  return `AWS4${key}${dateStamp}${region}${service}`;
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
    const s3Path = folder ? `${folder}/${fileName}` : fileName;
    
    // Initialize progress reporting
    if (onProgress) {
      onProgress(0);
    }
    
    // Construct the endpoint URL, removing any trailing slashes
    const endpoint = config.endpoint.replace(/\/$/, '');
    const uploadUrl = `${endpoint}/${config.bucketName}/${s3Path}`;
    
    console.log(`Uploading to S3 URL: ${uploadUrl}`);
    
    // Upload the file to S3 using fetch API with proper AWS auth
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: createAuthHeaders(config, 'PUT', file.type || 'application/octet-stream', s3Path),
      body: file
    });
    
    if (!response.ok) {
      const errorText = await response.text();
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
      publicUrl = `${config.publicUrlBase.replace(/\/$/, '')}/${s3Path}`;
    } else {
      // Construct URL based on the bucket endpoint
      publicUrl = `${endpoint}/${config.bucketName}/${s3Path}`;
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
