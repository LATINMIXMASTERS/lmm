
#!/bin/bash
set -e

echo "=== Latin Mix Masters Ubuntu Installation Script ==="
echo "This script will setup Latin Mix Masters on your Ubuntu server"

# Check if running as root
if [ "$(id -u)" != "0" ]; then
  echo "This script must be run as root. Please use sudo."
  exit 1
fi

# Create application directory
APP_DIR="/var/www/latinmixmasters"
echo "Creating application directory at $APP_DIR..."
mkdir -p $APP_DIR
chown -R $USER:$USER $APP_DIR

# Navigate to application directory
cd $APP_DIR
echo "Changed to directory: $(pwd)"

# Check if package.json exists (to handle the ENOENT error)
if [ ! -f "package.json" ]; then
  echo "package.json not found. This could mean:"
  echo "1. You haven't uploaded the application files yet"
  echo "2. You're in the wrong directory"
  echo "3. The repository wasn't properly cloned"
  
  read -p "Would you like to download the application from a Git repository? (y/n): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter the Git repository URL: " repo_url
    echo "Cloning from $repo_url..."
    git clone $repo_url .
    
    if [ ! -f "package.json" ]; then
      echo "ERROR: package.json still not found after cloning. Please check the repository."
      exit 1
    fi
  else
    echo "Please upload your application files to $APP_DIR and ensure package.json exists."
    echo "You can transfer files using SCP, SFTP, or by uploading a ZIP archive."
    echo ""
    echo "Example SCP command (run from your local machine):"
    echo "scp -r /path/to/local/latinmixmasters/* user@your-server:$APP_DIR/"
    exit 1
  fi
fi

# Install Node.js if not already installed
if ! command -v node &> /dev/null; then
  echo "Installing Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
  apt-get install -y nodejs
fi

# Install PM2 if not already installed
if ! command -v pm2 &> /dev/null; then
  echo "Installing PM2..."
  npm install -g pm2
fi

# Create logs directory
mkdir -p logs

# Optimize npm for faster installation
echo "Configuring npm for faster installation..."
npm config set fund false
npm config set audit false
npm config set progress false

# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Install dependencies with reduced output
echo "Installing dependencies (this may take a few minutes)..."
npm install --no-audit --no-fund --silent > logs/npm-install.log 2>&1 || {
  echo "ERROR: npm install failed. Check logs/npm-install.log for details."
  cat logs/npm-install.log
  exit 1
}

# Build the application
echo "Building the application..."
npm run build > logs/build.log 2>&1 || {
  echo "ERROR: Build failed. Check logs/build.log for details."
  cat logs/build.log
  exit 1
}

# Setup Nginx
echo "Setting up Nginx..."

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
  echo "Installing Nginx..."
  apt-get install -y nginx
fi

# Create nginx config
cat > /etc/nginx/sites-available/latinmixmasters << EOF
server {
    listen 80;
    server_name _;

    root $APP_DIR/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Add proper CORS headers
    add_header Access-Control-Allow-Origin "*";
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, DELETE";
    add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
    add_header Access-Control-Allow-Credentials "true";
}
EOF

# Enable site and remove default site
ln -sf /etc/nginx/sites-available/latinmixmasters /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t || {
  echo "ERROR: Nginx configuration failed. Please check the configuration."
  exit 1
}

# Restart Nginx
systemctl restart nginx

# Create optimized ecosystem file for better synchronization
echo "Creating optimized PM2 configuration..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: "latinmixmasters",
    script: "npm",
    args: "start",
    instances: 1,
    exec_mode: "fork",
    watch: false,
    max_memory_restart: "300M",
    env: {
      NODE_ENV: "production",
      REACT_APP_SYNC_INTERVAL: "2000",
      REACT_APP_FORCE_SYNC: "true" 
    }
  }]
};
EOF

# Setup PM2 for production
echo "Setting up PM2 for production..."
pm2 start ecosystem.config.js || {
  echo "Setting up with default configuration..."
  pm2 start npm --name "latinmixmasters" -- start
}

# Make scripts executable
if [ -f "optimize-sync.sh" ]; then
  chmod +x optimize-sync.sh
  echo "Applying synchronization optimizations..."
  ./optimize-sync.sh
fi
if [ -f "update.sh" ]; then
  chmod +x update.sh
fi

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
echo "Configuring PM2 to start on system boot..."
pm2 startup | tail -n 1 > logs/pm2-startup.log
echo "Run the command from logs/pm2-startup.log if you want PM2 to start on boot"

# Determine server IP
SERVER_IP=$(hostname -I | awk '{print $1}')

echo "=== Installation Complete ==="
echo "Your Latin Mix Masters application is now installed and running!"
echo "Access your application at http://$SERVER_IP"
echo ""
echo "Useful commands:"
echo "  pm2 status                  - Check application status"
echo "  pm2 logs latinmixmasters    - View application logs"
echo "  pm2 restart latinmixmasters - Restart the application"
echo "  ./update.sh                 - Update the application"

# Optional: Setup SSL with Certbot
echo ""
echo "To secure your site with HTTPS, you can run:"
echo "sudo apt install -y certbot python3-certbot-nginx"
echo "sudo certbot --nginx -d yourdomain.com"
