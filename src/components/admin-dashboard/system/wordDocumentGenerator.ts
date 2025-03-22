
export const generateWordDocument = () => {
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

2. Install Node.js and npm (v18.x is recommended):
   \`\`\`bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
   apt install -y nodejs
   # Verify installation
   node -v  # Should show v18.x.x
   npm -v   # Should show 8.x.x or higher
   \`\`\`

   If you encounter issues with Node.js installation:
   \`\`\`bash
   # Alternative installation using NVM
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
   nvm install 18
   nvm use 18
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
   # Make sure you're in the project directory
   cd /var/www/latinmixmasters
   
   # Install dependencies
   npm install --legacy-peer-deps
   
   # If you encounter EACCES errors:
   sudo chown -R $(whoami) ~/.npm
   sudo chown -R $(whoami) /var/www/latinmixmasters
   
   # If you have memory issues during installation:
   export NODE_OPTIONS=--max_old_space_size=4096
   npm install --legacy-peer-deps
   
   # Build the application
   npm run build
   
   # If the build fails with memory errors:
   export NODE_OPTIONS=--max_old_space_size=4096
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
       
       # Important: Make sure this path matches your build output directory
       # It might be 'dist', 'build', or 'public' depending on your build config
       
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

   Troubleshooting Nginx:
   \`\`\`bash
   # Check for syntax errors in your config
   nginx -t
   
   # Check Nginx error logs
   tail -f /var/log/nginx/error.log
   
   # Check access logs
   tail -f /var/log/nginx/access.log
   
   # Ensure proper permissions on your web directory
   chmod -R 755 /var/www/latinmixmasters/dist
   \`\`\`

3. Enable the site and set up SSL:
   \`\`\`bash
   ln -s /etc/nginx/sites-available/latinmixmasters /etc/nginx/sites-enabled/
   
   # Remove default site if it exists and may conflict
   rm -f /etc/nginx/sites-enabled/default
   
   # Set up SSL (make sure your domain points to the server first)
   certbot --nginx -d your-domain.com -d www.your-domain.com
   
   # Restart Nginx to apply changes
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
   Environment=NODE_ENV=production
   # If you're running into memory issues, add:
   # Environment=NODE_OPTIONS=--max_old_space_size=4096

   [Install]
   WantedBy=multi-user.target
   \`\`\`

3. Enable and start the service:
   \`\`\`bash
   systemctl daemon-reload
   systemctl enable latinmixmasters
   systemctl start latinmixmasters
   
   # Check service status
   systemctl status latinmixmasters
   
   # View service logs if there are issues
   journalctl -u latinmixmasters -f
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
   
   # Exit on error
   set -e
   
   echo "Starting update process..."
   cd /var/www/latinmixmasters
   
   # Backup current version
   echo "Creating backup..."
   timestamp=$(date +"%Y%m%d_%H%M%S")
   mkdir -p /var/backups/latinmixmasters
   tar -czf /var/backups/latinmixmasters/backup_$timestamp.tar.gz .
   
   # Pull latest code
   echo "Pulling latest code..."
   git pull
   
   # Install dependencies
   echo "Installing dependencies..."
   export NODE_OPTIONS=--max_old_space_size=4096
   npm install --legacy-peer-deps
   
   # Build application
   echo "Building application..."
   npm run build
   
   # Restart the service
   echo "Restarting service..."
   systemctl restart latinmixmasters
   
   echo "Update completed successfully!"
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
   
   # If you get EACCES errors:
   mkdir -p ~/.npm-global
   npm config set prefix '~/.npm-global'
   export PATH=~/.npm-global/bin:$PATH
   echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
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
   # If you installed with npm-global, use the correct path:
   # ExecStart=/root/.npm-global/bin/webhook -hooks /etc/webhook/hooks.json -verbose
   Restart=on-failure

   [Install]
   WantedBy=multi-user.target
   \`\`\`

6. Enable and start the webhook service:
   \`\`\`bash
   systemctl daemon-reload
   systemctl enable webhook
   systemctl start webhook
   
   # Check webhook service status
   systemctl status webhook
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

### Common Troubleshooting

1. If npm install fails:
   \`\`\`bash
   # Clear npm cache
   npm cache clean --force
   
   # Try installing with --force
   npm install --legacy-peer-deps --force
   
   # If there are permission issues
   sudo chown -R $(whoami) ~/.npm
   sudo chown -R $(whoami) /var/www/latinmixmasters
   \`\`\`

2. If the application doesn't start:
   \`\`\`bash
   # Check service logs
   journalctl -u latinmixmasters -f
   
   # Check for build issues
   cd /var/www/latinmixmasters
   npm run build
   
   # Try running the app directly
   cd /var/www/latinmixmasters
   npm run preview
   \`\`\`

3. If Nginx isn't serving your site:
   \`\`\`bash
   # Check Nginx error logs
   tail -f /var/log/nginx/error.log
   
   # Verify your site is enabled
   ls -la /etc/nginx/sites-enabled/
   
   # Check for syntax errors
   nginx -t
   
   # Restart Nginx
   systemctl restart nginx
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

6. Monitor disk space:
   \`\`\`bash
   # Set up log rotation
   nano /etc/logrotate.d/latinmixmasters
   \`\`\`

7. Add this configuration:
   \`\`\`
   /var/log/latinmixmasters/*.log {
       daily
       missingok
       rotate 14
       compress
       delaycompress
       notifempty
       create 0640 www-data adm
   }
   \`\`\`
`;

  // Create HTML content for Word document
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
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <style>
        body { font-family: Calibri, sans-serif; line-height: 1.5; margin: 1cm; }
        h1 { font-size: 16pt; font-weight: bold; color: #2a5885; margin-top: 12pt; margin-bottom: 3pt; }
        h2 { font-size: 14pt; font-weight: bold; color: #2a5885; margin-top: 12pt; margin-bottom: 3pt; }
        h3 { font-size: 12pt; font-weight: bold; color: #2a5885; margin-top: 12pt; margin-bottom: 3pt; }
        code { font-family: "Courier New", monospace; background-color: #f5f5f5; padding: 2px 4px; }
        pre { font-family: "Courier New", monospace; background-color: #f5f5f5; padding: 8px; white-space: pre-wrap; margin: 10px 0; border: 1px solid #ddd; font-size: 10pt; }
        ol, ul { margin-left: 10pt; padding-left: 10pt; }
        p { margin-top: 6pt; margin-bottom: 6pt; }
        .note { background-color: #fff8dc; padding: 8px; border-left: 4px solid #ffeb3b; margin: 10px 0; }
        .warning { background-color: #ffebee; padding: 8px; border-left: 4px solid #f44336; margin: 10px 0; }
        .success { background-color: #e8f5e9; padding: 8px; border-left: 4px solid #4caf50; margin: 10px 0; }
        table { border-collapse: collapse; width: 100%; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
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
        <li>Install Node.js and npm (v18.x is recommended):
          <pre>curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
# Verify installation
node -v  # Should show v18.x.x
npm -v   # Should show 8.x.x or higher</pre>

          <div class="note">If you encounter issues with Node.js installation:</div>
          <pre># Alternative installation using NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"
nvm install 18
nvm use 18</pre>
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
          <pre># Make sure you're in the project directory
cd /var/www/latinmixmasters

# Install dependencies
npm install --legacy-peer-deps

# If you encounter EACCES errors:
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /var/www/latinmixmasters

# If you have memory issues during installation:
export NODE_OPTIONS=--max_old_space_size=4096
npm install --legacy-peer-deps

# Build the application
npm run build

# If the build fails with memory errors:
export NODE_OPTIONS=--max_old_space_size=4096
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
    
    # Important: Make sure this path matches your build output directory
    # It might be 'dist', 'build', or 'public' depending on your build config
    
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

          <div class="warning">Troubleshooting Nginx:</div>
          <pre># Check for syntax errors in your config
nginx -t

# Check Nginx error logs
tail -f /var/log/nginx/error.log

# Check access logs
tail -f /var/log/nginx/access.log

# Ensure proper permissions on your web directory
chmod -R 755 /var/www/latinmixmasters/dist</pre>
        </li>
        <li>Enable the site and set up SSL:
          <pre>ln -s /etc/nginx/sites-available/latinmixmasters /etc/nginx/sites-enabled/

# Remove default site if it exists and may conflict
rm -f /etc/nginx/sites-enabled/default

# Set up SSL (make sure your domain points to the server first)
certbot --nginx -d your-domain.com -d www.your-domain.com

# Restart Nginx to apply changes
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
Environment=NODE_ENV=production
# If you're running into memory issues, add:
# Environment=NODE_OPTIONS=--max_old_space_size=4096

[Install]
WantedBy=multi-user.target</pre>
        </li>
        <li>Enable and start the service:
          <pre>systemctl daemon-reload
systemctl enable latinmixmasters
systemctl start latinmixmasters

# Check service status
systemctl status latinmixmasters

# View service logs if there are issues
journalctl -u latinmixmasters -f</pre>
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

# Exit on error
set -e

echo "Starting update process..."
cd /var/www/latinmixmasters

# Backup current version
echo "Creating backup..."
timestamp=$(date +"%Y%m%d_%H%M%S")
mkdir -p /var/backups/latinmixmasters
tar -czf /var/backups/latinmixmasters/backup_$timestamp.tar.gz .

# Pull latest code
echo "Pulling latest code..."
git pull

# Install dependencies
echo "Installing dependencies..."
export NODE_OPTIONS=--max_old_space_size=4096
npm install --legacy-peer-deps

# Build application
echo "Building application..."
npm run build

# Restart the service
echo "Restarting service..."
systemctl restart latinmixmasters

echo "Update completed successfully!"</pre>
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
          <pre>npm install -g webhook

# If you get EACCES errors:
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
npm install -g webhook</pre>
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
# If you installed with npm-global, use the correct path:
# ExecStart=/root/.npm-global/bin/webhook -hooks /etc/webhook/hooks.json -verbose
Restart=on-failure

[Install]
WantedBy=multi-user.target</pre>
        </li>
        <li>Enable and start the webhook service:
          <pre>systemctl daemon-reload
systemctl enable webhook
systemctl start webhook

# Check webhook service status
systemctl status webhook</pre>
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
      
      <h3>Common Troubleshooting</h3>
      <div class="warning">
        <h4>If npm install fails:</h4>
        <pre># Clear npm cache
npm cache clean --force

# Try installing with --force
npm install --legacy-peer-deps --force

# If there are permission issues
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /var/www/latinmixmasters</pre>
      </div>
      
      <div class="warning">
        <h4>If the application doesn't start:</h4>
        <pre># Check service logs
journalctl -u latinmixmasters -f

# Check for build issues
cd /var/www/latinmixmasters
npm run build

# Try running the app directly
cd /var/www/latinmixmasters
npm run preview</pre>
      </div>
      
      <div class="warning">
        <h4>If Nginx isn't serving your site:</h4>
        <pre># Check Nginx error logs
tail -f /var/log/nginx/error.log

# Verify your site is enabled
ls -la /etc/nginx/sites-enabled/

# Check for syntax errors
nginx -t

# Restart Nginx
systemctl restart nginx</pre>
      </div>
      
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
        <li>Monitor disk space:
          <pre># Set up log rotation
nano /etc/logrotate.d/latinmixmasters</pre>
        </li>
        <li>Add this configuration:
          <pre>/var/log/latinmixmasters/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
}</pre>
        </li>
      </ol>
      
      <div class="success">
        <h4>Final Checklist</h4>
        <ul>
          <li>Confirm Node.js and npm are properly installed</li>
          <li>Verify all dependencies were installed successfully</li>
          <li>Check that the build process completed without errors</li>
          <li>Confirm Nginx is properly configured and running</li>
          <li>Verify SSL certificates are properly installed</li>
          <li>Check that your systemd service is running correctly</li>
          <li>Test the webhook endpoint for updates (if configured)</li>
          <li>Set up a proper backup and maintenance schedule</li>
        </ul>
      </div>
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
};
