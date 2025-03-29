
import { S3StorageConfig } from '../S3ConfigTypes';

// Use the same storage key as the main S3 service
const STORAGE_KEY = 'latinmixmasters_s3config';

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
  
  const savedConfig = localStorage.getItem(STORAGE_KEY);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    // Also clear any cached config
    if (typeof window !== 'undefined') {
      localStorage.removeItem('s3_config_cache');
    }
    return true;
  } catch (error) {
    console.error('Error saving S3 configuration:', error);
    return false;
  }
};
