
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

// Backblaze B2 regions
export const backblazeRegions = [
  { value: 'us-west-000', label: 'US West (Phoenix)', endpoint: 's3.us-west-000.backblazeb2.com' },
  { value: 'us-west-001', label: 'US West (Sacramento)', endpoint: 's3.us-west-001.backblazeb2.com' },
  { value: 'us-west-002', label: 'US West (San Jose)', endpoint: 's3.us-west-002.backblazeb2.com' },
  { value: 'us-west-004', label: 'US West (Seattle)', endpoint: 's3.us-west-004.backblazeb2.com' },
  { value: 'us-central-000', label: 'US Central (Dallas)', endpoint: 's3.us-central-000.backblazeb2.com' },
  { value: 'us-east-001', label: 'US East (Northern Virginia)', endpoint: 's3.us-east-001.backblazeb2.com' },
  { value: 'us-east-004', label: 'US East (Newark)', endpoint: 's3.us-east-004.backblazeb2.com' },
  { value: 'us-east-005', label: 'US East (Columbus)', endpoint: 's3.us-east-005.backblazeb2.com' },
  { value: 'eu-central-003', label: 'EU Central (Frankfurt)', endpoint: 's3.eu-central-003.backblazeb2.com' },
  { value: 'eu-west-001', label: 'EU West (Amsterdam)', endpoint: 's3.eu-west-001.backblazeb2.com' },
  { value: 'eu-west-003', label: 'EU West (London)', endpoint: 's3.eu-west-003.backblazeb2.com' },
  { value: 'ap-northeast-002', label: 'AP Northeast (Tokyo)', endpoint: 's3.ap-northeast-002.backblazeb2.com' },
  { value: 'ap-northeast-003', label: 'AP Northeast (Seoul)', endpoint: 's3.ap-northeast-003.backblazeb2.com' },
  { value: 'ap-southeast-000', label: 'AP Southeast (Singapore)', endpoint: 's3.ap-southeast-000.backblazeb2.com' },
  { value: 'ap-southeast-003', label: 'AP Southeast (Sydney)', endpoint: 's3.ap-southeast-003.backblazeb2.com' }
];
