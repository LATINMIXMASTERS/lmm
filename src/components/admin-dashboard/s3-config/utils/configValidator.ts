
import { S3StorageConfig } from '../S3ConfigTypes';

/**
 * Check if S3 configuration has all required fields
 */
export const isConfigComplete = (config: S3StorageConfig): boolean => {
  return !!(
    config.bucketName && 
    config.region && 
    config.endpoint && 
    config.accessKeyId && 
    config.secretAccessKey
  );
};

/**
 * Validate individual fields in the S3 configuration
 */
export const validateConfig = (
  config: S3StorageConfig
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  if (!config.bucketName) {
    errors.bucketName = 'Bucket name is required';
  }
  
  if (!config.region) {
    errors.region = 'Region is required';
  }
  
  if (!config.endpoint) {
    errors.endpoint = 'Endpoint is required';
  } else if (!config.endpoint.startsWith('https://')) {
    errors.endpoint = 'Endpoint should start with https://';
  }
  
  if (!config.accessKeyId) {
    errors.accessKeyId = 'Access Key ID is required';
  }
  
  if (!config.secretAccessKey) {
    errors.secretAccessKey = 'Secret Access Key is required';
  }
  
  if (config.publicUrlBase && !config.publicUrlBase.startsWith('https://')) {
    errors.publicUrlBase = 'Public URL Base should start with https://';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};
