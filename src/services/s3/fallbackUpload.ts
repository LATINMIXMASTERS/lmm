
import { S3UploadResult } from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Simple fallback upload function that stores files as data URLs in localStorage
 * This is only for demonstration purposes and should not be used in production
 */
export const uploadToLocalStorage = async (
  file: File, 
  folder: string = 'uploads',
  onProgress?: (progress: number) => void
): Promise<S3UploadResult> => {
  return new Promise((resolve, reject) => {
    try {
      if (onProgress) onProgress(10);
      
      const reader = new FileReader();
      
      reader.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 80) + 10;
          onProgress(percent);
        }
      };
      
      reader.onload = () => {
        try {
          if (onProgress) onProgress(90);
          
          if (!reader.result) {
            throw new Error('Failed to read file');
          }
          
          const dataUrl = reader.result as string;
          
          // Generate a simulated URL
          const fileId = uuidv4();
          const timestamp = Date.now();
          const fileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
          const simulatedUrl = `local://${folder}/${fileId}-${timestamp}-${fileName}`;
          
          // Store in localStorage
          localStorage.setItem(`file_${simulatedUrl}`, dataUrl);
          
          // Map fake URL to data URL
          const urlMap = JSON.parse(localStorage.getItem('file_url_map') || '{}');
          urlMap[simulatedUrl] = dataUrl;
          localStorage.setItem('file_url_map', JSON.stringify(urlMap));
          
          if (onProgress) onProgress(100);
          
          resolve({
            success: true,
            url: dataUrl, // Return the data URL directly for fallback mode
          });
        } catch (error) {
          console.error('Error in fallback upload:', error);
          if (onProgress) onProgress(0);
          reject(error);
        }
      };
      
      reader.onerror = () => {
        console.error('FileReader error:', reader.error);
        if (onProgress) onProgress(0);
        reject(reader.error || new Error('File reading failed'));
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error in fallback upload:', error);
      if (onProgress) onProgress(0);
      reject(error);
    }
  });
};
