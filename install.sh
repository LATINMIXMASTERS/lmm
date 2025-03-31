
#!/bin/bash
set -e

echo "=== Latin Mix Masters VPS Installation ==="
echo "Optimized for low-resource VPS environments with improved synchronization"

# Check if running as root and warn if necessary
if [ "$(id -u)" = "0" ]; then
  echo "WARNING: Running as root is not recommended. Consider running as a regular user."
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Create logs directory
mkdir -p logs

# Check for Node.js installation
if ! command -v node &> /dev/null; then
  echo "Installing Node.js..."
  curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# Check for required modules
if ! command -v pm2 &> /dev/null; then
  echo "Installing PM2 for process management..."
  sudo npm install -g pm2
fi

# Optimize npm for faster installation
echo "Configuring npm for faster installation..."
npm config set fund false
npm config set audit false
npm config set progress false

# Install dependencies with reduced output
echo "Installing dependencies (this may take a few minutes)..."
npm install --no-audit --no-fund --silent > logs/npm-install.log 2>&1 || {
  echo "ERROR: npm install failed. Check logs/npm-install.log for details."
  exit 1
}

# Build the application with optimizations
echo "Building the application..."
npm run build > logs/build.log 2>&1 || {
  echo "ERROR: Build failed. Check logs/build.log for details."
  exit 1
}

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

# Make optimize-sync script executable
chmod +x optimize-sync.sh

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
echo "Configuring PM2 to start on system boot..."
pm2 startup | tail -n 1 > logs/pm2-startup.log
echo "Run the command from logs/pm2-startup.log if you want PM2 to start on boot"

# Apply sync optimizations
echo "Applying synchronization optimizations..."
./optimize-sync.sh

echo "=== Installation Complete ==="
echo "Your application is now running with PM2 and optimized for synchronization"
echo "Access your application at http://YOUR_SERVER_IP"
echo ""
echo "Useful commands:"
echo "  pm2 status                  - Check application status"
echo "  pm2 logs latinmixmasters    - View application logs"
echo "  pm2 restart latinmixmasters - Restart the application"
echo "  ./update.sh                 - Update the application"
echo "  ./optimize-sync.sh          - Re-apply synchronization optimizations"
