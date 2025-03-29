
import { S3UploadResult } from './types';
import { uploadToLocalStorage } from './fallbackUpload';
import { generateS3FileName, getS3Config, isS3Configured } from './config';
import { createAwsSignature } from './signature';

/**
 * Upload a file to S3-compatible storage using fetch API
 * No fallback to local storage - S3 is mandatory
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
  
  // Check if file is within size limits
  if (folder.includes('audio') && file.size > 250 * 1024 * 1024) {
    console.error('Audio file exceeds maximum size limit of 250MB');
    return {
      success: false,
      url: '',
      error: 'Audio file exceeds maximum size limit of 250MB'
    };
  }
  
  if ((folder.includes('covers') || folder.includes('image')) && file.size > 1 * 1024 * 1024) {
    console.error('Image file exceeds maximum size limit of 1MB');
    return {
      success: false,
      url: '',
      error: 'Image file exceeds maximum size limit of 1MB'
    };
  }
  
  // Get S3 configuration
  const config = getS3Config();
  console.log('S3 config loaded:', { 
    hasBucket: !!config?.bucketName, 
    hasRegion: !!config?.region,
    hasEndpoint: !!config?.endpoint,
    hasAccessKey: !!config?.accessKeyId,
    hasSecretKey: !!config?.secretAccessKey,
    publicUrlBase: config?.publicUrlBase || 'not set',
    fileSize: `${(file.size / (1024 * 1024)).toFixed(2)}MB`
  });
  
  // S3 is now mandatory for all files
  if (!config || !isS3Configured()) {
    console.error('S3 storage is not configured but is required for file uploads');
    return {
      success: false,
      url: '',
      error: 'S3 storage configuration is required for all uploads. Please configure S3 storage in admin settings.'
    };
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
    
    return {
      success: false,
      url: '',
      error: error instanceof Error ? error.message : 'S3 upload failed. Please check your configuration.'
    };
  }
};
