
#!/bin/bash
set -e

echo "Applying PM2 configuration optimizations..."

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
  echo "PM2 not found. Please install PM2 for better process management."
  exit 1
fi

# Create optimized ecosystem file if it doesn't exist
if [ ! -f ecosystem.config.js ]; then
  echo "Creating optimized ecosystem.config.js file"
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
      REACT_APP_FORCE_SYNC: "true",
      REACT_APP_METADATA_UPDATE: "1500"
    }
  }]
};
EOF
fi

# Restart with new configuration
pm2 restart ecosystem.config.js
echo "Application restarted with optimized PM2 settings"

# Save PM2 configuration
pm2 save
