
import { uploadFileToS3 as s3Upload } from './s3/uploader';
import { getS3Config, isS3Configured as checkS3Config } from './s3/config';

/**
 * Upload a file to S3 or fall back to localStorage
 */
export const uploadFileToS3 = async (
  file: File,
  folder: string = 'uploads',
  onProgress?: (progress: number) => void
) => {
  try {
    console.log(`Uploading file ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB) to folder ${folder}...`);
    
    // Check if file is too large (over 250MB)
    if (file.size > 250 * 1024 * 1024) {
      console.error('File exceeds maximum size limit of 250MB');
      if (onProgress) onProgress(0);
      return {
        success: false,
        url: '',
        error: 'File exceeds maximum size limit of 250MB'
      };
    }

    // Always require S3 for audio files over 10MB
    const isLargeFile = file.size > 10 * 1024 * 1024;
    const s3Available = checkS3Config();
    
    if (isLargeFile && !s3Available) {
      console.warn('File is too large for local storage and S3 is not configured');
      if (onProgress) onProgress(0);
      return {
        success: false,
        url: '',
        error: 'This file is too large for browser storage. Please configure S3 storage for uploads over 10MB.'
      };
    }
    
    // Use S3 if available, otherwise fallback
    const result = await s3Upload(file, folder, onProgress);
    
    console.log('Upload result:', result);
    return result;
  } catch (error) {
    console.error('Error in S3 upload service:', error);
    if (onProgress) onProgress(0);
    
    return {
      success: false,
      url: '',
      error: error instanceof Error 
        ? error.message
        : 'Unknown upload error. Check browser storage quota or S3 configuration.'
    };
  }
};

/**
 * Check if S3 is properly configured
 */
export const isS3Configured = () => {
  return checkS3Config();
};

/**
 * Get the current S3 configuration
 */
export const getS3Configuration = () => {
  const config = getS3Config();
  
  // Return a sanitized version without the secret key
  if (config) {
    const { secretAccessKey, ...safeConfig } = config;
    return {
      ...safeConfig,
      hasSecretKey: !!secretAccessKey
    };
  }
  
  return null;
};
