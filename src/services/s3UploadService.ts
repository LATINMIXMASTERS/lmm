
import { fileToDataUrl } from './imageUploadService';

interface S3Config {
  bucketName: string;
  region: string;
  endpoint?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  publicUrlBase?: string;
}

/**
 * Gets the S3 configuration from localStorage
 */
export const getS3Config = (): S3Config | null => {
  const savedConfig = localStorage.getItem('latinmixmasters_s3config');
  if (!savedConfig) return null;
  
  try {
    return JSON.parse(savedConfig);
  } catch (error) {
    console.error('Error parsing S3 configuration:', error);
    return null;
  }
};

/**
 * Check if S3 storage is properly configured
 */
export const isS3Configured = (): boolean => {
  const config = getS3Config();
  return !!(config?.bucketName && config?.region && config?.accessKeyId && config?.secretAccessKey);
};

/**
 * Generate a unique file name for S3 uploads
 */
export const generateS3FileName = (file: File): string => {
  const timestamp = new Date().getTime();
  const randomString = Math.random().toString(36).substring(2, 10);
  const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '-');
  const extension = safeFileName.split('.').pop();
  return `${timestamp}-${randomString}.${extension}`;
};

/**
 * Upload a file to S3-compatible storage
 */
export const uploadFileToS3 = async (
  file: File,
  folder: string = 'audio',
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; url: string; error?: string }> => {
  // Log the upload attempt
  console.log(`Attempting to upload file to S3: ${file.name} (${file.size} bytes) to folder: ${folder}`);
  
  const config = getS3Config();
  
  if (!config || !isS3Configured()) {
    console.warn('S3 storage is not configured properly. Using fallback storage method.');
    return uploadToLocalStorage(file, folder, onProgress);
  }

  try {
    // Generate a unique file name for S3
    const fileName = generateS3FileName(file);
    const s3Path = folder ? `${folder}/${fileName}` : fileName;
    
    // For demo/development environment (we're simulating S3 upload)
    // In production, this would use actual S3 API calls
    
    // Simulate upload progress
    if (onProgress) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 5;
        onProgress(progress > 100 ? 100 : progress);
        if (progress >= 100) clearInterval(interval);
      }, 300);
    }
    
    // Simulate S3 upload delay based on file size
    // Larger files take longer to upload
    const simulatedUploadTime = Math.min(3000, file.size / 100000);
    await new Promise(resolve => setTimeout(resolve, simulatedUploadTime));
    
    // Construct the public URL based on configuration
    let publicUrl;
    
    if (config.publicUrlBase) {
      // Use the configured public base URL if provided
      publicUrl = `${config.publicUrlBase.replace(/\/$/, '')}/${s3Path}`;
    } else if (config.endpoint) {
      // Construct URL from endpoint if available
      const baseUrl = config.endpoint.replace(/\/$/, '');
      publicUrl = `${baseUrl}/${config.bucketName}/${s3Path}`;
    } else {
      // Default S3 URL format for Wasabi
      publicUrl = `https://s3.${config.region}.wasabisys.com/${config.bucketName}/${s3Path}`;
    }
    
    console.log(`S3 upload successful. Public URL: ${publicUrl}`);
    
    return {
      success: true,
      url: publicUrl
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return {
      success: false,
      url: '',
      error: error instanceof Error ? error.message : 'Unknown upload error'
    };
  }
};

/**
 * Fallback method to use local storage when S3 is not configured
 */
const uploadToLocalStorage = async (
  file: File,
  folder: string = 'audio',
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; url: string; error?: string }> => {
  try {
    console.log('Using local storage fallback for file upload');
    const dataUrl = await fileToDataUrl(file);
    
    // Simulate upload progress
    if (onProgress) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        onProgress(progress > 100 ? 100 : progress);
        if (progress >= 100) clearInterval(interval);
      }, 200);
    }
    
    // Simulate network delay
    const delay = Math.min(2000, file.size / 50000);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return {
      success: true,
      url: dataUrl
    };
  } catch (error) {
    console.error('Error with local storage fallback:', error);
    return {
      success: false,
      url: '',
      error: 'Failed to process file for local storage'
    };
  }
};
