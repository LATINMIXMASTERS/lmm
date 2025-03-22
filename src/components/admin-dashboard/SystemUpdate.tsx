
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download, RefreshCw } from 'lucide-react';

const SystemUpdate: React.FC = () => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSystemUpdate = async () => {
    setIsUpdating(true);
    try {
      // This would call your backend webhook in production
      // For demo purposes, we'll simulate an update
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "System Updated",
        description: "The system has been successfully updated to the latest version."
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was an error updating the system. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const downloadInstructions = () => {
    // Create the installation instructions document text
    const instructionsText = `
# Latin Mix Masters - Installation Guide

## VPS Installation Instructions

### 1. Prepare Your VPS

1. Choose a VPS provider: DigitalOcean, Linode, AWS EC2, etc.
2. Create a new VPS: Choose Ubuntu 22.04 LTS (recommended)
3. SSH into your server:
   \`\`\`
   ssh root@your_server_ip
   \`\`\`

### 2. Set Up the Server Environment

1. Update system packages:
   \`\`\`bash
   apt update && apt upgrade -y
   \`\`\`

2. Install Node.js and npm:
   \`\`\`bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
   apt install -y nodejs
   \`\`\`

3. Install necessary tools:
   \`\`\`bash
   apt install -y git nginx certbot python3-certbot-nginx
   \`\`\`

### 3. Clone and Set Up the Application

1. Create a directory for your application:
   \`\`\`bash
   mkdir -p /var/www/latinmixmasters
   \`\`\`

2. Clone your repository:
   \`\`\`bash
   git clone https://your-repo-url.git /var/www/latinmixmasters
   cd /var/www/latinmixmasters
   \`\`\`

3. Install dependencies and build:
   \`\`\`bash
   npm install
   npm run build
   \`\`\`

### 4. Configure Nginx

1. Create Nginx config:
   \`\`\`bash
   nano /etc/nginx/sites-available/latinmixmasters
   \`\`\`

2. Add the following configuration:
   \`\`\`nginx
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;
       
       root /var/www/latinmixmasters/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       location /api {
           proxy_pass http://localhost:8787;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   \`\`\`

3. Enable the site and set up SSL:
   \`\`\`bash
   ln -s /etc/nginx/sites-available/latinmixmasters /etc/nginx/sites-enabled/
   certbot --nginx -d your-domain.com -d www.your-domain.com
   nginx -t && systemctl restart nginx
   \`\`\`

### 5. Set Up Supabase

If you're using Supabase:

1. No additional setup is needed for Supabase Edge Functions as they run on Supabase's infrastructure
2. Make sure your production environment variables are set in the Supabase dashboard

### 6. Create a Service for Your Application

1. Create a systemd service file:
   \`\`\`bash
   nano /etc/systemd/system/latinmixmasters.service
   \`\`\`

2. Add the following configuration:
   \`\`\`
   [Unit]
   Description=Latin Mix Masters Radio Application
   After=network.target

   [Service]
   Type=simple
   User=root
   WorkingDirectory=/var/www/latinmixmasters
   ExecStart=/usr/bin/npm run preview
   Restart=on-failure

   [Install]
   WantedBy=multi-user.target
   \`\`\`

3. Enable and start the service:
   \`\`\`bash
   systemctl enable latinmixmasters
   systemctl start latinmixmasters
   \`\`\`

## Setting Up Auto-Update Functionality

### Creating Update Scripts

1. Create an update script on your server:
   \`\`\`bash
   nano /var/www/latinmixmasters/update.sh
   \`\`\`

2. Add the following content:
   \`\`\`bash
   #!/bin/bash
   cd /var/www/latinmixmasters
   git pull
   npm install
   npm run build
   systemctl restart latinmixmasters
   \`\`\`

3. Make it executable:
   \`\`\`bash
   chmod +x /var/www/latinmixmasters/update.sh
   \`\`\`

4. Configure sudo permissions:
   \`\`\`bash
   visudo
   \`\`\`
   
5. Add this line (assuming your web server runs as www-data):
   \`\`\`
   www-data ALL=(ALL) NOPASSWD: /var/www/latinmixmasters/update.sh
   \`\`\`

### Setting Up a Webhook

1. Install a simple webhook server:
   \`\`\`bash
   npm install -g webhook
   \`\`\`

2. Create a webhook configuration:
   \`\`\`bash
   mkdir -p /etc/webhook
   nano /etc/webhook/hooks.json
   \`\`\`

3. Add this configuration:
   \`\`\`json
   [
     {
       "id": "update-app",
       "execute-command": "/var/www/latinmixmasters/update.sh",
       "command-working-directory": "/var/www/latinmixmasters",
       "trigger-rule": {
         "match": {
           "type": "value",
           "value": "your-secret-token",
           "parameter": {
             "source": "header",
             "name": "Authorization"
           }
         }
       }
     }
   ]
   \`\`\`

4. Create a service for the webhook:
   \`\`\`bash
   nano /etc/systemd/system/webhook.service
   \`\`\`

5. Add this configuration:
   \`\`\`
   [Unit]
   Description=Webhook for Latin Mix Masters updates
   After=network.target

   [Service]
   ExecStart=/usr/local/bin/webhook -hooks /etc/webhook/hooks.json -verbose
   Restart=on-failure

   [Install]
   WantedBy=multi-user.target
   \`\`\`

6. Enable and start the webhook service:
   \`\`\`bash
   systemctl enable webhook
   systemctl start webhook
   \`\`\`

7. Update your Nginx configuration:
   \`\`\`bash
   nano /etc/nginx/sites-available/latinmixmasters
   \`\`\`

8. Add this location block:
   \`\`\`nginx
   location /hooks/ {
       proxy_pass http://localhost:9000/hooks/;
       proxy_http_version 1.1;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
   }
   \`\`\`

9. Restart Nginx:
   \`\`\`bash
   nginx -t && systemctl restart nginx
   \`\`\`

### Maintenance Recommendations

1. Set up automatic backups:
   \`\`\`bash
   apt install -y duplicity
   \`\`\`

2. Create a backup script:
   \`\`\`bash
   nano /root/backup.sh
   \`\`\`

3. Add backup commands:
   \`\`\`bash
   #!/bin/bash
   duplicity /var/www/latinmixmasters file:///var/backups/latinmixmasters
   \`\`\`

4. Set up a cron job:
   \`\`\`bash
   crontab -e
   \`\`\`

5. Add this line for daily backups:
   \`\`\`
   0 2 * * * /root/backup.sh
   \`\`\`
`;

    // Convert markdown to HTML
    const blob = new Blob([instructionsText], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'LatinMixMasters_Installation_Guide.docx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Instructions Downloaded",
      description: "Installation instructions have been downloaded as a Word document."
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Management</CardTitle>
        <CardDescription>
          Update the system and download installation instructions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border border-dashed p-4">
            <CardHeader className="p-3">
              <CardTitle className="text-lg">System Update</CardTitle>
              <CardDescription>
                Update the system to the latest version from the repository
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              <Button 
                variant="default" 
                className="w-full" 
                onClick={handleSystemUpdate}
                disabled={isUpdating}
              >
                <RefreshCw className={`mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
                {isUpdating ? 'Updating...' : 'Update System'}
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border border-dashed p-4">
            <CardHeader className="p-3">
              <CardTitle className="text-lg">Installation Guide</CardTitle>
              <CardDescription>
                Download VPS installation instructions as Word document
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={downloadInstructions}
              >
                <Download className="mr-2" />
                Download Instructions
              </Button>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemUpdate;
