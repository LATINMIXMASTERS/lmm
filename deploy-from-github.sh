
#!/bin/bash
set -e

echo "=== Latin Mix Masters GitHub Deployment Script ==="
echo "This script will deploy your application from GitHub to your server"

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Please provide the server address and GitHub repository URL."
    echo "Usage: $0 username@server-ip github-repo-url"
    echo "Example: $0 root@123.456.789.10 https://github.com/yourusername/latinmixmasters.git"
    exit 1
fi

SERVER="$1"
GITHUB_REPO="$2"

echo -e "\n>>> Creating remote directory..."
ssh $SERVER "sudo mkdir -p /var/www/latinmixmasters && sudo chown -R \$USER:\$USER /var/www/latinmixmasters"

echo -e "\n>>> Setting up remote repository..."
ssh $SERVER "cd /var/www/latinmixmasters && git clone $GITHUB_REPO . || (git fetch --all && git reset --hard origin/main)"

echo -e "\n>>> Making install script executable..."
ssh $SERVER "cd /var/www/latinmixmasters && chmod +x install.sh"

echo -e "\n>>> Deployment complete!"
echo "Now connect to your server and run the install script:"
echo "ssh $SERVER"
echo "cd /var/www/latinmixmasters"
echo "./install.sh"
