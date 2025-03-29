
import { S3StorageConfig, S3UploadResult } from '../types';
import { createSignatureV4 } from '../utils/signatureUtils';

/**
 * Handles the full AWS signature and upload process
 */
export async function createAwsSignature(
  config: S3StorageConfig,
  file: File,
  filePath: string,
  onProgress?: (progress: number) => void
): Promise<S3UploadResult> {
  try {
    // Init progress
    if (onProgress) onProgress(5);
    
    // Determine the endpoint URL, removing any trailing slashes
    let endpoint = config.endpoint?.replace(/\/$/, '') || 
      `https://s3.${config.region}.wasabisys.com`;
    
    // For Wasabi, ensure we have the correct domain format
    if (!endpoint.includes('wasabisys.com') && config.region && !endpoint.includes(config.region)) {
      endpoint = `https://s3.${config.region}.wasabisys.com`;
      console.log("Corrected Wasabi endpoint:", endpoint);
    }
    
    const host = new URL(endpoint).host;
    
    // Prepare headers for signature
    const headers: Record<string, string> = {
      'Host': host,
      'Content-Type': file.type || 'application/octet-stream',
      // Ensure proper cache control
      'Cache-Control': 'public, max-age=31536000',
      // Add cors headers
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE',
      'Access-Control-Allow-Headers': '*'
    };
    
    // Use 'UNSIGNED-PAYLOAD' for browser compatibility
    const payloadHash = 'UNSIGNED-PAYLOAD';
    
    // Generate AWS signature v4
    if (onProgress) onProgress(10);
    const signedHeaders = await createSignatureV4(
      config,
      'PUT',
      `${config.bucketName}/${filePath}`,
      config.region,
      's3',
      payloadHash,
      headers
    );
    
    // Upload URL
    const uploadUrl = `${endpoint}/${config.bucketName}/${filePath}`;
    
    console.log('Uploading to URL:', uploadUrl);
    console.log('With headers:', Object.keys(signedHeaders).join(', '));
    
    if (onProgress) onProgress(20);
    
    // Upload the file to S3 using XHR with progress tracking
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
    
    // Create a promise to handle the XHR response
    const uploadPromise = new Promise<S3UploadResult>((resolve, reject) => {
      xhr.open('PUT', uploadUrl, true);
      
      // Add all signed headers
      Object.keys(signedHeaders).forEach(key => {
        xhr.setRequestHeader(key, signedHeaders[key]);
      });
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Construct the public URL
          let publicUrl;
          
          if (config.publicUrlBase) {
            // Use the configured public base URL if provided
            publicUrl = `${config.publicUrlBase.replace(/\/$/, '')}/${filePath}`;
          } else {
            // Construct URL based on the bucket endpoint
            publicUrl = `${endpoint}/${config.bucketName}/${filePath}`;
          }
          
          // Indicate complete
          if (onProgress) onProgress(100);
          
          resolve({
            success: true,
            url: publicUrl
          });
        } else {
          console.error('S3 upload failed:', xhr.status, xhr.responseText);
          if (onProgress) onProgress(0);
          reject(new Error(`S3 upload failed with status ${xhr.status}: ${xhr.responseText}`));
        }
      };
      
      xhr.onerror = () => {
        console.error('S3 upload network error');
        if (onProgress) onProgress(0);
        reject(new Error('Network error during S3 upload'));
      };
      
      xhr.onabort = () => {
        console.error('S3 upload aborted');
        if (onProgress) onProgress(0);
        reject(new Error('S3 upload was aborted'));
      };
      
      // Send the file
      xhr.send(file);
    });
    
    return await uploadPromise;
  } catch (error) {
    console.error('S3 upload error details:', error);
    
    // Ensure we return 0 progress on error
    if (onProgress) {
      onProgress(0);
    }
    
    throw error;
  }
}
