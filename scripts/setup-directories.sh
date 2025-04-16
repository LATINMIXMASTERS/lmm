
#!/bin/bash
set -e

echo "=== Setting up application directories ==="

# Create application directory
APP_DIR="/var/www/latinmixmasters"
echo "Creating application directory at $APP_DIR..."
mkdir -p $APP_DIR
chown -R $USER:$USER $APP_DIR

# Create logs directory
mkdir -p $APP_DIR/logs

echo "Directory setup complete"
