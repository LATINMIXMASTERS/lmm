
import { S3UploadResult } from './types';
import { uploadToLocalStorage } from './fallbackUpload';
import { generateS3FileName, getS3Config, isS3Configured } from './config';
import { createAwsSignature } from './signature';

/**
 * Upload a file to S3-compatible storage using fetch API
 */
export const uploadFileToS3 = async (
  file: File,
  folder: string = 'audio',
  onProgress?: (progress: number) => void
): Promise<S3UploadResult> => {
  // Initialize progress reporting
  if (onProgress) {
    onProgress(0);
  }
  
  // Get S3 configuration
  const config = getS3Config();
  console.log('S3 config loaded:', { 
    hasBucket: config?.bucketName, 
    hasRegion: config?.region,
    hasEndpoint: config?.endpoint,
    hasAccessKey: !!config?.accessKeyId,
    hasSecretKey: !!config?.secretAccessKey 
  });
  
  if (!config || !isS3Configured()) {
    console.warn('S3 storage is not configured properly. Using fallback storage method.');
    return uploadToLocalStorage(file, folder, onProgress);
  }

  try {
    // Generate a unique file name for S3
    const fileName = generateS3FileName(file);
    const filePath = `${folder}/${fileName}`;
    console.log('Uploading to S3 path:', filePath);
    
    // Upload to S3 using the proper signature method
    const result = await createAwsSignature(config, file, filePath, onProgress);
    
    // Update progress to 100% on successful upload
    if (onProgress && result.success) {
      onProgress(100);
    }
    
    console.log('S3 upload successful, URL:', result.url);
    return result;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    
    // Ensure we return 0 progress on error
    if (onProgress) {
      onProgress(0);
    }
    
    // Fallback to local storage on error if possible
    try {
      console.log('Attempting fallback to local storage due to S3 error');
      return await uploadToLocalStorage(file, folder, onProgress);
    } catch (fallbackError) {
      console.error('Fallback upload also failed:', fallbackError);
      return {
        success: false,
        url: '',
        error: error instanceof Error ? error.message : 'Unknown upload error'
      };
    }
  }
};
