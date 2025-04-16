
#!/bin/bash
set -e

echo "=== Setting up PM2 for Latin Mix Masters ==="

APP_DIR="/var/www/latinmixmasters"
cd $APP_DIR

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

echo "PM2 setup complete"
