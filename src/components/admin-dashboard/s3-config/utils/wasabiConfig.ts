
import { S3StorageConfig } from '../S3ConfigTypes';
import { backblazeRegions } from '../S3ConfigTypes';

/**
 * Get default endpoint for a region
 */
export const getDefaultEndpoint = (regionCode: string): string => {
  const region = backblazeRegions.find(r => r.value === regionCode);
  return region ? `https://${region.endpoint}` : '';
};

/**
 * Generate public URL base from bucket and endpoint
 */
export const generatePublicUrlBase = (bucketName: string, endpoint: string): string => {
  // Remove any trailing slashes
  const cleanEndpoint = endpoint.replace(/\/+$/, '');
  return `${cleanEndpoint}/${bucketName}`;
};

/**
 * Check if a configuration is for Backblaze B2
 */
export const isBackblazeB2Config = (config: S3StorageConfig): boolean => {
  return !!config.endpoint?.includes('backblazeb2.com');
};

/**
 * Generate proper CORS configuration for S3 provider
 */
export const getS3CorsConfig = (): Record<string, any> => {
  return {
    "CORSRules": [
      {
        "AllowedOrigins": ["*"],
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "MaxAgeSeconds": 3000,
        "ExposeHeaders": ["ETag"]
      }
    ]
  };
};
