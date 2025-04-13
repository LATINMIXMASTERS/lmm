
import { formatErrorMessage } from './errorHandler';

/**
 * Handles the file upload to S3 using XHR for progress tracking
 * Optimized for Backblaze B2 compatibility
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
    
    // Add more detailed logging
    console.log('Sending request to Backblaze B2:', {
      method: 'PUT',
      url: uploadUrl,
      contentType: signedHeaders['Content-Type'],
      contentLength: file.size,
      fileName: file.name,
      headers: Object.keys(signedHeaders).join(', ')
    });
    
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        console.log('Backblaze B2 upload successful with status:', xhr.status);
        resolve();
      } else {
        console.error('Backblaze B2 upload failed with status:', xhr.status);
        console.error('Response text:', xhr.responseText);
        console.error('Response headers:', xhr.getAllResponseHeaders());
        if (onProgress) onProgress(0);
        
        const errorMsg = formatErrorMessage(xhr.status, xhr.statusText, xhr.responseText);
        reject(new Error(errorMsg));
      }
    };
    
    xhr.onerror = () => {
      console.error('Backblaze B2 upload network error:', {
        status: xhr.status,
        statusText: xhr.statusText
      });
      console.error('Request details:', {
        url: uploadUrl,
        method: 'PUT',
        headers: Object.keys(signedHeaders)
      });
      if (onProgress) onProgress(0);
      reject(new Error('Network error during Backblaze B2 upload. Check your network connection and B2 configuration.'));
    };
    
    xhr.ontimeout = () => {
      console.error('Backblaze B2 upload timed out');
      if (onProgress) onProgress(0);
      reject(new Error('Upload to Backblaze B2 timed out. Try with a smaller file or check your network connection.'));
    };
    
    // Set timeout to prevent hanging uploads (increased for larger files)
    xhr.timeout = 300000; // 5 minutes timeout for Backblaze B2
    
    // Send the file
    try {
      xhr.send(file);
    } catch (e) {
      console.error('Error sending file to Backblaze B2:', e);
      if (onProgress) onProgress(0);
      reject(new Error(`Error sending file to Backblaze B2: ${e instanceof Error ? e.message : 'Unknown error'}`));
    }
  });
}
