
/**
 * Re-export all S3 functions from modular files
 */
export { 
  getS3Config, 
  isS3Configured, 
  generateS3FileName 
} from './s3/config';

export { uploadFileToS3 } from './s3/uploader';

// Export types for consumers
export type { S3StorageConfig, S3UploadResult } from './s3/types';
