
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
    "ExposeHeaders": ["ETag", "x-amz-meta-*"]
  }
]`;
};

/**
 * Get the list of Wasabi regions
 */
export const getWasabiRegions = (): string[] => {
  return wasabiRegions.map(region => region.value);
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
  
  // Construct endpoints correctly for Wasabi
  const endpoint = `https://${selectedRegion.endpoint}`;
  const publicUrlBase = config.bucketName ? 
    `https://${config.bucketName}.${selectedRegion.endpoint}` : '';
  
  console.log('Applying Wasabi region settings:', {
    region: selectedRegion.value,
    endpoint,
    publicUrlBase
  });
    
  return {
    ...config,
    region: selectedRegion.value,
    endpoint,
    publicUrlBase
  };
};
