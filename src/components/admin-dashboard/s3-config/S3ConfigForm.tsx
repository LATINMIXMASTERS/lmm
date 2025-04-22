
import React from "react";
import { S3StorageConfig, backblazeRegions } from "./S3ConfigTypes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Key, Lock } from "lucide-react";

interface S3ConfigFormProps {
  config: S3StorageConfig;
  showSecrets: boolean;
  onChange: (field: keyof S3StorageConfig, value: string) => void;
  onToggleSecrets: () => void;
}

const S3ConfigForm: React.FC<S3ConfigFormProps> = ({
  config,
  showSecrets,
  onChange,
  onToggleSecrets
}) => (
  <>
    <div className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bucketName">Bucket Name</Label>
          <Input
            id="bucketName"
            value={config.bucketName}
            onChange={(e) => onChange("bucketName", e.target.value)}
            placeholder="latinmixmasters"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="region">Region</Label>
          <Select
            value={config.region}
            onValueChange={(value) => onChange("region", value)}
          >
            <SelectTrigger id="region">
              <SelectValue placeholder="Select a region" />
            </SelectTrigger>
            <SelectContent>
              {backblazeRegions.map((region) => (
                <SelectItem key={region.value} value={region.value}>
                  {region.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="endpoint">Endpoint</Label>
        <Input
          id="endpoint"
          value={config.endpoint}
          onChange={(e) => onChange("endpoint", e.target.value)}
          placeholder="https://s3.us-east-005.backblazeb2.com"
        />
        <p className="text-sm text-muted-foreground">
          For Backblaze B2, this should be https://s3.[region].backblazeb2.com
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="publicUrlBase">Public URL Base</Label>
        <Input
          id="publicUrlBase"
          value={config.publicUrlBase || ""}
          onChange={(e) => onChange("publicUrlBase", e.target.value)}
          placeholder="https://s3.us-east-005.backblazeb2.com/bucketname"
        />
        <p className="text-sm text-muted-foreground">
          URL used to access uploaded files. For Backblaze B2, typically https://s3.[region].backblazeb2.com/[bucketname]
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="accessKeyId" className="flex items-center">
          <Key className="h-4 w-4 mr-1" />
          Application Key ID
        </Label>
        <Input
          id="accessKeyId"
          value={config.accessKeyId || ""}
          onChange={(e) => onChange("accessKeyId", e.target.value)}
          placeholder="Your Backblaze B2 application key ID"
          type={showSecrets ? "text" : "password"}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="secretAccessKey" className="flex items-center">
          <Lock className="h-4 w-4 mr-1" />
          Application Key
        </Label>
        <Input
          id="secretAccessKey"
          value={config.secretAccessKey || ""}
          onChange={(e) => onChange("secretAccessKey", e.target.value)}
          placeholder="Your Backblaze B2 application key"
          type={showSecrets ? "text" : "password"}
        />
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="showSecrets"
          checked={showSecrets}
          onChange={onToggleSecrets}
          className="rounded border-gray-300"
        />
        <Label htmlFor="showSecrets" className="cursor-pointer">
          Show credentials
        </Label>
      </div>
    </div>
  </>
);

export default S3ConfigForm;
