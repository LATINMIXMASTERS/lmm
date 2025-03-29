
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

export const wasabiRegions = [
  { label: 'US East 1 (N. Virginia)', value: 'us-east-1', endpoint: 's3.us-east-1.wasabisys.com' },
  { label: 'US East 2 (N. Virginia)', value: 'us-east-2', endpoint: 's3.us-east-2.wasabisys.com' },
  { label: 'US West 1 (Oregon)', value: 'us-west-1', endpoint: 's3.us-west-1.wasabisys.com' },
  { label: 'EU Central 1 (Amsterdam)', value: 'eu-central-1', endpoint: 's3.eu-central-1.wasabisys.com' },
  { label: 'EU West 1 (London)', value: 'eu-west-1', endpoint: 's3.eu-west-1.wasabisys.com' },
  { label: 'EU West 2 (Paris)', value: 'eu-west-2', endpoint: 's3.eu-west-2.wasabisys.com' },
  { label: 'AP Northeast 1 (Tokyo)', value: 'ap-northeast-1', endpoint: 's3.ap-northeast-1.wasabisys.com' },
  { label: 'AP Northeast 2 (Seoul)', value: 'ap-northeast-2', endpoint: 's3.ap-northeast-2.wasabisys.com' },
  { label: 'AP Southeast 1 (Singapore)', value: 'ap-southeast-1', endpoint: 's3.ap-southeast-1.wasabisys.com' },
  { label: 'AP Southeast 2 (Sydney)', value: 'ap-southeast-2', endpoint: 's3.ap-southeast-2.wasabisys.com' },
  { label: 'CA Central 1 (Toronto)', value: 'ca-central-1', endpoint: 's3.ca-central-1.wasabisys.com' }
];
