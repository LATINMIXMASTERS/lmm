
import { S3StorageConfig } from '../S3ConfigTypes';

/**
 * Load the S3 configuration from localStorage
 */
export const loadS3Config = (): S3StorageConfig => {
  const defaultConfig: S3StorageConfig = {
    bucketName: '',
    region: 'us-east-1',
    endpoint: '',
    publicUrlBase: '',
  };
  
  const savedConfig = localStorage.getItem('latinmixmasters_s3config');
  if (!savedConfig) return defaultConfig;
  
  try {
    return JSON.parse(savedConfig);
  } catch (error) {
    console.error('Error parsing saved S3 configuration:', error);
    return defaultConfig;
  }
};

/**
 * Save the S3 configuration to localStorage
 */
export const saveS3Config = (config: S3StorageConfig): boolean => {
  try {
    localStorage.setItem('latinmixmasters_s3config', JSON.stringify(config));
    return true;
  } catch (error) {
    console.error('Error saving S3 configuration:', error);
    return false;
  }
};
