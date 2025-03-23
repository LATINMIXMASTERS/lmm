
// Type definitions for S3 configuration
export interface S3StorageConfig {
  bucketName: string;
  region: string;
  endpoint?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  publicUrlBase?: string;
}

export interface WasabiRegion {
  name: string;
  value: string;
  endpoint: string;
}

export const wasabiRegions: WasabiRegion[] = [
  { name: "US East 1", value: "us-east-1", endpoint: "s3.us-east-1.wasabisys.com" },
  { name: "US East 2", value: "us-east-2", endpoint: "s3.us-east-2.wasabisys.com" },
  { name: "US West 1", value: "us-west-1", endpoint: "s3.us-west-1.wasabisys.com" },
  { name: "EU Central 1", value: "eu-central-1", endpoint: "s3.eu-central-1.wasabisys.com" },
  { name: "EU West 1", value: "eu-west-1", endpoint: "s3.eu-west-1.wasabisys.com" },
  { name: "AP Northeast 1", value: "ap-northeast-1", endpoint: "s3.ap-northeast-1.wasabisys.com" },
  { name: "AP Northeast 2", value: "ap-northeast-2", endpoint: "s3.ap-northeast-2.wasabisys.com" }
];
