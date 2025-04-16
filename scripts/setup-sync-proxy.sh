
#!/bin/bash
set -e

echo "Setting up sync proxy service..."

# Create the sync proxy script
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
    echo "Sync proxy started with PM2"
  else
    # Start in background with nohup
    nohup node sync-proxy.js > logs/sync-proxy.log 2>&1 &
    echo "Started sync proxy in background. Check logs/sync-proxy.log for details."
  fi
else
  echo "Node.js not found. Unable to start sync proxy."
fi
