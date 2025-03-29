
import { S3UploadResult } from './types';

/**
 * This function is now a stub that returns an error since local storage fallback is no longer supported.
 * All uploads must use S3.
 */
export const uploadToLocalStorage = async (
  file: File,
  folder: string = 'uploads',
  onProgress?: (progress: number) => void
): Promise<S3UploadResult> => {
  console.error('Local storage fallback is no longer supported');
  
  if (onProgress) {
    onProgress(0);
  }
  
  return {
    success: false,
    url: '',
    error: 'S3 storage is required for all file uploads. Please configure S3 storage in admin settings.'
  };
};
