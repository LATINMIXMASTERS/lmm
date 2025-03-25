
import { fileToDataUrl } from '../imageUploadService';
import { S3UploadResult } from './types';

/**
 * Fallback method to use local storage when S3 is not configured
 */
export const uploadToLocalStorage = async (
  file: File,
  folder: string = 'audio',
  onProgress?: (progress: number) => void
): Promise<S3UploadResult> => {
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
