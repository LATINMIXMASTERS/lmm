
#!/bin/bash
set -e

echo "=== Latin Mix Masters Ubuntu 22.04 Installation Script ==="
echo "This script will setup Latin Mix Masters on your Ubuntu 22.04 server"

# Check if running as root
if [ "$(id -u)" != "0" ]; then
  echo "This script must be run as root. Please use sudo."
  exit 1
fi

# Make all script files executable
find ./scripts -type f -name "*.sh" -exec chmod +x {} \;

# Create application directory and set up base structure
./scripts/setup-directories.sh

# Navigate to application directory
APP_DIR="/var/www/latinmixmasters"
cd $APP_DIR
echo "Changed to directory: $(pwd)"

# Check for source files and offer to clone from git
./scripts/check-source.sh

# Install Node.js and PM2
./scripts/setup-nodejs.sh

# Install dependencies and build the application
./scripts/setup-application.sh

# Configure and set up Nginx
./scripts/setup-nginx.sh

# Set up PM2 for production
./scripts/setup-pm2.sh

# Show installation summary
./scripts/show-summary.sh
