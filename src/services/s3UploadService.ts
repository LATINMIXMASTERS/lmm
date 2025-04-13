
import { uploadFileToS3 as s3Upload } from './s3/uploader';
import { getS3Config, isS3Configured as checkS3Config } from './s3/config';

/**
 * Upload a file to S3 Backblaze B2
 */
export const uploadFileToS3 = async (
  file: File,
  folder: string = 'uploads',
  onProgress?: (progress: number) => void
) => {
  try {
    // Check file size limits
    if (folder.includes('audio') && file.size > 250 * 1024 * 1024) {
      return {
        success: false,
        url: '',
        error: 'Audio file exceeds maximum size limit of 250MB'
      };
    }
    
    if ((folder.includes('covers') || folder.includes('image')) && file.size > 1 * 1024 * 1024) {
      return {
        success: false,
        url: '',
        error: 'Image file exceeds maximum size limit of 1MB'
      };
    }
    
    // Check if S3 is configured - now mandatory
    const s3Available = checkS3Config();
    
    if (!s3Available) {
      return {
        success: false,
        url: '',
        error: 'S3 storage configuration is required for all uploads. Please configure S3 storage in admin settings.'
      };
    }
    
    // Use S3 for all uploads - no fallback
    return await s3Upload(file, folder, onProgress);
  } catch (error) {
    console.error('Error in S3 upload service:', error);
    if (onProgress) onProgress(0);
    
    return {
      success: false,
      url: '',
      error: error instanceof Error 
        ? error.message
        : 'Upload error. Please check S3 configuration.'
    };
  }
};

/**
 * Check if S3 is properly configured
 */
export const isS3Configured = checkS3Config;

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
