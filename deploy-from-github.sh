
#!/bin/bash
set -e

echo "=== Latin Mix Masters GitHub Deployment for Ubuntu 22.04 ==="
echo "This script deploys Latin Mix Masters directly from a GitHub repository"

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Please provide the server address and GitHub repository URL."
    echo "Usage: $0 username@server-ip github-repo-url"
    echo "Example: $0 root@192.168.1.100 https://github.com/yourusername/latinmixmasters.git"
    exit 1
fi

SERVER="$1"
GITHUB_REPO="$2"

# Use optimized SSH settings for fast connections
SSH_OPTS="-o ServerAliveInterval=30 -o Compression=yes -o ConnectTimeout=10"

echo -e "\n>>> Testing SSH connection..."
ssh $SSH_OPTS $SERVER "echo Connection successful" || {
    echo "Failed to connect to $SERVER via SSH."
    echo "Please ensure:"
    echo "1. SSH server is running on the server"
    echo "2. You have the correct credentials/SSH keys setup"
    echo "3. Any firewalls allow SSH connections"
    exit 1
}

echo -e "\n>>> Setting up deployment directory on Ubuntu server..."
ssh $SSH_OPTS $SERVER "sudo mkdir -p /var/www/latinmixmasters && sudo chown -R \$USER:\$USER /var/www/latinmixmasters"

echo -e "\n>>> Cloning from GitHub repository..."
ssh $SSH_OPTS $SERVER "cd /var/www/latinmixmasters && \
  (git clone --depth=1 $GITHUB_REPO . || \
   (git fetch --depth=1 && git reset --hard origin/main))"

echo -e "\n>>> Setting up installation scripts..."
ssh $SSH_OPTS $SERVER "cd /var/www/latinmixmasters && chmod +x install-ubuntu.sh update.sh optimize-sync.sh diagnose-server.sh"

echo -e "\n>>> GitHub Deployment complete!"
echo "Now connect to your Ubuntu server and run the installation script:"
echo ""
echo "ssh $SERVER"
echo "cd /var/www/latinmixmasters"
echo "sudo ./install-ubuntu.sh"
echo ""
echo "After installation, visit http://YOUR_SERVER_IP in your browser"

