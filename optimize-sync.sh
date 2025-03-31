
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
  
  # Improve TCP fastopen for quick reconnection
  sysctl -w net.ipv4.tcp_fastopen=3
  
  # Increase TCP buffer sizes for better throughput
  sysctl -w net.core.rmem_max=16777216
  sysctl -w net.core.wmem_max=16777216
  
  # Optimize for web socket connections
  sysctl -w net.ipv4.tcp_max_syn_backlog=4096
  sysctl -w net.core.somaxconn=4096
  
  # Make changes permanent
  cat > /etc/sysctl.d/99-latinmixmasters-sync.conf << EOF
# Latin Mix Masters sync optimization
net.ipv4.tcp_keepalive_time = 60
net.ipv4.tcp_keepalive_intvl = 10
net.ipv4.tcp_keepalive_probes = 6
net.ipv4.tcp_low_latency = 1
net.ipv4.tcp_fastopen = 3
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_max_syn_backlog = 4096
net.core.somaxconn = 4096
EOF
  
  echo "System-level optimizations applied successfully!"
  
  # Set up a Redis server for better caching (optional)
  if ! command -v redis-server &> /dev/null; then
    echo "Installing Redis for improved caching..."
    apt-get update && apt-get install -y redis-server
    
    # Configure Redis for better performance
    cp /etc/redis/redis.conf /etc/redis/redis.conf.bak
    cat > /etc/redis/redis.conf << EOF
bind 127.0.0.1
port 6379
maxmemory 128mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec
EOF
    
    # Enable and restart Redis
    systemctl enable redis-server
    systemctl restart redis-server
    
    echo "Redis installed and configured for caching."
  fi
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
      REACT_APP_FORCE_SYNC: "true",
      REACT_APP_METADATA_UPDATE: "1500"
    }
  }]
};
EOF
    
    echo "Created optimized ecosystem.config.js file"
  fi
  
  # Create a sync cache directory if it doesn't exist
  mkdir -p .sync-cache
  
  # Create a script to clear old sync files periodically
  cat > sync-maintenance.sh << EOF
#!/bin/bash
# Remove sync files older than 1 hour
find .sync-cache -type f -mmin +60 -delete
echo "Cleaned up old sync files at \$(date)"
EOF
  
  chmod +x sync-maintenance.sh
  
  # Add a cron job to run maintenance
  (crontab -l 2>/dev/null || true; echo "0 * * * * \$(pwd)/sync-maintenance.sh >> \$(pwd)/logs/sync-maintenance.log 2>&1") | crontab -
  
  # Restart with new configuration
  pm2 restart ecosystem.config.js
  echo "Application restarted with optimized settings"
  
  # Save PM2 configuration
  pm2 save
else
  echo "PM2 not found. Please install PM2 for better process management."
fi

# Create a caching layer for client requests
cat > sync-proxy.js << EOF
const express = require('express');
const app = express();
const port = 3500;
const fs = require('fs');
const path = require('path');
const cacheDir = path.join(__dirname, '.sync-cache');

// Create cache directory if it doesn't exist
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

// Middleware to handle sync requests
app.use('/api/sync', express.json(), (req, res) => {
  const timestamp = Date.now();
  const deviceId = req.query.deviceId || 'unknown';
  const filePath = path.join(cacheDir, \`sync_\${deviceId}_\${timestamp}.json\`);
  
  fs.writeFileSync(filePath, JSON.stringify(req.body));
  
  // Get and return all recent syncs
  const syncFiles = fs.readdirSync(cacheDir)
    .filter(file => file.startsWith('sync_') && !file.includes(deviceId))
    .map(file => {
      try {
        const content = JSON.parse(fs.readFileSync(path.join(cacheDir, file), 'utf8'));
        return content;
      } catch (err) {
        return null;
      }
    })
    .filter(Boolean);
  
  res.json({
    success: true,
    sync: syncFiles.slice(-5) // Return the 5 most recent syncs
  });
});

app.listen(port, '127.0.0.1', () => {
  console.log(\`Sync proxy listening at http://localhost:\${port}\`);
});
EOF

# Check if Node.js is installed before trying to run the proxy
if command -v node &> /dev/null; then
  # Install required packages
  if [ ! -f node_modules/express/package.json ]; then
    echo "Installing Express for sync proxy..."
    npm install --no-save express
  fi
  
  # Start proxy with PM2 if available
  if command -v pm2 &> /dev/null; then
    pm2 start sync-proxy.js --name "sync-proxy"
    pm2 save
  else
    # Start in background with nohup
    nohup node sync-proxy.js > logs/sync-proxy.log 2>&1 &
    echo "Started sync proxy in background. Check logs/sync-proxy.log for details."
  fi
fi

echo "=== Optimization Complete ==="
echo "Your application has been optimized for better synchronization across devices"
echo "To view application status, run: pm2 status"
echo "To view application logs, run: pm2 logs latinmixmasters"
