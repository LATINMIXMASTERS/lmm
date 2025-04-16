
#!/bin/bash
set -e

echo "=== Latin Mix Masters Upload Script ==="
echo "This script will help you upload your application to your Ubuntu server"

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Please provide the server address and destination directory."
    echo "Usage: $0 username@server-ip /path/on/server"
    echo "Example: $0 root@192.168.1.100 /var/www/latinmixmasters"
    exit 1
fi

SERVER="$1"
REMOTE_DIR="$2"
LOCAL_DIR="$(pwd)"

echo -e "\n>>> Testing SSH connection..."
ssh -o ConnectTimeout=5 $SERVER "echo Connection successful" || {
    echo "Failed to connect to $SERVER via SSH."
    echo "Please ensure:"
    echo "1. SSH server is running on the server"
    echo "2. You have the correct credentials/SSH keys setup"
    echo "3. Any firewalls allow SSH connections"
    exit 1
}

echo -e "\n>>> Creating remote directory..."
ssh $SERVER "mkdir -p $REMOTE_DIR"

echo -e "\n>>> Uploading application files..."
rsync -avz --progress --exclude 'node_modules' --exclude '.git' $LOCAL_DIR/ $SERVER:$REMOTE_DIR/

echo -e "\n>>> Making installation script executable..."
ssh $SERVER "chmod +x $REMOTE_DIR/install-ubuntu.sh"

echo -e "\n>>> Upload complete!"
echo "Now connect to your server and run the installation script:"
echo "ssh $SERVER"
echo "cd $REMOTE_DIR"
echo "sudo ./install-ubuntu.sh"
