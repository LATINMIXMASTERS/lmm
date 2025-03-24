
import { S3StorageConfig, WasabiRegion, wasabiRegions } from "./S3ConfigTypes";
import * as crypto from 'crypto';

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
      `https://${config.bucketName}.${selectedRegion.endpoint}` : ''
  };
};

// Create proper AWS signature v4 headers for S3 requests
const createAuthHeaders = (config: S3StorageConfig, method: string, path: string): HeadersInit => {
  // Prepare date for signing
  const date = new Date();
  const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  
  // Set up host from endpoint
  const host = config.endpoint.replace(/^https?:\/\//, '');
  
  // Prepare canonical request components
  const httpMethod = method.toUpperCase();
  const canonicalUri = `/${config.bucketName}/${path}`.replace(/\/\//g, '/');
  const canonicalQueryString = 'location';
  const canonicalHeaders = `host:${host}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = 'host;x-amz-date';
  const payloadHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'; // empty string hash
  
  // Create canonical request
  const canonicalRequest = [
    httpMethod,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');
  
  // Set up signature parameters
  const algorithm = 'AWS4-HMAC-SHA256';
  const region = config.region;
  const service = 's3';
  const credential_scope = `${dateStamp}/${region}/${service}/aws4_request`;
  
  // Create string to sign
  const stringToSign = [
    algorithm,
    amzDate,
    credential_scope,
    crypto.createHash('sha256').update(canonicalRequest).digest('hex')
  ].join('\n');
  
  // Calculate signature
  const getSignatureKey = (key: string, dateStamp: string, regionName: string, serviceName: string) => {
    const kDate = crypto.createHmac('sha256', `AWS4${key}`).update(dateStamp).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(regionName).digest();
    const kService = crypto.createHmac('sha256', kRegion).update(serviceName).digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
    return kSigning;
  };
  
  const signingKey = getSignatureKey(config.secretAccessKey || '', dateStamp, region, service);
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');
  
  // Create authorization header
  const authorization = `${algorithm} Credential=${config.accessKeyId}/${credential_scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  
  return {
    'X-Amz-Date': amzDate,
    'Authorization': authorization,
    'x-amz-content-sha256': payloadHash
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
    
    console.log("Testing S3 connection with endpoint:", endpoint);
    console.log("Bucket:", config.bucketName);
    
    // Make a GET request to check bucket location
    const response = await fetch(`${endpoint}/${config.bucketName}?location`, {
      method: 'GET',
      headers: createAuthHeaders(config, 'GET', '')
    });
    
    console.log("S3 test response status:", response.status);
    
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
        console.log("Error response:", text);
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");
        const code = xmlDoc.getElementsByTagName("Code")[0]?.textContent;
        const message = xmlDoc.getElementsByTagName("Message")[0]?.textContent;
        
        errorMessage = code && message 
          ? `${code}: ${message}`
          : `HTTP ${response.status} - ${response.statusText}`;
      } catch (e) {
        console.error("Error parsing response:", e);
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
