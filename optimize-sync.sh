
#!/bin/bash
set -e

echo "=== Latin Mix Masters VPS Sync Optimization ==="
echo "This script optimizes the application for better multi-device synchronization"

# Create logs directory if it doesn't exist
mkdir -p logs

# Run each optimization component
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# System-level optimizations if running as root
if [ "$(id -u)" = "0" ]; then
  echo "Running as root, proceeding with system optimizations..."
  $SCRIPT_DIR/scripts/optimize-network.sh
  $SCRIPT_DIR/scripts/setup-redis.sh
else
  echo "Running as regular user, skipping system-level optimizations."
  echo "To apply network optimizations, please run this script as root."
fi

# Application-level optimizations (can run as non-root)
$SCRIPT_DIR/scripts/optimize-pm2.sh
$SCRIPT_DIR/scripts/setup-sync-cache.sh
$SCRIPT_DIR/scripts/setup-sync-proxy.sh

echo "=== Optimization Complete ==="
echo "Your application has been optimized for better synchronization across devices"
echo "To view application status, run: pm2 status"
echo "To view application logs, run: pm2 logs latinmixmasters"
