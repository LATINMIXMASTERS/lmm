
import { S3UploadResult } from './types';
import { generateS3FileName, getS3Config, isS3Configured } from './config';
import { createSignatureV4 } from './utils/signatureGenerator';

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
  
  // Get S3 configuration
  const config = getS3Config();
  
  // S3 is mandatory for all files
  if (!config || !isS3Configured()) {
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
    
    // Normalize and validate the endpoint URL - Backblaze B2 specific
    let endpoint = config.endpoint || '';
    if (!endpoint.startsWith('http')) endpoint = `https://${endpoint}`;
    endpoint = endpoint.replace(/\/+$/, '');
    
    // Update console logs for better debugging
    console.log(`S3 Upload - Endpoint: ${endpoint}`);
    console.log(`S3 Upload - Bucket: ${config.bucketName}`);
    console.log(`S3 Upload - File path: ${filePath}`);
    console.log(`S3 Upload - File size: ${file.size} bytes`);
    
    const host = new URL(endpoint).host;
    
    // Set appropriate content-type based on file
    const contentType = file.type || 'application/octet-stream';
    
    // Standard headers for Backblaze B2 upload
    const headers: Record<string, string> = {
      'Host': host,
      'Content-Type': contentType,
      'Content-Length': file.size.toString(),
      'Cache-Control': 'public, max-age=31536000',
      'x-amz-acl': 'public-read'
    };
    
    if (onProgress) onProgress(10);
    
    // Create the full path for the signature - Backblaze expects the bucket name in the path
    const s3Path = `/${config.bucketName}/${filePath}`;
    
    // Generate AWS signature v4
    const signedHeaders = await createSignatureV4(
      config,
      'PUT',
      s3Path,
      config.region || 'us-west-004',
      's3',
      'UNSIGNED-PAYLOAD',
      headers
    );
    
    console.log('S3 Upload - Signed headers created');
    
    // Construct the full upload URL for Backblaze
    const uploadUrl = `${endpoint}/${config.bucketName}/${filePath}`;
    console.log(`S3 Upload - Upload URL: ${uploadUrl}`);
    
    if (onProgress) onProgress(20);
    
    // Upload using XHR to track progress
    const uploadPromise = new Promise<S3UploadResult>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Set up progress monitoring
      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            // Scale from 20-90%
            const percentComplete = 20 + Math.round((event.loaded / event.total) * 70);
            onProgress(percentComplete);
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
          console.log(`S3 Upload - Success: ${xhr.status} ${xhr.statusText}`);
          
          // Construct the public URL
          let publicUrl;
          
          if (config.publicUrlBase) {
            // Use the configured public base URL if provided
            publicUrl = `${config.publicUrlBase.replace(/\/$/, '')}/${filePath}`;
          } else {
            // Construct URL based on the bucket endpoint
            publicUrl = `${endpoint}/${config.bucketName}/${filePath}`;
          }
          
          console.log(`S3 Upload - Public URL: ${publicUrl}`);
          
          // Indicate complete
          if (onProgress) onProgress(100);
          
          resolve({
            success: true,
            url: publicUrl
          });
        } else {
          console.error(`S3 Upload - Failed: ${xhr.status} ${xhr.statusText}`);
          console.error(`S3 Upload - Response: ${xhr.responseText}`);
          
          if (onProgress) onProgress(0);
          reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText || xhr.statusText}`));
        }
      };
      
      xhr.onerror = () => {
        console.error('S3 Upload - Network error during upload');
        if (onProgress) onProgress(0);
        reject(new Error('Network error during upload'));
      };
      
      xhr.send(file);
      console.log('S3 Upload - Request sent');
    });
    
    return await uploadPromise;
  } catch (error) {
    console.error('S3 Upload - Error:', error);
    if (onProgress) onProgress(0);
    
    return {
      success: false,
      url: '',
      error: error instanceof Error ? error.message : 'Unknown error during upload'
    };
  }
}
