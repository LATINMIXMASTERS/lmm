
#!/bin/bash
set -e

echo "=== Latin Mix Masters VPS Fast Deployment ==="
echo "This script provides optimized deployment for low-resource VPS servers"

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Please provide the server address and GitHub repository URL."
    echo "Usage: $0 username@server-ip github-repo-url"
    exit 1
fi

SERVER="$1"
GITHUB_REPO="$2"

# Use optimized SSH settings for fast connections
SSH_OPTS="-o ServerAliveInterval=30 -o Compression=yes -o ConnectTimeout=10"

echo -e "\n>>> Setting up deployment on VPS..."
ssh $SSH_OPTS $SERVER "mkdir -p /var/www/latinmixmasters && sudo chown -R \$USER:\$USER /var/www/latinmixmasters"

echo -e "\n>>> Optimized shallow clone from GitHub repository..."
ssh $SSH_OPTS $SERVER "cd /var/www/latinmixmasters && \
  (git clone --depth=1 --single-branch --branch main $GITHUB_REPO . || \
   (git fetch --depth=1 && git reset --hard origin/main))"

echo -e "\n>>> Setting up deployment scripts..."
ssh $SSH_OPTS $SERVER "cd /var/www/latinmixmasters && chmod +x install.sh update.sh"

echo -e "\n>>> Fast Deployment complete!"
echo "Now connect to your VPS and run the installation:"
echo "ssh $SERVER"
echo "cd /var/www/latinmixmasters"
echo "./install.sh"
