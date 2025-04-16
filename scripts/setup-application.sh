
#!/bin/bash
set -e

echo "=== Setting up Latin Mix Masters application ==="

APP_DIR="/var/www/latinmixmasters"
cd $APP_DIR
echo "Changed to directory: $(pwd)"

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

echo "Application setup complete"
