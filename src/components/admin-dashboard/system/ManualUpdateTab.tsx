
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Clipboard, Check, Terminal, Server } from 'lucide-react';
import { updateScripts } from './updateScripts';

interface ManualUpdateTabProps {
  onCopyScript: (script: string) => Promise<void>;
  copied: boolean;
}

const ManualUpdateTab: React.FC<ManualUpdateTabProps> = ({ onCopyScript, copied }) => {
  const [scriptType, setScriptType] = useState<'standard' | 'pm2'>('standard');

  const handleCopyScript = async () => {
    await onCopyScript(updateScripts[scriptType]);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Server Type
        </label>
        <div className="flex space-x-2">
          <Button 
            variant={scriptType === 'standard' ? 'default' : 'outline'} 
            className="flex-1"
            onClick={() => setScriptType('standard')}
          >
            <Server className="w-4 h-4 mr-2" />
            Systemd
          </Button>
          <Button 
            variant={scriptType === 'pm2' ? 'default' : 'outline'} 
            className="flex-1"
            onClick={() => setScriptType('pm2')}
          >
            <Terminal className="w-4 h-4 mr-2" />
            PM2
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Manual Update Script
        </label>
        <div className="relative">
          <pre className="p-4 rounded-md bg-muted text-xs overflow-x-auto max-h-48 overflow-y-auto text-foreground">
            {updateScripts[scriptType]}
          </pre>
          <Button 
            size="sm" 
            className="absolute top-2 right-2" 
            onClick={handleCopyScript}
            variant="secondary"
          >
            {copied ? (
              <><Check className="w-4 h-4 mr-1" /> Copied</>
            ) : (
              <><Clipboard className="w-4 h-4 mr-1" /> Copy</>
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Copy this script and run it on your VPS to update manually
        </p>
      </div>
      
      <div className="p-3 rounded-md bg-muted">
        <h4 className="text-sm font-medium mb-2 text-foreground">Manual Update Instructions:</h4>
        <ol className="text-xs space-y-1 list-decimal list-inside text-muted-foreground">
          <li>SSH into your server: <code className="bg-background px-1 rounded">ssh user@your-server</code></li>
          <li>Navigate to your application directory: <code className="bg-background px-1 rounded">cd /var/www/latinmixmasters</code></li>
          <li>Copy the script above into a file: <code className="bg-background px-1 rounded">nano update.sh</code></li>
          <li>Make the script executable: <code className="bg-background px-1 rounded">chmod +x update.sh</code></li>
          <li>Run the script: <code className="bg-background px-1 rounded">./update.sh</code></li>
        </ol>
      </div>
    </div>
  );
};

export default ManualUpdateTab;
