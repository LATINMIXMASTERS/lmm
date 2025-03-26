
#!/bin/bash
set -e

echo "=== Latin Mix Masters Upload Script ==="
echo "This script will help you upload your application to the server"

if [ -z "$1" ]; then
    echo "Please provide the server address."
    echo "Usage: $0 username@server-ip"
    exit 1
fi

SERVER="$1"
LOCAL_DIR="$(pwd)"

echo -e "\n>>> Creating remote directory..."
ssh $SERVER "sudo mkdir -p /var/www/latinmixmasters && sudo chown -R \$USER:\$USER /var/www/latinmixmasters"

echo -e "\n>>> Uploading application files..."
rsync -avz --progress --exclude 'node_modules' --exclude '.git' $LOCAL_DIR/ $SERVER:/var/www/latinmixmasters/

echo -e "\n>>> Upload complete!"
echo "Now connect to your server and run the install script:"
echo "ssh $SERVER"
echo "cd /var/www/latinmixmasters"
echo "chmod +x install.sh"
echo "./install.sh"
