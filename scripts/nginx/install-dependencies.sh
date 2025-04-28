
#!/bin/bash
set -e

# Install required dependencies
install_dependencies() {
  echo "Checking for required dependencies..."
  
  # Install nginx if not already installed
  if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    apt-get update
    apt-get install -y nginx
  fi
  
  # Install net-tools for network diagnostics
  if ! command -v netstat &> /dev/null; then
    echo "Installing net-tools for diagnostics..."
    apt-get update
    apt-get install -y net-tools
  fi
  
  # Install additional utilities
  echo "Installing utilities for SSL and networking diagnostics..."
  apt-get update
  apt-get install -y curl dnsutils net-tools lsof netcat
  
  echo "All dependencies installed."
}

# Export the function
install_dependencies
