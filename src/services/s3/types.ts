
export interface S3StorageConfig {
  bucketName: string;
  region: string;
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicUrlBase?: string;
}

export interface S3UploadResult {
  success: boolean;
  url: string;
  error?: string;
}
