
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
export NODE_OPTIONS="--max-old-space-size=4096"

echo -e "\n>>> Installing dependencies..."
# Clear any existing node_modules
rm -rf node_modules package-lock.json

# Install dependencies with various fallback options
echo "Attempt 1: Standard install with legacy peer deps"
npm install --legacy-peer-deps --no-fund --no-audit || true

echo "Attempt 2: Using --force flag"
npm install --legacy-peer-deps --force --no-fund --no-audit || true

# Build the application
echo -e "\n>>> Building the application..."
npm run build

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
}
EOL'

# Enable site and restart Nginx
echo -e "\n>>> Enabling site and restarting Nginx..."
sudo ln -s /etc/nginx/sites-available/latinmixmasters /etc/nginx/sites-enabled/ || true
sudo rm /etc/nginx/sites-enabled/default || true
sudo nginx -t
sudo systemctl restart nginx

# Setup PM2
echo -e "\n>>> Setting up PM2..."
sudo npm install -g pm2
cd /var/www/latinmixmasters
pm2 start npm --name "latinmixmasters" -- run preview
pm2 save
pm2 startup

echo -e "\n=== Installation Complete ==="
echo "Next steps:"
echo "1. Set up SSL with: sudo apt install -y certbot python3-certbot-nginx"
echo "2. Generate certificates: sudo certbot --nginx -d lmmapp.latinmixmasters.com -d www.lmmapp.latinmixmasters.com"
echo "3. Visit your site at: http://lmmapp.latinmixmasters.com"

