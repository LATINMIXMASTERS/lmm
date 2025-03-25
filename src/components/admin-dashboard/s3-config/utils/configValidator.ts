
import { S3StorageConfig } from '../S3ConfigTypes';

/**
 * Check if the configuration is complete
 */
export const isConfigComplete = (config: S3StorageConfig): boolean => {
  return !!(
    config.bucketName && 
    config.region && 
    config.accessKeyId && 
    config.secretAccessKey
  );
};
