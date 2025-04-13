
export interface S3StorageConfig {
  bucketName: string;
  region: string;
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicUrlBase?: string;
}

export interface TestResult {
  success: boolean;
  message: string;
}

export const backblazeRegions = [
  { value: 'us-west-004', label: 'US West (Sacramento)', endpoint: 's3.us-west-004.backblazeb2.com' },
  { value: 'us-west-000', label: 'US West (Phoenix)', endpoint: 's3.us-west-000.backblazeb2.com' },
  { value: 'us-west-001', label: 'US West (Las Vegas)', endpoint: 's3.us-west-001.backblazeb2.com' },
  { value: 'us-west-002', label: 'US West (Phoenix)', endpoint: 's3.us-west-002.backblazeb2.com' },
  { value: 'us-east-001', label: 'US East (Virginia)', endpoint: 's3.us-east-001.backblazeb2.com' },
  { value: 'us-east-005', label: 'US East (Columbus)', endpoint: 's3.us-east-005.backblazeb2.com' },
  { value: 'eu-central-003', label: 'EU Central (Amsterdam)', endpoint: 's3.eu-central-003.backblazeb2.com' }
];

export interface FileUpload {
  file: File;
  dataUrl?: string;
}

