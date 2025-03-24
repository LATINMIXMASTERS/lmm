
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
 * Create AWS formatted authorization headers for S3 requests
 */
const createAuthHeaders = (config: S3StorageConfig, method: string, contentType: string, path: string): HeadersInit => {
  const date = new Date().toUTCString();
  const contentMD5 = ''; // Not using content MD5 for simplicity

  // Create the string to sign (simplified version, production would use proper AWS signature)
  const stringToSign = `${method}\n${contentMD5}\n${contentType}\n${date}\n/${config.bucketName}/${path}`;
  
  // In a real implementation, you would create a proper AWS signature here
  // This is a simplified version for demonstration purposes
  
  return {
    'Date': date,
    'Content-Type': contentType,
    'Authorization': `AWS ${config.accessKeyId}:${config.secretAccessKey}`,
    'x-amz-acl': 'public-read'
  };
};

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
    
    // Construct the endpoint URL
    const endpoint = config.endpoint || `https://s3.${config.region}.wasabisys.com`;
    const uploadUrl = `${endpoint}/${config.bucketName}/${s3Path}`;
    
    console.log(`Uploading to S3 URL: ${uploadUrl}`);
    
    // Upload the file to S3 using fetch API
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: createAuthHeaders(config, 'PUT', file.type, s3Path),
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
    } else if (config.endpoint) {
      // Construct URL from endpoint if available (Wasabi typically uses this format)
      publicUrl = `${config.endpoint.replace(/\/$/, '')}/${config.bucketName}/${s3Path}`;
    } else {
      // Default S3 URL format for Wasabi
      publicUrl = `https://s3.${config.region}.wasabisys.com/${config.bucketName}/${s3Path}`;
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
