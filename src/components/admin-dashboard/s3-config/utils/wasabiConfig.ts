
import { S3StorageConfig, wasabiRegions } from '../S3ConfigTypes';

/**
 * Get the CORS configuration for Wasabi
 */
export const getWasabiCorsConfig = (): string => {
  return `[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]`;
};

/**
 * Apply Wasabi region settings to the configuration
 */
export const applyWasabiRegionSettings = (
  config: S3StorageConfig, 
  regionId: string
): S3StorageConfig => {
  const selectedRegion = wasabiRegions.find(r => r.value === regionId);
  
  if (!selectedRegion) return config;
  
  return {
    ...config,
    region: selectedRegion.value,
    endpoint: `https://${selectedRegion.endpoint}`,
    publicUrlBase: config.bucketName ? 
      `https://${config.bucketName}.${selectedRegion.endpoint}` : ''
  };
};
