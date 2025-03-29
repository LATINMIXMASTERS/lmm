
import { S3UploadResult } from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Simple fallback upload function that handles files more efficiently
 * For large files, it doesn't attempt to store the full data in localStorage
 */
export const uploadToLocalStorage = async (
  file: File, 
  folder: string = 'uploads',
  onProgress?: (progress: number) => void
): Promise<S3UploadResult> => {
  return new Promise((resolve, reject) => {
    try {
      if (onProgress) onProgress(10);
      
      // Generate file metadata without trying to store the entire content
      const fileId = uuidv4();
      const timestamp = Date.now();
      const fileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const fileSize = file.size;
      const fileType = file.type;
      
      // For very large files (over 5MB), don't try to store data in localStorage
      const isLargeFile = file.size > 5 * 1024 * 1024;
      
      if (isLargeFile) {
        // For large files, just simulate progress and return a fallback URL
        if (onProgress) {
          // Simulate progress
          let progress = 10;
          const progressInterval = setInterval(() => {
            progress += 10;
            if (progress <= 90) {
              onProgress(progress);
            } else {
              clearInterval(progressInterval);
              onProgress(100);
            }
          }, 200);
        }
        
        const simulatedUrl = `local://${folder}/${fileId}-${timestamp}-${fileName}`;
        
        // Store just the metadata in localStorage
        try {
          localStorage.setItem(`file_meta_${simulatedUrl}`, JSON.stringify({
            name: fileName,
            size: fileSize,
            type: fileType,
            timestamp
          }));
        } catch (error) {
          console.warn("Could not store file metadata in localStorage:", error);
          // Continue anyway - this is just for display purposes
        }
        
        // Complete with 100% progress
        setTimeout(() => {
          if (onProgress) onProgress(100);
          
          resolve({
            success: true,
            url: simulatedUrl,
          });
        }, 300);
      } else {
        // For smaller files, attempt to use FileReader and store as data URL
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
            const simulatedUrl = `local://${folder}/${fileId}-${timestamp}-${fileName}`;
            
            try {
              // Try to store in localStorage, but handle quota errors gracefully
              localStorage.setItem(`file_${simulatedUrl}`, dataUrl);
            } catch (storageError) {
              console.warn("Failed to store file in localStorage due to quota limits:", storageError);
              // Continue without storing the actual data - the URL is what matters
            }
            
            if (onProgress) onProgress(100);
            
            resolve({
              success: true,
              url: dataUrl,
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
      }
    } catch (error) {
      console.error('Error in fallback upload:', error);
      if (onProgress) onProgress(0);
      reject(error);
    }
  });
};
