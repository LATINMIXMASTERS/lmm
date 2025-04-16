
#!/bin/bash
set -e

echo "=== Setting up Node.js environment ==="

# Install Node.js if not already installed
if ! command -v node &> /dev/null; then
  echo "Installing Node.js 18.x..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
  apt-get install -y nodejs
  echo "Node.js installed: $(node -v)"
else
  echo "Node.js already installed: $(node -v)"
fi

# Install PM2 if not already installed
if ! command -v pm2 &> /dev/null; then
  echo "Installing PM2..."
  npm install -g pm2
  echo "PM2 installed: $(pm2 -v)"
else
  echo "PM2 already installed: $(pm2 -v)"
fi

# Optimize npm for faster installation
echo "Configuring npm for faster installation..."
npm config set fund false
npm config set audit false
npm config set progress false

echo "Node.js environment setup complete"
