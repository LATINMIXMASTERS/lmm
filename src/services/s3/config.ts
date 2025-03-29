
import { S3StorageConfig } from './types';
import { v4 as uuidv4 } from 'uuid';

// Cached config to avoid reading localStorage frequently
let cachedConfig: S3StorageConfig | null = null;

// Use the same storage key as the admin panel
const STORAGE_KEY = 'latinmixmasters_s3config';

/**
 * Get S3 configuration from localStorage
 */
export function getS3Config(): S3StorageConfig | null {
  try {
    // Return cached config if available
    if (cachedConfig) {
      return cachedConfig;
    }
    
    const configStr = localStorage.getItem(STORAGE_KEY);
    if (!configStr) {
      console.log('No S3 configuration found in localStorage');
      return null;
    }
    
    const config = JSON.parse(configStr) as S3StorageConfig;
    
    // Cache the config
    cachedConfig = config;
    
    console.log('S3 config loaded:', {
      hasBucket: !!config.bucketName,
      hasRegion: !!config.region,
      hasEndpoint: !!config.endpoint,
      hasAccessKey: !!config.accessKeyId,
      hasSecretKey: !!config.secretAccessKey?.substring(0, 3) + '***'
    });
    
    return config;
  } catch (error) {
    console.error('Error getting S3 config:', error);
    return null;
  }
}

/**
 * Save S3 configuration to localStorage
 */
export function saveS3Config(config: S3StorageConfig): void {
  try {
    // Validate required fields
    if (!config.bucketName || !config.region) {
      throw new Error('Missing required S3 configuration fields');
    }
    
    // Cache the config
    cachedConfig = config;
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    
    console.log('S3 configuration saved successfully');
  } catch (error) {
    console.error('Error saving S3 config:', error);
    throw error;
  }
}

/**
 * Check if S3 is configured properly
 */
export function isS3Configured(): boolean {
  const config = getS3Config();
  return !!(config?.bucketName && config.region && config.accessKeyId && config.secretAccessKey);
}

/**
 * Clear the cached config
 */
export function clearCachedConfig(): void {
  cachedConfig = null;
}

/**
 * Generate a unique filename for S3 with proper path
 */
export function generateS3FileName(file: File): string {
  // Get file extension
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  
  // Generate a UUID for the file
  const uuid = uuidv4();
  
  // Add timestamp to ensure uniqueness
  const timestamp = Date.now();
  
  // Generate the filename
  return `${uuid}-${timestamp}.${extension}`;
}
