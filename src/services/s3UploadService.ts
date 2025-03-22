
import { fileToDataUrl } from './imageUploadService';
import { useToast } from '@/hooks/use-toast';

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
  const extension = file.name.split('.').pop();
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
  const config = getS3Config();
  
  if (!config || !isS3Configured()) {
    return {
      success: false,
      url: '',
      error: 'S3 storage is not configured properly'
    };
  }

  // For smaller files or testing, we can use local storage with data URLs
  if (file.size < 1024 * 1024 * 5) { // Less than 5MB
    try {
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        success: true,
        url: dataUrl
      };
    } catch (error) {
      console.error('Error converting file to data URL:', error);
      return {
        success: false,
        url: '',
        error: 'Failed to process file'
      };
    }
  }

  // For actual S3 upload with S3-compatible storage API
  // In a real implementation, we would use the AWS SDK or a direct API call
  try {
    const fileName = generateS3FileName(file);
    const s3Path = folder ? `${folder}/${fileName}` : fileName;
    
    // Simulate upload progress
    if (onProgress) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5;
        onProgress(progress > 100 ? 100 : progress);
        if (progress >= 100) clearInterval(interval);
      }, 500);
    }
    
    // Simulate network delay for upload
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // In a real implementation, we'd make an API call here
    // For now, we'll return a simulated public URL
    const publicUrl = config.publicUrlBase 
      ? `${config.publicUrlBase}/${s3Path}`
      : `/demo-uploads/${fileName}`;
    
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
