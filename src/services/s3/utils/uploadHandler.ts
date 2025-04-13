
import { S3StorageConfig, S3UploadResult } from '../types';
import { normalizeEndpointUrl, createPublicUrl } from './urlUtils';
import { formatErrorMessage } from './errorHandler';
import { createSignatureV4 } from './signatureGenerator';

/**
 * Handles the file upload to S3 using XHR for progress tracking
 */
export function uploadFileWithProgress(
  file: File,
  uploadUrl: string,
  signedHeaders: Record<string, string>,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Track upload progress
    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          // Scale from 20-95% for upload progress
          const percentComplete = 20 + Math.round((event.loaded / event.total) * 75);
          onProgress(Math.min(percentComplete, 95));
        }
      };
    }
    
    xhr.open('PUT', uploadUrl, true);
    
    // Add all signed headers
    Object.keys(signedHeaders).forEach(key => {
      xhr.setRequestHeader(key, signedHeaders[key]);
    });
    
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        console.log('S3 upload successful with status:', xhr.status);
        resolve();
      } else {
        console.error('S3 upload failed with status:', xhr.status);
        console.error('Response text:', xhr.responseText);
        if (onProgress) onProgress(0);
        
        const errorMsg = formatErrorMessage(xhr.status, xhr.statusText, xhr.responseText);
        reject(new Error(errorMsg));
      }
    };
    
    xhr.onerror = () => {
      console.error('S3 upload network error');
      if (onProgress) onProgress(0);
      reject(new Error('Network error during S3 upload. Check your network connection and S3 configuration.'));
    };
    
    xhr.ontimeout = () => {
      console.error('S3 upload timed out');
      if (onProgress) onProgress(0);
      reject(new Error('Upload timed out. Try with a smaller file or check your network connection.'));
    };
    
    // Set timeout to prevent hanging uploads
    xhr.timeout = 120000; // 2 minutes timeout
    
    // Send the file
    try {
      xhr.send(file);
    } catch (e) {
      console.error('Error sending file:', e);
      if (onProgress) onProgress(0);
      reject(new Error(`Error sending file: ${e instanceof Error ? e.message : 'Unknown error'}`));
    }
  });
}
