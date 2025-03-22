
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

    // Create a proper Word document format using a simple HTML approach
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:w="urn:schemas-microsoft-com:office:word" 
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>Latin Mix Masters Installation Guide</title>
        <!-- Word specific styling -->
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
          </w:WordDocument>
        </xml>
        <style>
          body { font-family: Calibri, sans-serif; line-height: 1.5; }
          h1, h2, h3 { font-family: Calibri, sans-serif; }
          code, pre { font-family: Consolas, monospace; background-color: #f5f5f5; padding: 2px 4px; }
          pre { padding: 8px; white-space: pre-wrap; margin: 10px 0; }
        </style>
      </head>
      <body>
        <h1>Latin Mix Masters - Installation Guide</h1>
        
        <h2>VPS Installation Instructions</h2>
        
        <h3>1. Prepare Your VPS</h3>
        <ol>
          <li>Choose a VPS provider: DigitalOcean, Linode, AWS EC2, etc.</li>
          <li>Create a new VPS: Choose Ubuntu 22.04 LTS (recommended)</li>
          <li>SSH into your server: <code>ssh root@your_server_ip</code></li>
        </ol>
        
        <h3>2. Set Up the Server Environment</h3>
        <ol>
          <li>Update system packages:
            <pre>apt update && apt upgrade -y</pre>
          </li>
          <li>Install Node.js and npm:
            <pre>curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs</pre>
          </li>
          <li>Install necessary tools:
            <pre>apt install -y git nginx certbot python3-certbot-nginx</pre>
          </li>
        </ol>
        
        <h3>3. Clone and Set Up the Application</h3>
        <ol>
          <li>Create a directory for your application:
            <pre>mkdir -p /var/www/latinmixmasters</pre>
          </li>
          <li>Clone your repository:
            <pre>git clone https://your-repo-url.git /var/www/latinmixmasters
cd /var/www/latinmixmasters</pre>
          </li>
          <li>Install dependencies and build:
            <pre>npm install
npm run build</pre>
          </li>
        </ol>
        
        <h3>4. Configure Nginx</h3>
        <ol>
          <li>Create Nginx config:
            <pre>nano /etc/nginx/sites-available/latinmixmasters</pre>
          </li>
          <li>Add the following configuration:
            <pre>server {
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
}</pre>
          </li>
          <li>Enable the site and set up SSL:
            <pre>ln -s /etc/nginx/sites-available/latinmixmasters /etc/nginx/sites-enabled/
certbot --nginx -d your-domain.com -d www.your-domain.com
nginx -t && systemctl restart nginx</pre>
          </li>
        </ol>
        
        <h3>5. Set Up Supabase</h3>
        <p>If you're using Supabase:</p>
        <ol>
          <li>No additional setup is needed for Supabase Edge Functions as they run on Supabase's infrastructure</li>
          <li>Make sure your production environment variables are set in the Supabase dashboard</li>
        </ol>
        
        <h3>6. Create a Service for Your Application</h3>
        <ol>
          <li>Create a systemd service file:
            <pre>nano /etc/systemd/system/latinmixmasters.service</pre>
          </li>
          <li>Add the following configuration:
            <pre>[Unit]
Description=Latin Mix Masters Radio Application
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/latinmixmasters
ExecStart=/usr/bin/npm run preview
Restart=on-failure

[Install]
WantedBy=multi-user.target</pre>
          </li>
          <li>Enable and start the service:
            <pre>systemctl enable latinmixmasters
systemctl start latinmixmasters</pre>
          </li>
        </ol>
        
        <h2>Setting Up Auto-Update Functionality</h2>
        
        <h3>Creating Update Scripts</h3>
        <ol>
          <li>Create an update script on your server:
            <pre>nano /var/www/latinmixmasters/update.sh</pre>
          </li>
          <li>Add the following content:
            <pre>#!/bin/bash
cd /var/www/latinmixmasters
git pull
npm install
npm run build
systemctl restart latinmixmasters</pre>
          </li>
          <li>Make it executable:
            <pre>chmod +x /var/www/latinmixmasters/update.sh</pre>
          </li>
          <li>Configure sudo permissions:
            <pre>visudo</pre>
          </li>
          <li>Add this line (assuming your web server runs as www-data):
            <pre>www-data ALL=(ALL) NOPASSWD: /var/www/latinmixmasters/update.sh</pre>
          </li>
        </ol>
        
        <h3>Setting Up a Webhook</h3>
        <ol>
          <li>Install a simple webhook server:
            <pre>npm install -g webhook</pre>
          </li>
          <li>Create a webhook configuration:
            <pre>mkdir -p /etc/webhook
nano /etc/webhook/hooks.json</pre>
          </li>
          <li>Add this configuration:
            <pre>[
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
]</pre>
          </li>
          <li>Create a service for the webhook:
            <pre>nano /etc/systemd/system/webhook.service</pre>
          </li>
          <li>Add this configuration:
            <pre>[Unit]
Description=Webhook for Latin Mix Masters updates
After=network.target

[Service]
ExecStart=/usr/local/bin/webhook -hooks /etc/webhook/hooks.json -verbose
Restart=on-failure

[Install]
WantedBy=multi-user.target</pre>
          </li>
          <li>Enable and start the webhook service:
            <pre>systemctl enable webhook
systemctl start webhook</pre>
          </li>
          <li>Update your Nginx configuration:
            <pre>nano /etc/nginx/sites-available/latinmixmasters</pre>
          </li>
          <li>Add this location block:
            <pre>location /hooks/ {
    proxy_pass http://localhost:9000/hooks/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}</pre>
          </li>
          <li>Restart Nginx:
            <pre>nginx -t && systemctl restart nginx</pre>
          </li>
        </ol>
        
        <h3>Maintenance Recommendations</h3>
        <ol>
          <li>Set up automatic backups:
            <pre>apt install -y duplicity</pre>
          </li>
          <li>Create a backup script:
            <pre>nano /root/backup.sh</pre>
          </li>
          <li>Add backup commands:
            <pre>#!/bin/bash
duplicity /var/www/latinmixmasters file:///var/backups/latinmixmasters</pre>
          </li>
          <li>Set up a cron job:
            <pre>crontab -e</pre>
          </li>
          <li>Add this line for daily backups:
            <pre>0 2 * * * /root/backup.sh</pre>
          </li>
        </ol>
      </body>
      </html>
    `;

    // Create a Blob with the HTML content and the correct MIME type for Word
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    
    // Create and trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'LatinMixMasters_Installation_Guide.doc';
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
