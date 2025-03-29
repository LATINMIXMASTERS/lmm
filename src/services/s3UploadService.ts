
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
    console.log(`Uploading file ${file.name} to folder ${folder}...`);
    
    // Directly use the uploader service
    const result = await s3Upload(file, folder, onProgress);
    
    console.log('Upload result:', result);
    return result;
  } catch (error) {
    console.error('Error in S3 upload service:', error);
    if (onProgress) onProgress(0);
    
    return {
      success: false,
      url: '',
      error: error instanceof Error ? error.message : 'Unknown upload error'
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
