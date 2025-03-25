
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
  // Log the upload attempt
  console.log(`Attempting to upload file to S3: ${file.name} (${file.size} bytes) to folder: ${folder}`);
  
  const config = getS3Config();
  
  if (!config || !isS3Configured()) {
    console.warn('S3 storage is not configured properly. Using fallback storage method.');
    return uploadToLocalStorage(file, folder, onProgress);
  }

  try {
    // Generate a unique file name for S3
    const fileName = generateS3FileName(file);
    const s3Path = `${folder}/${fileName}`;
    
    // Initialize progress reporting
    if (onProgress) {
      onProgress(0);
    }
    
    // Determine the endpoint URL, removing any trailing slashes
    const endpoint = config.endpoint?.replace(/\/$/, '') || `https://s3.${config.region}.wasabisys.com`;
    const host = new URL(endpoint).host;
    
    // Prepare the request URL
    const uploadUrl = `${endpoint}/${s3Path}`;
    console.log(`Uploading to S3 URL: ${uploadUrl}`);
    
    // Prepare headers for signature
    const headers: Record<string, string> = {
      'Host': host,
      'Content-Type': file.type || 'application/octet-stream'
    };
    
    // Generate AWS signature v4
    const signedHeaders = await createSignatureV4(
      config,
      'PUT',
      s3Path,
      config.region,
      's3',
      'UNSIGNED-PAYLOAD',
      headers
    );
    
    console.log('Signed headers:', signedHeaders);
    
    // Upload the file to S3 using fetch API with proper AWS auth
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: signedHeaders,
      body: file
    });
    
    console.log("S3 response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("S3 upload error response:", errorText);
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
      publicUrl = `${config.publicUrlBase.replace(/\/$/, '')}/${s3Path}`;
    } else {
      // Construct URL based on the bucket endpoint
      publicUrl = `${endpoint}/${config.bucketName}/${s3Path}`;
    }
    
    console.log(`S3 upload successful. Public URL: ${publicUrl}`);
    
    return {
      success: true,
      url: publicUrl
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return {
      success: false,
      url: '',
      error: error instanceof Error ? error.message : 'Unknown upload error'
    };
  }
};
