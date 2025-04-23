
#!/bin/bash
set -e

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Make all scripts executable
chmod +x $SCRIPT_DIR/*.sh

# Run all installation steps in the correct order
$SCRIPT_DIR/setup-directories.sh
$SCRIPT_DIR/check-source.sh
$SCRIPT_DIR/setup-nodejs.sh
$SCRIPT_DIR/setup-application.sh
$SCRIPT_DIR/setup-nginx.sh
$SCRIPT_DIR/setup-pm2.sh
$SCRIPT_DIR/show-summary.sh

echo "All installation steps completed successfully!"
echo "Your site should be available at https://lmmapp.latinmixmasters.com"
