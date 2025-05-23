
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const S3PostTestAlert: React.FC = () => (
  <Alert className="mt-2">
    <AlertCircle className="h-4 w-4 text-amber-500" />
    <AlertTitle>Important</AlertTitle>
    <AlertDescription>
      <p>A successful test only validates your credentials. For uploads to work properly, you must also:</p>
      <ol className="list-decimal ml-5 mt-2 space-y-1">
        <li>Ensure your Backblaze B2 bucket is set to <strong>Public</strong></li>
        <li>Configure proper CORS settings in your Backblaze B2 bucket</li>
        <li>Ensure your browser allows cookies and local storage</li>
      </ol>
      <p className="mt-2 text-sm">If you still get "AccessDenied" errors when uploading, double check that:</p>
      <ol className="list-decimal ml-5 mt-1 text-sm space-y-1">
        <li>Your application key has both <strong>read and write permissions</strong></li>
        <li>Your application key is associated with the correct bucket</li>
        <li>Your bucket name is <strong>exactly</strong> as specified in Backblaze B2</li>
      </ol>
    </AlertDescription>
  </Alert>
);

export default S3PostTestAlert;
