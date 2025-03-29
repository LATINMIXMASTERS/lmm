
#!/bin/bash
set -e

echo "=== Latin Mix Masters VPS Update Script ==="
echo "This script updates the application with minimal downtime"

# Create logs directory if it doesn't exist
mkdir -p logs

# Pull latest changes
echo "Fetching latest changes..."
git fetch --depth=1 origin main

# Store current HEAD for comparison
CURRENT_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse origin/main)

if [ "$CURRENT_COMMIT" = "$REMOTE_COMMIT" ]; then
  echo "Already up to date. No changes to apply."
  exit 0
fi

# Apply changes
echo "Applying updates..."
git reset --hard origin/main

# Update dependencies if package.json changed
if git diff --name-only $CURRENT_COMMIT $REMOTE_COMMIT | grep -q "package.json"; then
  echo "Package changes detected, updating dependencies..."
  npm install --no-audit --no-fund --silent > logs/npm-update.log 2>&1 || {
    echo "ERROR: npm install failed. Check logs/npm-update.log for details."
    exit 1
  }
fi

# Rebuild application
echo "Rebuilding application..."
npm run build > logs/build.log 2>&1 || {
  echo "ERROR: Build failed. Check logs/build.log for details."
  exit 1
}

# Restart application with PM2
echo "Restarting application..."
pm2 restart latinmixmasters || {
  echo "PM2 restart failed, trying to start..."
  pm2 start npm --name "latinmixmasters" -- start
}

echo "=== Update Complete ==="
echo "Application restarted with latest changes"
echo "Run 'pm2 logs latinmixmasters' to view application logs"
