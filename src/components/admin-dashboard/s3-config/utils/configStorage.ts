
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
    accessKeyId: '',  // Added missing property
    secretAccessKey: '',  // Added missing property
    publicUrlBase: '',
  };
  
  const savedConfig = localStorage.getItem(STORAGE_KEY);
  if (!savedConfig) return defaultConfig;
  
  try {
    const parsedConfig = JSON.parse(savedConfig);
    console.log('Loaded S3 config from storage:', {
      hasBucket: !!parsedConfig.bucketName,
      hasRegion: !!parsedConfig.region,
      hasEndpoint: !!parsedConfig.endpoint,
      hasAccessKey: !!parsedConfig.accessKeyId,
      hasSecretKey: !!parsedConfig.secretAccessKey?.substring(0, 3) + '***'
    });
    return parsedConfig;
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
    
    // Clear any cached config
    if (typeof window !== 'undefined') {
      // Also clear the cached config in the S3 service
      localStorage.removeItem('s3_config_cache');
    }
    
    console.log('S3 config saved to storage:', {
      bucket: config.bucketName,
      region: config.region
    });
    
    return true;
  } catch (error) {
    console.error('Error saving S3 configuration:', error);
    return false;
  }
};
