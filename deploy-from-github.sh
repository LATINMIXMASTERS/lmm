
#!/bin/bash
set -e

echo "=== Latin Mix Masters Fast GitHub Deployment Script ==="
echo "This optimized script will quickly deploy your application from GitHub to your server"

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Please provide the server address and GitHub repository URL."
    echo "Usage: $0 username@server-ip github-repo-url"
    echo "Example: $0 root@123.456.789.10 https://github.com/yourusername/latinmixmasters.git"
    exit 1
fi

SERVER="$1"
GITHUB_REPO="$2"

# Optimize SSH for faster connections
SSH_OPTS="-o StrictHostKeyChecking=accept-new -o ServerAliveInterval=30 -o ControlMaster=auto -o ControlPath=~/.ssh/controlmasters/%r@%h:%p -o ControlPersist=10m -o Compression=yes"

echo -e "\n>>> Creating SSH control directory..."
mkdir -p ~/.ssh/controlmasters

echo -e "\n>>> Creating remote directory with optimized commands..."
ssh $SSH_OPTS $SERVER "sudo mkdir -p /var/www/latinmixmasters && sudo chown -R \$USER:\$USER /var/www/latinmixmasters"

echo -e "\n>>> Optimized cloning from GitHub repository..."
ssh $SSH_OPTS $SERVER "cd /var/www/latinmixmasters && \
  (git clone --depth=1 --single-branch $GITHUB_REPO . || \
  (git fetch --depth=1 && git reset --hard origin/main))"

echo -e "\n>>> Making scripts executable..."
ssh $SSH_OPTS $SERVER "cd /var/www/latinmixmasters && chmod +x install.sh"

echo -e "\n>>> Fast Deployment complete!"
echo "Now connect to your server and run the optimized install script:"
echo "ssh $SERVER"
echo "cd /var/www/latinmixmasters"
echo "./install.sh"
