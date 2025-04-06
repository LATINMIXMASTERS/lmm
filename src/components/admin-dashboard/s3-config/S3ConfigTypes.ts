export interface S3StorageConfig {
  bucketName: string;
  region: string;
  endpoint: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  publicUrlBase?: string;
}

export interface TestResult {
  success: boolean;
  message: string;
}

// Define Backblaze regions
export const backblazeRegions = [
  { label: 'US West (Sacramento)', value: 'us-west-004', endpoint: 's3.us-west-004.backblazeb2.com' },
  { label: 'US West (Phoenix)', value: 'us-west-000', endpoint: 's3.us-west-000.backblazeb2.com' },
  { label: 'US East (Phoenix-GCP)', value: 'us-west-001', endpoint: 's3.us-west-001.backblazeb2.com' },
  { label: 'US East (Northern Virginia)', value: 'us-east-001', endpoint: 's3.us-east-001.backblazeb2.com' },
  { label: 'EU Central (Netherlands)', value: 'eu-central-003', endpoint: 's3.eu-central-003.backblazeb2.com' },
  { label: 'Asia Pacific (Tokyo)', value: 'ap-northeast-001', endpoint: 's3.ap-northeast-001.backblazeb2.com' },
  { label: 'Asia Pacific (Singapore)', value: 'ap-southeast-001', endpoint: 's3.ap-southeast-001.backblazeb2.com' },
  { label: 'Asia Pacific (Sydney)', value: 'ap-southeast-002', endpoint: 's3.ap-southeast-002.backblazeb2.com' }
];

// For backward compatibility, keep wasabiRegions but map to Backblaze
export const wasabiRegions = backblazeRegions;
