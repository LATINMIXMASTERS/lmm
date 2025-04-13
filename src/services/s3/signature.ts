
import { S3StorageConfig, S3UploadResult } from './types';
import { createSignatureV4 } from './utils/signatureGenerator';
import { normalizeEndpointUrl, createPublicUrl } from './utils/urlUtils';
import { uploadFileWithProgress } from './utils/uploadHandler';

/**
 * Creates AWS Signature and uploads a file to S3-compatible storage
 * Fixed for Backblaze B2 compatibility
 */
export async function createAwsSignature(
  config: S3StorageConfig,
  file: File,
  filePath: string,
  onProgress?: (progress: number) => void
): Promise<S3UploadResult> {
  try {
    // Initialize progress tracking
    if (onProgress) onProgress(5);
    
    // Normalize and validate the endpoint URL
    const endpoint = normalizeEndpointUrl(config.endpoint, config.region);
    const host = new URL(endpoint).host;
    
    if (onProgress) onProgress(10);
    
    // Set appropriate content-type based on file
    const contentType = file.type || 'application/octet-stream';
    
    // Standard headers for S3 upload with Backblaze-specific additions
    const headers: Record<string, string> = {
      'Host': host,
      'Content-Type': contentType,
      'Content-Length': file.size.toString(),
      'Cache-Control': 'public, max-age=31536000',
      'x-amz-acl': 'public-read'  // Add this to ensure files are publicly readable
    };
    
    // Use 'UNSIGNED-PAYLOAD' for browser compatibility
    const payloadHash = 'UNSIGNED-PAYLOAD';
    
    if (onProgress) onProgress(10);
    
    console.log('Preparing signature for upload to:', {
      endpoint,
      bucket: config.bucketName,
      path: filePath,
      region: config.region,
      host,
      fileType: contentType,
      fileSize: file.size
    });
    
    // Create the full path for the signature - use bucket name for Backblaze
    const s3Path = `${config.bucketName}/${filePath}`;
    
    // Generate AWS signature v4
    const signedHeaders = await createSignatureV4(
      config,
      'PUT',
      s3Path,
      config.region || '',  // Ensure region is never undefined
      's3',
      payloadHash,
      headers
    );
    
    // Construct the full upload URL for Backblaze
    const uploadUrl = `${endpoint}/${config.bucketName}/${filePath}`;
    
    console.log('Uploading to URL:', uploadUrl);
    
    if (onProgress) onProgress(20);
    
    // Upload the file
    try {
      await uploadFileWithProgress(file, uploadUrl, signedHeaders, onProgress);
      
      // Construct the public URL based on configs
      const publicUrl = createPublicUrl(endpoint, config.bucketName, filePath, config.publicUrlBase);
      
      // Complete progress
      if (onProgress) onProgress(100);
      
      return {
        success: true,
        url: publicUrl
      };
    } catch (error) {
      // Error already logged in uploadFileWithProgress
      throw error;
    }
  } catch (error) {
    console.error('Error preparing S3 upload:', error);
    
    // Ensure we return 0 progress on error
    if (onProgress) {
      onProgress(0);
    }
    
    return {
      success: false,
      url: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred during upload'
    };
  }
}
