
#!/bin/bash
set -e

echo "=== Latin Mix Masters VPS Sync Optimization ==="
echo "This script optimizes the application for better multi-device synchronization"

# Create logs directory if it doesn't exist
mkdir -p logs

# Check if running as root
if [ "$(id -u)" = "0" ]; then
  echo "Running as root, proceeding with system optimizations..."
  
  # Optimize TCP settings for better real-time sync
  echo "Optimizing network settings for better synchronization..."
  
  # Decrease TCP connection timeout for faster recovery
  sysctl -w net.ipv4.tcp_keepalive_time=60
  sysctl -w net.ipv4.tcp_keepalive_intvl=10
  sysctl -w net.ipv4.tcp_keepalive_probes=6
  
  # Optimize TCP for low latency applications
  sysctl -w net.ipv4.tcp_low_latency=1
  
  # Make changes permanent
  cat > /etc/sysctl.d/99-latinmixmasters-sync.conf << EOF
# Latin Mix Masters sync optimization
net.ipv4.tcp_keepalive_time = 60
net.ipv4.tcp_keepalive_intvl = 10
net.ipv4.tcp_keepalive_probes = 6
net.ipv4.tcp_low_latency = 1
EOF
  
  echo "System-level optimizations applied successfully!"
else
  echo "Running as regular user, skipping system-level optimizations."
  echo "To apply network optimizations, please run this script as root."
fi

# Application-level optimizations
echo "Applying application-level optimizations..."

# Check if PM2 is installed
if command -v pm2 &> /dev/null; then
  # Update PM2 configuration for better performance
  echo "Optimizing PM2 configuration..."
  
  # Create optimized ecosystem file if it doesn't exist
  if [ ! -f ecosystem.config.js ]; then
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
    
    echo "Created optimized ecosystem.config.js file"
  fi
  
  # Restart with new configuration
  pm2 restart ecosystem.config.js
  echo "Application restarted with optimized settings"
  
  # Save PM2 configuration
  pm2 save
else
  echo "PM2 not found. Please install PM2 for better process management."
fi

echo "=== Optimization Complete ==="
echo "Your application has been optimized for better synchronization across devices"
echo "To view application status, run: pm2 status"
echo "To view application logs, run: pm2 logs latinmixmasters"
