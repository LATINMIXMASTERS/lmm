
import React, { useState, useEffect } from "react";
import { Cloud, Server, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { S3StorageConfig, TestResult, backblazeRegions } from "./S3ConfigTypes";
import { loadS3Config, saveS3Config } from "./utils/configStorage";
import { testS3Connection } from "./utils/connectionTester";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import S3ConfigForm from "./S3ConfigForm";
import S3ConfigHelpTab from "./S3ConfigHelpTab";
import S3PostTestAlert from "./S3PostTestAlert";

const S3ConfigurationPanel: React.FC = () => {
  const defaultConfig = {
    ...loadS3Config(),
    region: loadS3Config().region || "us-east-005",
  };

  const [config, setConfig] = useState<S3StorageConfig>(defaultConfig);
  const [showSecrets, setShowSecrets] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testedConfig, setTestedConfig] = useState<S3StorageConfig | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!config.endpoint && config.region) {
      const selectedRegion = backblazeRegions.find((r) => r.value === config.region);
      if (selectedRegion) {
        setConfig((prev) => ({
          ...prev,
          endpoint: `https://${selectedRegion.endpoint}`,
          publicUrlBase: prev.bucketName
            ? `https://${selectedRegion.endpoint}/${prev.bucketName}`
            : prev.publicUrlBase,
        }));
      }
    }
  }, []);

  const handleChange = (field: keyof S3StorageConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    if (field === "region") {
      const selectedRegion = backblazeRegions.find((r) => r.value === value);
      if (selectedRegion) {
        setConfig((prev) => ({
          ...prev,
          region: value,
          endpoint: `https://${selectedRegion.endpoint}`,
          publicUrlBase: prev.bucketName
            ? `https://${selectedRegion.endpoint}/${prev.bucketName}`
            : prev.publicUrlBase,
        }));
      }
    }
    if (field === "bucketName" && value && config.region) {
      const selectedRegion = backblazeRegions.find((r) => r.value === config.region);
      if (selectedRegion) {
        setConfig((prev) => ({
          ...prev,
          bucketName: value,
          publicUrlBase: `https://${selectedRegion.endpoint}/${value}`,
        }));
      }
    }
  };

  const isConfigEqual = (cfg1: S3StorageConfig | null, cfg2: S3StorageConfig) => {
    if (!cfg1) return false;
    return (
      cfg1.bucketName === cfg2.bucketName &&
      cfg1.region === cfg2.region &&
      cfg1.endpoint === cfg2.endpoint &&
      cfg1.accessKeyId === cfg2.accessKeyId &&
      cfg1.secretAccessKey === cfg2.secretAccessKey
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!testResult || !testResult.success || !isConfigEqual(testedConfig, config)) {
        throw new Error(
          "Please test and validate your S3 configuration before saving. " +
            (testResult && !testResult.success ? "Last test failed, fix errors first." : "")
        );
      }
      const saved = saveS3Config(config);
      if (saved) {
        toast({
          title: "Configuration saved",
          description: "Your S3 storage configuration has been saved successfully.",
        });
      } else {
        throw new Error("Failed to save configuration");
      }
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      if (
        !config.bucketName ||
        !config.region ||
        !config.endpoint ||
        !config.accessKeyId ||
        !config.secretAccessKey
      ) {
        throw new Error("All fields are required for testing");
      }
      console.log("Testing S3 connection with:");
      console.log(`- Bucket: ${config.bucketName}`);
      console.log(`- Region: ${config.region}`);
      console.log(`- Endpoint: ${config.endpoint}`);
      console.log(`- Access Key ID: ${config.accessKeyId.substring(0, 3)}...`);
      console.log(`- Public URL Base: ${config.publicUrlBase || "Not specified"}`);
      const result = await testS3Connection(config);
      setTestResult(result);
      setTestedConfig({ ...config });
      if (result.success) {
        toast({
          title: "Credentials validated",
          description: "Your Backblaze B2 credentials appear to be valid.",
        });
      } else {
        toast({
          title: "Connection test failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      });
      toast({
        title: "Test failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Cloud className="w-5 h-5 mr-2 text-blue" />
            S3 Storage Configuration
          </CardTitle>
          <CardDescription>
            Configure Backblaze B2 Cloud Storage for file uploads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="config">
            <TabsList className="mb-4">
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="help">Help</TabsTrigger>
            </TabsList>
            <TabsContent value="config">
              <div className="space-y-6">
                <S3ConfigForm
                  config={config}
                  showSecrets={showSecrets}
                  onChange={handleChange}
                  onToggleSecrets={() => setShowSecrets((s) => !s)}
                />
                {testResult && (
                  <Alert
                    variant={testResult.success ? "default" : "destructive"}
                    className="mt-4"
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertTitle>
                      {testResult.success ? "Credentials Validated" : "Error"}
                    </AlertTitle>
                    <AlertDescription>{testResult.message}</AlertDescription>
                  </Alert>
                )}
                {testResult && testResult.success && (
                  <S3PostTestAlert />
                )}
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleTest}
                    disabled={isTesting || isSaving}
                    className="flex items-center"
                  >
                    {isTesting ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Server className="mr-2 h-4 w-4" />
                        Test Connection
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={
                      isTesting ||
                      isSaving ||
                      !testResult ||
                      !testResult.success ||
                      !isConfigEqual(testedConfig, config)
                    }
                    className="flex items-center"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Cloud className="mr-2 h-4 w-4" />
                        Save Configuration
                      </>
                    )}
                  </Button>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  <p className="font-semibold text-sm mb-1">
                    Troubleshooting S3 File Uploads:
                  </p>
                  <ol className="list-decimal ml-5 space-y-1">
                    <li>
                      Confirm your Access Key ID and Secret Access Key are correct
                    </li>
                    <li>
                      Make sure your bucket name is correctly spelled and exists in
                      your Backblaze account
                    </li>
                    <li>
                      Verify your bucket is set to "Public" in Backblaze B2
                    </li>
                    <li>
                      Add proper CORS configuration to your bucket (see Help tab)
                    </li>
                    <li>
                      Check browser console for detailed error messages
                    </li>
                  </ol>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="help">
              <S3ConfigHelpTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
export default S3ConfigurationPanel;
