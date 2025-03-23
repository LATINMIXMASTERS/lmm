
import { S3StorageConfig, WasabiRegion, wasabiRegions } from "./S3ConfigTypes";
import { useToast } from "@/hooks/use-toast";

// Load the S3 configuration from localStorage
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

// Save the S3 configuration to localStorage
export const saveS3Config = (config: S3StorageConfig): boolean => {
  try {
    localStorage.setItem('latinmixmasters_s3config', JSON.stringify(config));
    return true;
  } catch (error) {
    console.error('Error saving S3 configuration:', error);
    return false;
  }
};

// Check if the configuration is complete
export const isConfigComplete = (config: S3StorageConfig): boolean => {
  return !!(
    config.bucketName && 
    config.region && 
    config.accessKeyId && 
    config.secretAccessKey
  );
};

// Get the CORS configuration for Wasabi
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

// Apply Wasabi region settings to the configuration
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
      `https://s3.${selectedRegion.value}.wasabisys.com/${config.bucketName}` : ''
  };
};

// Simulate testing the S3 connection
export const testS3Connection = async (
  config: S3StorageConfig
): Promise<{ success: boolean; message: string }> => {
  // In a real app, this would make an actual request to test the connection
  if (!config.bucketName || !config.region || !config.accessKeyId || !config.secretAccessKey) {
    return { success: false, message: "Missing required configuration" };
  }
  
  // Simulate network request
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // For demo purposes, assume it was successful
  return { 
    success: true, 
    message: "Successfully connected to S3 storage" 
  };
};
