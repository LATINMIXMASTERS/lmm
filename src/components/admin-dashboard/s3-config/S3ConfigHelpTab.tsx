
import React from "react";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const S3ConfigHelpTab: React.FC = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-medium">Setting Up Backblaze B2 Cloud Storage</h3>
    <ol className="list-decimal pl-5 space-y-2">
      <li>
        <span className="font-medium">Create a Backblaze account:</span> If you don't have one, sign up at <a href="https://www.backblaze.com/sign-up/cloud-storage" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">backblaze.com</a>
      </li>
      <li>
        <span className="font-medium">Create a bucket:</span> In your Backblaze B2 dashboard, create a new bucket. Make sure it's set to "Public".
      </li>
      <li>
        <span className="font-medium">Create application keys:</span> Generate an application key with access to this bucket. Go to App Keys and create a new application key.
      </li>
      <li>
        <span className="font-medium">Configure CORS:</span> Add a CORS policy to allow uploads from your domain.
      </li>
    </ol>
    <div className="bg-muted p-4 rounded-md">
      <h4 className="font-medium mb-2">Backblaze B2 CORS Configuration (REQUIRED)</h4>
      <p className="text-sm mb-2">
        Copy and add this configuration to your bucket's CORS Rules in the Backblaze B2 Dashboard:
      </p>
      <pre className="text-xs overflow-x-auto bg-gray-800 text-white p-3 rounded">
{JSON.stringify([
  {
    "allowedOrigins": ["*"],
    "allowedOperations": [
      "s3_delete",
      "s3_get",
      "s3_head",
      "s3_post",
      "s3_put"
    ],
    "allowedHeaders": ["*"],
    "exposeHeaders": ["ETag"],
    "maxAgeSeconds": 3600
  }
], null, 2)}
      </pre>
      <p className="text-xs mt-2 italic">
        For production, replace "*" with your actual domain for better security.
      </p>
    </div>
    <div className="bg-muted p-4 rounded-md mt-4">
      <h4 className="font-medium mb-2">How to Configure CORS in Backblaze B2</h4>
      <ol className="list-decimal ml-5 text-sm space-y-1">
        <li>Log in to your Backblaze B2 account</li>
        <li>Navigate to the "Buckets" section</li>
        <li>Click on your bucket name</li>
        <li>Click "Bucket Settings"</li>
        <li>Click "CORS Rules"</li>
        <li>Click "Add a CORS Rule"</li>
        <li>Paste the CORS configuration above</li>
        <li>Click "Update"</li>
      </ol>
    </div>
    <Alert>
      <ShieldCheck className="h-4 w-4" />
      <AlertTitle>Important Security Note</AlertTitle>
      <AlertDescription>
        Your Backblaze B2 credentials are stored in your browser's localStorage. For production use, 
        we recommend implementing server-side upload authentication.
      </AlertDescription>
    </Alert>
    <div className="bg-muted p-4 rounded-md mt-4">
      <h4 className="font-medium mb-2">Troubleshooting "AccessDenied" Errors</h4>
      <p className="text-sm mb-2">
        If you're seeing "AccessDenied" or "Unauthenticated requests are not allowed for this api" errors:
      </p>
      <ol className="list-decimal ml-5 text-sm space-y-1">
        <li><strong>Check key permissions:</strong> Ensure your application key has the correct permissions for the bucket</li>
        <li><strong>Verify key ID and secret:</strong> Double-check that you've entered the correct application key ID and secret key</li>
        <li><strong>Confirm bucket name:</strong> The bucket name must exactly match the one in your Backblaze account</li>
        <li><strong>Check bucket visibility:</strong> Make sure your bucket is set to "Public" in Backblaze B2</li>
        <li><strong>Valid region:</strong> Ensure you've selected the correct region where your bucket exists</li>
      </ol>
    </div>
  </div>
);

export default S3ConfigHelpTab;
