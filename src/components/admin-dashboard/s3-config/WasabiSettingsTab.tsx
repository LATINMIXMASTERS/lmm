
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ClipboardCopy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { wasabiRegions } from './S3ConfigTypes';
import { getWasabiCorsConfig } from './S3ConfigUtils';

interface WasabiSettingsTabProps {
  onSelectRegion: (regionId: string) => void;
}

const WasabiSettingsTab: React.FC<WasabiSettingsTabProps> = ({ onSelectRegion }) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string, successMessage: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: successMessage
      });
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 dark:bg-amber-950 rounded-md p-3 mb-3">
        <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Wasabi Configuration Guide</h3>
        <ol className="list-decimal text-sm ml-4 space-y-2 text-amber-800 dark:text-amber-300">
          <li>Create a bucket in your Wasabi account</li>
          <li>Create an access key and secret key from the Wasabi console</li>
          <li>Select your Wasabi region from the list below</li>
          <li>Set up CORS configuration for your bucket (see below)</li>
        </ol>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label>Select Wasabi Region</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {wasabiRegions.map(region => (
              <Button 
                key={region.value} 
                variant="outline" 
                onClick={() => onSelectRegion(region.value)}
                className="justify-start overflow-hidden text-ellipsis whitespace-nowrap"
              >
                {region.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <Label>CORS Configuration</Label>
          <div className="relative">
            <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-xs overflow-auto max-h-40 text-slate-900 dark:text-slate-100">
              {getWasabiCorsConfig()}
            </pre>
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard(getWasabiCorsConfig(), "CORS configuration copied")}
            >
              <ClipboardCopy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Paste this configuration in your Wasabi bucket's CORS settings
          </p>
        </div>
      </div>
    </div>
  );
};

export default WasabiSettingsTab;
