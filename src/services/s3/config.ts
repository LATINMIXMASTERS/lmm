
import { S3StorageConfig } from './types';

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
