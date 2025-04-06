
import { S3StorageConfig, S3UploadResult } from './types';
import { createSignatureV4 } from './utils/signatureUtils';

/**
 * Creates AWS Signature and uploads a file to S3-compatible storage
 */
export async function createAwsSignature(
  config: S3StorageConfig,
  file: File,
  filePath: string,
  onProgress?: (progress: number) => void
): Promise<S3UploadResult> {
  try {
    // Ensure endpoint is a valid URL
    let endpoint = config.endpoint || '';
    
    // Make sure it starts with https://
    if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
      endpoint = `https://${endpoint}`;
    }
    
    // Remove any trailing slashes to avoid double slashes
    endpoint = endpoint.replace(/\/+$/, '');
    
    if (!endpoint) {
      // Fallback to regional endpoint if none provided
      endpoint = `https://s3.${config.region}.backblazeb2.com`;
    }
    
    // Validate URL to avoid 'Invalid URL' errors
    try {
      new URL(endpoint);
    } catch (error) {
      console.error("Invalid endpoint URL:", endpoint);
      if (onProgress) onProgress(0);
      throw new Error(`Invalid endpoint URL: ${endpoint}. Please check your Backblaze B2 configuration.`);
    }
    
    // Extract host from valid URL
    const host = new URL(endpoint).host;
    
    // Create the full path for the signature
    const s3Path = `${config.bucketName}/${filePath}`;
    
    // Standard headers for S3 upload
    const headers: Record<string, string> = {
      'Host': host,
      'Content-Type': file.type || 'application/octet-stream',
      'Content-Length': file.size.toString(),
      'Cache-Control': 'public, max-age=31536000',
    };
    
    // Use 'UNSIGNED-PAYLOAD' for browser compatibility
    const payloadHash = 'UNSIGNED-PAYLOAD';
    
    if (onProgress) onProgress(10);
    
    console.log('Generating signature for:', {
      endpoint,
      bucket: config.bucketName,
      path: filePath,
      region: config.region,
      host
    });
    
    // Generate AWS signature v4
    const signedHeaders = await createSignatureV4(
      config,
      'PUT',
      s3Path,
      config.region,
      's3',
      payloadHash,
      headers
    );
    
    // Upload URL
    const uploadUrl = `${endpoint}/${config.bucketName}/${filePath}`;
    
    console.log('Uploading to URL:', uploadUrl);
    
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
          console.log('S3 upload successful with status:', xhr.status);
          
          // Construct the public URL
          let publicUrl;
          
          if (config.publicUrlBase) {
            // Use the configured public URL base if provided
            const cleanPublicUrlBase = config.publicUrlBase.replace(/\/+$/, '');
            publicUrl = `${cleanPublicUrlBase}/${filePath}`;
          } else {
            // Construct URL based on the bucket and endpoint
            publicUrl = `${endpoint}/${config.bucketName}/${filePath}`;
          }
          
          // Indicate complete
          if (onProgress) onProgress(100);
          
          resolve({
            success: true,
            url: publicUrl
          });
        } else {
          console.error('B2 upload failed with status:', xhr.status);
          console.error('Response text:', xhr.responseText);
          if (onProgress) onProgress(0);
          reject(new Error(`B2 upload failed with status ${xhr.status}: ${xhr.responseText}`));
        }
      };
      
      xhr.onerror = () => {
        console.error('B2 upload network error');
        if (onProgress) onProgress(0);
        reject(new Error('Network error during B2 upload'));
      };
      
      xhr.onabort = () => {
        console.error('B2 upload aborted');
        if (onProgress) onProgress(0);
        reject(new Error('B2 upload was aborted'));
      };
      
      // Send the file
      xhr.send(file);
    });
    
    return await uploadPromise;
  } catch (error) {
    console.error('B2 upload error:', error);
    
    // Ensure we return 0 progress on error
    if (onProgress) {
      onProgress(0);
    }
    
    throw error;
  }
}
