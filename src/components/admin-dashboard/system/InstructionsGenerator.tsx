
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Clipboard, Check, Link, Github } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateWordDocument } from './wordDocumentGenerator';

const InstructionsGenerator: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  const serverSetupSteps = [
    "**1. Server Preparation**:\n```bash\n# Update system packages\nsudo apt update && sudo apt upgrade -y\n\n# Install essential dependencies\nsudo apt install -y curl wget git build-essential nginx\n```",
    "**2. Install Node.js**:\n```bash\n# Install NVM\ncurl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash\nexport NVM_DIR=\"$HOME/.nvm\"\n[ -s \"$NVM_DIR/nvm.sh\" ] && \\. \"$NVM_DIR/nvm.sh\"\n\n# Install Node.js LTS\nnvm install 18\nnvm use 18\nnvm alias default 18\n```",
    "**3. Clone Repository**:\n```bash\n# Create application directory\nsudo mkdir -p /var/www/latinmixmasters\nsudo chown -R $USER:$USER /var/www/latinmixmasters\n\n# Clone repository\ncd /var/www/latinmixmasters\ngit clone https://github.com/yourusername/latinmixmasters.git .\n```",
    "**4. Install Dependencies & Build**:\n```bash\n# Clean npm cache and increase memory limit\nnpm cache clean --force\nexport NODE_OPTIONS=\"--max-old-space-size=8192\"\n\n# Install dependencies\nnpm install --legacy-peer-deps\n\n# Build application\nnpm run build\n```",
    "**5. Configure Nginx**:\n```bash\n# Create Nginx site configuration\nsudo nano /etc/nginx/sites-available/latinmixmasters\n\n# Paste the following configuration\nserver {\n    listen 80;\n    server_name yourdomain.com www.yourdomain.com;\n\n    root /var/www/latinmixmasters/dist;\n    index index.html;\n\n    location / {\n        try_files $uri $uri/ /index.html;\n    }\n\n    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {\n        expires 30d;\n        add_header Cache-Control \"public, no-transform\";\n    }\n\n    # Add proper CORS headers\n    add_header Access-Control-Allow-Origin \"*\";\n    add_header Access-Control-Allow-Methods \"GET, POST, OPTIONS, PUT, DELETE\";\n    add_header Access-Control-Allow-Headers \"DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization\";\n    add_header Access-Control-Allow-Credentials \"true\";\n}\n```",
    "**6. Enable Site & Restart Nginx**:\n```bash\n# Enable site and remove default site\nsudo ln -sf /etc/nginx/sites-available/latinmixmasters /etc/nginx/sites-enabled/\nsudo rm -f /etc/nginx/sites-enabled/default\n\n# Test Nginx configuration\nsudo nginx -t\n\n# Restart Nginx\nsudo systemctl restart nginx\n```",
    "**7. Set Up SSL (Optional)**:\n```bash\n# Install Certbot\nsudo apt install -y certbot python3-certbot-nginx\n\n# Generate SSL certificates\nsudo certbot --nginx -d yourdomain.com -d www.yourdomain.com\n```",
    "**8. Set Up PM2 for Process Management**:\n```bash\n# Install PM2 globally\nsudo npm install -g pm2\n\n# Start application with PM2\ncd /var/www/latinmixmasters\npm2 start npm --name \"latinmixmasters\" -- run preview\n\n# Configure PM2 to start on boot\npm2 save\npm2 startup\n```",
    "**9. Configure Webhook for Updates**:\n```bash\n# Create update script\ncat > /var/www/latinmixmasters/update.sh << 'EOL'\n#!/bin/bash\ncd /var/www/latinmixmasters\ngit pull\nnpm install --legacy-peer-deps\nnpm run build\npm2 restart latinmixmasters\necho \"Update completed at $(date)\"\nEOL\n\n# Make script executable\nchmod +x /var/www/latinmixmasters/update.sh\n```"
  ];

  const webhookSetupInstructions = `
# Setting Up Webhook for Automatic Updates

1. **Create a webhook endpoint on your server**:
   - You'll need to set up a small web server to receive webhook requests
   - The webhook will trigger your update script

2. **Example using a simple Node.js webhook server**:
   \`\`\`bash
   # Install webhook server
   npm install -g webhook-server
   
   # Create webhook configuration
   cat > /var/www/webhook-config.json << 'EOL'
   {
     "webhooks": [
       {
         "id": "update-app",
         "execute-command": "/var/www/latinmixmasters/update.sh",
         "command-working-directory": "/var/www/latinmixmasters"
       }
     ]
   }
   EOL
   
   # Start webhook server
   webhook-server -config /var/www/webhook-config.json -port 9000
   \`\`\`

3. **Set up process management for webhook server**:
   \`\`\`bash
   # Create system service
   sudo nano /etc/systemd/system/webhook.service
   
   # Add the following content:
   [Unit]
   Description=Webhook Server
   After=network.target
   
   [Service]
   Type=simple
   User=root
   ExecStart=/usr/bin/webhook-server -config /var/www/webhook-config.json -port 9000
   Restart=on-failure
   
   [Install]
   WantedBy=multi-user.target
   
   # Enable and start the service
   sudo systemctl enable webhook.service
   sudo systemctl start webhook.service
   \`\`\`

4. **Configure firewall to allow webhook port**:
   \`\`\`bash
   sudo ufw allow 9000/tcp
   \`\`\`

5. **Use the webhook URL in the admin panel**:
   - Webhook URL: http://your-server-ip:9000/hooks/update-app
   - For security, consider adding a secret token or setting up SSL
  `;

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(section);
      toast({
        title: "Copied to clipboard",
        description: `${section} instructions have been copied to clipboard.`
      });
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error("Failed to copy: ", error);
      toast({
        title: "Copy Failed",
        description: "Failed to copy instructions to clipboard.",
        variant: "destructive"
      });
    }
  };

  const handleGenerateDocument = async () => {
    setIsGenerating(true);
    try {
      await generateWordDocument(
        "Latin Mix Masters - VPS Installation Guide", 
        [...serverSetupSteps, webhookSetupInstructions]
      );
      toast({
        title: "Document Generated",
        description: "Installation guide has been downloaded as a Word document."
      });
    } catch (error) {
      console.error("Document generation error:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate installation document.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">VPS Installation Instructions</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGenerateDocument}
            disabled={isGenerating}
          >
            <Download className="h-4 w-4 mr-2" />
            {isGenerating ? "Generating..." : "Export as Document"}
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="p-4 bg-muted rounded-md">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">Server Setup Steps</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => copyToClipboard(serverSetupSteps.join("\n\n"), "Server Setup")}
              className="h-8"
            >
              {copied === "Server Setup" ? (
                <><Check className="h-4 w-4 mr-1" /> Copied</>
              ) : (
                <><Clipboard className="h-4 w-4 mr-1" /> Copy All</>
              )}
            </Button>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {serverSetupSteps.map((step, index) => (
              <div key={index} className="pb-3 border-b border-border last:border-0 last:pb-0">
                <div dangerouslySetInnerHTML={{ __html: step
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/```bash\n([\s\S]*?)```/g, '<pre class="bg-background p-3 rounded-md overflow-x-auto text-xs my-2">$1</pre>')
                }} />
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 bg-muted rounded-md">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">Webhook Setup for Auto-Updates</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => copyToClipboard(webhookSetupInstructions, "Webhook Setup")}
            >
              {copied === "Webhook Setup" ? (
                <><Check className="h-4 w-4 mr-1" /> Copied</>
              ) : (
                <><Clipboard className="h-4 w-4 mr-1" /> Copy</>
              )}
            </Button>
          </div>
          <div 
            className="text-sm space-y-2"
            dangerouslySetInnerHTML={{ __html: webhookSetupInstructions
              .replace(/\n/g, '<br>')
              .replace(/```bash\n([\s\S]*?)```/g, '<pre class="bg-background p-3 rounded-md overflow-x-auto text-xs my-2">$1</pre>')
            }}
          />
        </div>
        
        <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Link className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Quick Deployment with GitHub</h4>
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
                Use our deployment script for a faster and more reliable installation process:
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Button variant="outline" size="sm" className="bg-blue-100 dark:bg-blue-900 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-300">
                  <Github className="h-4 w-4 mr-2" />
                  View Scripts on GitHub
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionsGenerator;
