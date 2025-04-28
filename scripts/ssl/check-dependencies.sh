
#!/bin/bash
set -e

# Check and install required dependencies
check_and_install_dependencies() {
  echo "Checking required dependencies..."

  # Install certbot if not already installed
  if ! command -v certbot &> /dev/null; then
    echo "Installing Certbot..."
    apt-get update
    apt-get install -y certbot
  fi

  # Install required utilities if not present
  for pkg in curl net-tools lsof netcat openssl dig host; do
    if ! command -v $pkg &> /dev/null; then
      echo "Installing $pkg..."
      apt-get install -y $pkg
    fi
  done

  echo "All dependencies installed."
}

# Export the function
check_and_install_dependencies
