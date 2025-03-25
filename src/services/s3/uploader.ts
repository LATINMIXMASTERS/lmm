
import { S3StorageConfig, S3UploadResult } from './types';
import { createSignatureV4 } from './signature';
import { uploadToLocalStorage } from './fallbackUpload';
import { generateS3FileName, getS3Config, isS3Configured } from './config';

/**
 * Upload a file to S3-compatible storage using fetch API
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
  
  const config = getS3Config();
  
  if (!config || !isS3Configured()) {
    console.warn('S3 storage is not configured properly. Using fallback storage method.');
    return uploadToLocalStorage(file, folder, onProgress);
  }

  try {
    // Generate a unique file name for S3
    const fileName = generateS3FileName(file);
    const filePath = `${folder}/${fileName}`;
    
    // Determine the endpoint URL, removing any trailing slashes
    const endpoint = config.endpoint?.replace(/\/$/, '') || 
      `https://s3.${config.region}.wasabisys.com`;
    const host = new URL(endpoint).host;
    
    // Prepare headers for signature
    const headers: Record<string, string> = {
      'Host': host,
      'Content-Type': file.type || 'application/octet-stream',
      // Ensure proper cache control
      'Cache-Control': 'public, max-age=31536000'
    };
    
    // Use 'UNSIGNED-PAYLOAD' for browser compatibility
    const payloadHash = 'UNSIGNED-PAYLOAD';
    
    // Generate AWS signature v4
    const signedHeaders = await createSignatureV4(
      config,
      'PUT',
      filePath,
      config.region,
      's3',
      payloadHash,
      headers
    );
    
    // Upload URL - simplify to use bucket in path
    const uploadUrl = `${endpoint}/${filePath}`;
    
    // Upload the file to S3 using fetch API
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: signedHeaders,
      body: file
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`S3 upload failed with status ${response.status}: ${errorText}`);
    }
    
    // Update progress to 100% on successful upload
    if (onProgress) {
      onProgress(100);
    }
    
    // Construct the public URL
    let publicUrl;
    
    if (config.publicUrlBase) {
      // Use the configured public base URL if provided
      publicUrl = `${config.publicUrlBase.replace(/\/$/, '')}/${filePath}`;
    } else {
      // Construct URL based on the bucket endpoint
      publicUrl = `${endpoint}/${filePath}`;
    }
    
    return {
      success: true,
      url: publicUrl
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    
    // Ensure we return 0 progress on error
    if (onProgress) {
      onProgress(0);
    }
    
    return {
      success: false,
      url: '',
      error: error instanceof Error ? error.message : 'Unknown upload error'
    };
  }
};
