
#!/bin/bash
set -e

echo "=== Latin Mix Masters Fast VPS Installation ==="
echo "Optimized for Ubuntu 22.04 servers with limited resources"

# Define color codes for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# System optimization first - this helps the rest of the install process
echo -e "\n${GREEN}>>> Optimizing system performance...${NC}"
# Lower swappiness for better performance
sudo sysctl -w vm.swappiness=10
# Adjust cache pressure for better memory management
sudo sysctl -w vm.vfs_cache_pressure=50
# Add persistent settings
echo "vm.swappiness=10
vm.vfs_cache_pressure=50" | sudo tee -a /etc/sysctl.d/99-latinmixmasters.conf

# Update essential packages only
echo -e "\n${GREEN}>>> Updating essential packages...${NC}"
sudo apt-get update -y 
sudo apt-get install -y curl wget git build-essential nginx

# Install NVM with optimized settings
echo -e "\n${GREEN}>>> Installing NVM and Node.js...${NC}"
export NVM_DIR="$HOME/.nvm"
if [ ! -d "$NVM_DIR" ]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  nvm install 18 --no-progress
  nvm use 18
  nvm alias default 18
else
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  echo "NVM already installed, using existing installation"
fi

# Verify installation
node -v
npm -v

# Install dependencies with performance optimizations
if [ -f "package.json" ]; then
  echo -e "\n${GREEN}>>> Setting up application with optimizations...${NC}"
  
  # Clear npm cache and set performance flags
  npm cache clean --force
  export NODE_OPTIONS="--max-old-space-size=1024"
  
  # Install with optimizations for low-memory VPS
  echo -e "\n${YELLOW}>>> Installing dependencies with memory optimization for VPS...${NC}"
  # Install in smaller batches to prevent memory issues
  npm install --no-fund --no-audit --production=false --prefer-offline --legacy-peer-deps
  
  # Build with production optimizations
  echo -e "\n${GREEN}>>> Building the application...${NC}"
  NODE_ENV=production npm run build 
  
  # If build fails, try with even lower memory settings
  if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo -e "\n${YELLOW}>>> Attempting low-memory build...${NC}"
    export NODE_OPTIONS="--max-old-space-size=512"
    NODE_ENV=production npm run build -- --minify=false
  fi
else
  echo -e "\n${YELLOW}>>> ERROR: package.json not found! Deployment aborted.${NC}"
  exit 1
fi

# Set up Nginx with optimized config for low-resource VPS
echo -e "\n${GREEN}>>> Setting up optimized Nginx configuration...${NC}"
sudo bash -c 'cat > /etc/nginx/sites-available/latinmixmasters << EOL
server {
    listen 80;
    listen [::]:80;
    server_name _;

    root /var/www/latinmixmasters/dist;
    index index.html;
    
    # VPS performance optimizations
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;
    
    # Gzip compression for faster content delivery and less bandwidth
    gzip on;
    gzip_min_length 256;
    gzip_comp_level 5;
    gzip_types
        text/plain
        text/css
        application/javascript
        application/json;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)\$ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
    }
}
EOL'

# Enable site and restart Nginx
echo -e "\n${GREEN}>>> Configuring Nginx...${NC}"
sudo ln -sf /etc/nginx/sites-available/latinmixmasters /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default || true

# Test Nginx configuration
sudo nginx -t || {
  echo -e "\n${YELLOW}>>> Using simplified Nginx configuration...${NC}"
  sudo bash -c 'cat > /etc/nginx/sites-available/latinmixmasters << EOL
server {
    listen 80;
    root /var/www/latinmixmasters/dist;
    index index.html;
    location / { try_files \$uri \$uri/ /index.html; }
}
EOL'
  sudo nginx -t
}

# Restart Nginx
sudo systemctl restart nginx

# Setup PM2 for production 
echo -e "\n${GREEN}>>> Setting up PM2 with VPS optimizations...${NC}"
sudo npm install -g pm2@latest --no-progress || true

# Create optimized PM2 ecosystem file for low-resource VPS
cat > ecosystem.config.js << EOL
module.exports = {
  apps: [{
    name: "latinmixmasters",
    script: "npm",
    args: "run preview",
    instances: 1,
    exec_mode: "fork",
    watch: false,
    max_memory_restart: "150M",
    env: {
      NODE_ENV: "production",
      NODE_OPTIONS: "--max-old-space-size=150"
    }
  }]
};
EOL

# Start with PM2
if command -v pm2 >/dev/null 2>&1; then
  echo -e "\n${GREEN}>>> Starting application with PM2...${NC}"
  cd /var/www/latinmixmasters
  pm2 start ecosystem.config.js || pm2 start npm --name "latinmixmasters" -- run preview
  pm2 save
  # Set up PM2 to start on boot
  pm2 startup | tail -n 1 | bash
else
  echo -e "\n${YELLOW}>>> PM2 installation failed, skipping PM2 setup...${NC}"
fi

# Create an update script for easier future updates
echo -e "\n${GREEN}>>> Creating quick update script...${NC}"
cat > update.sh << EOL
#!/bin/bash
set -e
echo "=== Latin Mix Masters Quick Update ==="
timestamp=\$(date +"%Y%m%d_%H%M%S")
mkdir -p /var/backups/latinmixmasters
tar -czf /var/backups/latinmixmasters/backup_\$timestamp.tar.gz .
git pull
npm ci --production=false --prefer-offline --legacy-peer-deps
npm run build
pm2 restart latinmixmasters
echo "Update completed at \$(date)"
EOL
chmod +x update.sh

echo -e "\n${GREEN}=== Installation Complete! ====${NC}"
echo "Your application is ready to use on your VPS."
echo "To check server status: sudo systemctl status nginx"
echo "For PM2 status and logs: pm2 status && pm2 logs"
echo "To update in the future, just run: ./update.sh"
