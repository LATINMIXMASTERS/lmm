
#!/bin/bash
set -e

echo "=== Latin Mix Masters VPS Update Script ==="
echo "This script updates the application with minimal downtime"

# Check if running as root and preserve environment if needed
if [ "$(id -u)" = "0" ]; then
  echo "Running as root user. Ensuring proper permissions..."
  # Get the actual directory owner
  OWNER=$(stat -c '%U' "$(pwd)")
  echo "Directory owner: $OWNER"
fi

# Create logs directory if it doesn't exist
mkdir -p logs
chmod 755 logs

# Pull latest changes
echo "Fetching latest changes..."
git fetch --depth=1 origin main || {
  echo "ERROR: Failed to fetch from git repository."
  echo "Check your internet connection and git permissions."
  exit 1
}

# Store current HEAD for comparison
CURRENT_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse origin/main)

if [ "$CURRENT_COMMIT" = "$REMOTE_COMMIT" ]; then
  echo "Already up to date. No changes to apply."
  exit 0
fi

# Apply changes with proper error handling
echo "Applying updates..."
git reset --hard origin/main || {
  echo "ERROR: Failed to reset to origin/main."
  echo "Check your git permissions and working directory state."
  exit 1
}

# Update dependencies if package.json changed
if git diff --name-only $CURRENT_COMMIT $REMOTE_COMMIT | grep -q "package.json"; then
  echo "Package changes detected, updating dependencies..."
  npm install --no-audit --no-fund --silent > logs/npm-update.log 2>&1 || {
    echo "ERROR: npm install failed. Check logs/npm-update.log for details."
    echo "You may need more memory or fix package.json conflicts."
    exit 1
  }
fi

# Increase memory limit for Node.js to avoid build failures
export NODE_OPTIONS="--max-old-space-size=4096"

# Rebuild application
echo "Rebuilding application..."
npm run build > logs/build.log 2>&1 || {
  echo "ERROR: Build failed. Check logs/build.log for details."
  cat logs/build.log | tail -n 20
  echo "See complete logs in logs/build.log"
  exit 1
}

# Set proper permissions for built files
if [ "$(id -u)" = "0" ]; then
  echo "Setting correct permissions for web server..."
  # Set appropriate ownership for web server
  find dist -type d -exec chmod 755 {} \;
  find dist -type f -exec chmod 644 {} \;
  if getent passwd www-data >/dev/null; then
    chown -R www-data:www-data dist
    echo "Permissions set for www-data user"
  elif getent passwd nginx >/dev/null; then
    chown -R nginx:nginx dist
    echo "Permissions set for nginx user"
  fi
fi

# Restart application with PM2
echo "Restarting application..."
if command -v pm2 >/dev/null 2>&1; then
  pm2 restart latinmixmasters || {
    echo "PM2 restart failed, trying to start..."
    pm2 start npm --name "latinmixmasters" -- start
  }
else
  echo "PM2 not found. If you're using systemd, restart with:"
  echo "sudo systemctl restart latinmixmasters"
fi

echo "=== Update Complete ==="
echo "Application restarted with latest changes"
echo "To view application logs run 'pm2 logs latinmixmasters' or check logs directory"
