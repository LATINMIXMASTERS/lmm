
/**
 * This file is now just a wrapper to maintain backward compatibility
 * while refactoring the S3 upload functionality into smaller files
 */
import { S3StorageConfig, S3UploadResult } from './types';
import { sha256, hmacSha256 } from './utils/cryptoUtils';
import { createSignatureV4 } from './utils/signatureUtils';
import { createAwsSignature } from './upload/s3Upload';

// Re-export all the functions to maintain backwards compatibility
export {
  sha256,
  hmacSha256,
  createSignatureV4,
  createAwsSignature
};
