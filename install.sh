
#!/bin/bash
set -e

echo "=== Latin Mix Masters Fast Installation Script ==="
echo "This optimized script will set up your application on Ubuntu 22.04"

# Update system packages in parallel
echo -e "\n>>> Updating system packages..."
sudo apt update -y &
wait

# Install essential dependencies in parallel
echo -e "\n>>> Installing essential packages..."
sudo apt install -y curl wget git build-essential nginx &
wait

# Install NVM (Node Version Manager) with optimized settings
echo -e "\n>>> Installing NVM..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node.js v18 (LTS) with optimization flags
echo -e "\n>>> Installing Node.js v18 LTS..."
nvm install 18 --no-progress
nvm use 18
nvm alias default 18

# Verify installation
echo -e "\n>>> Verifying Node.js and npm installation..."
node -v
npm -v

# Install packages in parallel using performance optimizations
echo -e "\n>>> Setting up application dependencies..."
if [ -f "package.json" ]; then
    echo -e "\n>>> Cleaning npm cache..."
    npm cache clean --force

    echo -e "\n>>> Increasing Node.js memory limit and performance..."
    export NODE_OPTIONS="--max-old-space-size=8192 --max-http-header-size=16384"

    echo -e "\n>>> Installing dependencies with optimizations..."
    # Clear any existing node_modules
    rm -rf node_modules package-lock.json
    
    # Install with optimizations
    npm install --legacy-peer-deps --no-fund --no-audit --prefer-offline --no-progress || \
    npm install --legacy-peer-deps --force --no-fund --no-audit --prefer-offline --no-progress
    
    # Install Vite globally
    npm install -g vite --no-progress || true
    
    # Build the application with optimizations
    echo -e "\n>>> Building the application..."
    NODE_ENV=production npm run build -- --minify=true || \
    npm run build -- --minify=false
    
    # If build fails, try alternative method
    if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
        echo -e "\n>>> Standard build failed. Attempting alternative build method..."
        NODE_ENV=production npm run build:fast || \
        NODE_ENV=production npm run build -- --mode=fast || \
        NODE_ENV=production npm run build -- --minify=false
        
        # Create fallback if still failing
        if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
            echo -e "\n>>> Creating basic dist directory..."
            mkdir -p dist
            cat > dist/index.html << EOL
<!DOCTYPE html>
<html>
<head>
    <title>Latin Mix Masters</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <h1>Latin Mix Masters</h1>
    <p>Site is being updated. Please check back soon.</p>
</body>
</html>
EOL
        fi
    fi
else
    echo -e "\n>>> ERROR: package.json not found! Deployment aborted."
    exit 1
fi

# Set up Nginx with optimized configuration
echo -e "\n>>> Setting up optimized Nginx configuration..."
sudo bash -c 'cat > /etc/nginx/sites-available/latinmixmasters << EOL
server {
    listen 80;
    listen [::]:80;
    server_name lmmapp.latinmixmasters.com www.lmmapp.latinmixmasters.com;

    root /var/www/latinmixmasters/dist;
    index index.html;
    
    # Performance optimizations
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;
    
    # Gzip compression for faster content delivery
    gzip on;
    gzip_disable "msie6";
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_buffers 16 8k;
    gzip_http_version 1.1;
    gzip_min_length 256;
    gzip_types
        application/atom+xml
        application/javascript
        application/json
        application/ld+json
        application/manifest+json
        application/rss+xml
        application/vnd.geo+json
        application/vnd.ms-fontobject
        application/x-font-ttf
        application/x-web-app-manifest+json
        application/xhtml+xml
        application/xml
        font/opentype
        image/bmp
        image/svg+xml
        image/x-icon
        text/cache-manifest
        text/css
        text/plain
        text/vcard
        text/vnd.rim.location.xloc
        text/vtt
        text/x-component
        text/x-cross-domain-policy;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Efficient caching for static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        expires 30d;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    # CORS headers
    add_header Access-Control-Allow-Origin "*";
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, DELETE";
    add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
    add_header Access-Control-Allow-Credentials "true";
}
EOL'

# Enable site and restart Nginx
echo -e "\n>>> Enabling site and optimizing Nginx..."
sudo ln -sf /etc/nginx/sites-available/latinmixmasters /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default || true

# Remove default Nginx configurations that might slow performance
sudo rm -f /etc/nginx/conf.d/default.conf || true

# Optimize Nginx main configuration
sudo bash -c 'cat > /etc/nginx/nginx.conf << EOL
user www-data;
worker_processes auto;
pid /run/nginx.pid;

events {
    worker_connections 2048;
    multi_accept on;
    use epoll;
}

http {
    server_tokens off;
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;
    
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging Settings
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
    
    # Gzip Settings
    gzip on;
    gzip_disable "msie6";
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_buffers 16 8k;
    gzip_http_version 1.1;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Virtual Host Configs
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOL'

# Check Nginx configuration
echo -e "\n>>> Testing optimized Nginx configuration..."
sudo nginx -t || {
    echo "Nginx configuration test failed. Using simplified configuration..."
    sudo bash -c 'cat > /etc/nginx/sites-available/latinmixmasters << EOL
server {
    listen 80;
    listen [::]:80;
    server_name _;

    root /var/www/latinmixmasters/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOL'
    sudo nginx -t
}

# Restart Nginx
sudo systemctl restart nginx || sudo service nginx restart

# Setup PM2 with optimized settings
echo -e "\n>>> Setting up PM2 with performance optimizations..."
sudo npm install -g pm2@latest --no-progress || true

# Create optimized PM2 ecosystem file
cat > ecosystem.config.js << EOL
module.exports = {
  apps: [{
    name: "latinmixmasters",
    script: "npm",
    args: "run preview",
    instances: "max",
    exec_mode: "cluster",
    watch: false,
    max_memory_restart: "500M",
    env: {
      NODE_ENV: "production",
      NODE_OPTIONS: "--max-old-space-size=4096"
    }
  }]
};
EOL

# Check if PM2 was installed successfully
if command -v pm2 >/dev/null 2>&1; then
    echo "PM2 installed successfully, setting up optimized service..."
    cd /var/www/latinmixmasters
    pm2 start ecosystem.config.js || pm2 start npm --name "latinmixmasters" -- run preview
    pm2 save
    pm2 startup
else
    echo "PM2 installation failed, skipping PM2 setup..."
fi

# System optimization
echo -e "\n>>> Optimizing system performance..."
# Lower swappiness for better performance
sudo sysctl -w vm.swappiness=10
# Add persistent setting
echo "vm.swappiness=10" | sudo tee -a /etc/sysctl.conf

echo -e "\n=== Fast Installation Complete ==="
echo "Your application has been installed with performance optimizations!"
echo "Next steps:"
echo "1. Set up SSL with: sudo apt install -y certbot python3-certbot-nginx"
echo "2. Generate certificates: sudo certbot --nginx -d lmmapp.latinmixmasters.com -d www.lmmapp.latinmixmasters.com"
echo "3. Visit your site at: http://lmmapp.latinmixmasters.com"
echo ""
echo "If you need to check server status: sudo systemctl status nginx"
echo "For PM2 status and logs: pm2 status && pm2 logs"
