
import { S3StorageConfig, WasabiRegion, wasabiRegions } from "./S3ConfigTypes";

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
      `https://${selectedRegion.endpoint}/${config.bucketName}` : ''
  };
};

// Create auth headers for S3 test request
const createAuthHeaders = (config: S3StorageConfig): HeadersInit => {
  const date = new Date().toUTCString();
  
  return {
    'Date': date,
    'Authorization': `AWS ${config.accessKeyId}:${config.secretAccessKey}`,
  };
};

// Test the S3 connection by checking bucket access
export const testS3Connection = async (
  config: S3StorageConfig
): Promise<{ success: boolean; message: string }> => {
  if (!config.bucketName || !config.region || !config.accessKeyId || !config.secretAccessKey) {
    return { success: false, message: "Missing required configuration" };
  }
  
  try {
    // Determine the endpoint URL
    const endpoint = config.endpoint || `https://s3.${config.region}.wasabisys.com`;
    
    // Make a HEAD request to the bucket to check existence and permissions
    const response = await fetch(`${endpoint}/${config.bucketName}?location`, {
      method: 'GET',
      headers: createAuthHeaders(config)
    });
    
    if (response.ok) {
      return { 
        success: true, 
        message: "Successfully connected to S3 storage" 
      };
    } else {
      // Parse error response if possible
      let errorMessage;
      try {
        const text = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");
        const code = xmlDoc.getElementsByTagName("Code")[0]?.textContent;
        const message = xmlDoc.getElementsByTagName("Message")[0]?.textContent;
        
        errorMessage = code && message 
          ? `${code}: ${message}`
          : `HTTP ${response.status} - ${response.statusText}`;
      } catch {
        errorMessage = `HTTP ${response.status} - ${response.statusText}`;
      }
      
      return {
        success: false,
        message: `Failed to connect: ${errorMessage}`
      };
    }
  } catch (error) {
    console.error("S3 connection test error:", error);
    return {
      success: false,
      message: error instanceof Error 
        ? `Connection error: ${error.message}`
        : "Unknown connection error"
    };
  }
};
