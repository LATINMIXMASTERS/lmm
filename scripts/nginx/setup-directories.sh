
#!/bin/bash
set -e

# Setup necessary directories
setup_directories() {
  local APP_DIR=$1
  
  echo "Creating required directories..."
  mkdir -p /etc/letsencrypt/live
  mkdir -p /etc/letsencrypt/archive
  mkdir -p "$APP_DIR"
}

# Export the function
setup_directories "$1"
