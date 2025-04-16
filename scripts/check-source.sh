
#!/bin/bash
set -e

echo "=== Checking source files ==="

APP_DIR="/var/www/latinmixmasters"
cd $APP_DIR

# Check if package.json exists
if [ ! -f "package.json" ]; then
  echo "package.json not found. This could mean:"
  echo "1. You haven't uploaded the application files yet"
  echo "2. You're in the wrong directory"
  echo "3. The repository wasn't properly cloned"
  
  read -p "Would you like to download the application from a Git repository? (y/n): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter the Git repository URL: " repo_url
    echo "Cloning from $repo_url..."
    git clone $repo_url .
    
    if [ ! -f "package.json" ]; then
      echo "ERROR: package.json still not found after cloning. Please check the repository."
      exit 1
    fi
  else
    echo "Please upload your application files to $APP_DIR and ensure package.json exists."
    echo "You can transfer files using the upload-to-server.sh script included with Latin Mix Masters."
    echo ""
    echo "Example command (run from your local machine):"
    echo "./upload-to-server.sh user@your-server-ip $APP_DIR"
    exit 1
  fi
fi

echo "Source files verified"
