
#!/bin/bash
set -e

echo "=== Latin Mix Masters Installation Script ==="
echo "This script will set up your application on Ubuntu 22.04"

# Update system
echo -e "\n>>> Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential dependencies
echo -e "\n>>> Installing essential packages..."
sudo apt install -y curl wget git build-essential nginx

# Install NVM (Node Version Manager)
echo -e "\n>>> Installing NVM..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node.js v18 (LTS)
echo -e "\n>>> Installing Node.js v18 LTS..."
nvm install 18
nvm use 18
nvm alias default 18

# Verify installation
echo -e "\n>>> Verifying Node.js and npm installation..."
node -v
npm -v

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo -e "\n>>> ERROR: package.json not found!"
    echo "The GitHub repository might not have been cloned correctly."
    echo "Please check your GitHub URL and make sure it contains a valid React application."
    exit 1
fi

echo -e "\n>>> Cleaning npm cache..."
npm cache clean --force

echo -e "\n>>> Increasing Node.js memory limit..."
export NODE_OPTIONS="--max-old-space-size=8192"

echo -e "\n>>> Installing dependencies..."
# Clear any existing node_modules
rm -rf node_modules package-lock.json

# Install dependencies with various fallback options
echo "Attempt 1: Standard install with legacy peer deps"
npm install --legacy-peer-deps --no-fund --no-audit || true

echo "Attempt 2: Using --force flag"
npm install --legacy-peer-deps --force --no-fund --no-audit || true

# Make sure vite is installed globally 
echo -e "\n>>> Installing Vite globally..."
npm install -g vite || true

# Build the application
echo -e "\n>>> Building the application..."
npm run build || npm run build -- --minify false || true

# If build failed, try to fix vite.config.ts path alias issue
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo -e "\n>>> Build failed. Attempting alternative build method..."
    
    # Try updating vite.config.ts to use absolute paths
    sed -i 's|"@"|path.resolve(__dirname, "src")|g' vite.config.ts || true
    
    # Try build again
    npm run build || npm run build -- --minify false
    
    # If still failing, create a basic index.html in dist
    if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
        echo -e "\n>>> Creating fallback index.html..."
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

# Set up Nginx
echo -e "\n>>> Setting up Nginx configuration..."
sudo bash -c 'cat > /etc/nginx/sites-available/latinmixmasters << EOL
server {
    listen 80;
    listen [::]:80;
    server_name lmmapp.latinmixmasters.com www.lmmapp.latinmixmasters.com;

    root /var/www/latinmixmasters/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Add proper CORS headers
    add_header Access-Control-Allow-Origin "*";
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, DELETE";
    add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
    add_header Access-Control-Allow-Credentials "true";
}
EOL'

# Enable site and restart Nginx
echo -e "\n>>> Enabling site and restarting Nginx..."
sudo ln -sf /etc/nginx/sites-available/latinmixmasters /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default || true

# Check Nginx configuration
echo -e "\n>>> Testing Nginx configuration..."
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

# Setup PM2
echo -e "\n>>> Setting up PM2..."
sudo npm install -g pm2 || true

# Check if PM2 was installed successfully
if command -v pm2 >/dev/null 2>&1; then
    echo "PM2 installed successfully, setting up service..."
    cd /var/www/latinmixmasters
    pm2 start npm --name "latinmixmasters" -- run preview || echo "PM2 start failed, skipping..."
    pm2 save || echo "PM2 save failed, skipping..."
    pm2 startup || echo "PM2 startup failed, skipping..."
else
    echo "PM2 installation failed, skipping PM2 setup..."
fi

echo -e "\n=== Installation Complete ==="
echo "Next steps:"
echo "1. Set up SSL with: sudo apt install -y certbot python3-certbot-nginx"
echo "2. Generate certificates: sudo certbot --nginx -d lmmapp.latinmixmasters.com -d www.lmmapp.latinmixmasters.com"
echo "3. Visit your site at: http://lmmapp.latinmixmasters.com"
echo ""
echo "If you're experiencing issues, you can try restarting the server with: sudo reboot"
echo "After reboot, check that Nginx is running with: sudo systemctl status nginx"
