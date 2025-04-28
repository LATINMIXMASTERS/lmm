
#!/bin/bash
set -e

echo "Making all optimization scripts executable..."

# Navigate to scripts directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Make all .sh scripts executable
find "$SCRIPT_DIR" -name "*.sh" -type f -exec chmod +x {} \;
chmod +x "$SCRIPT_DIR/../update.sh"

echo "All scripts are now executable"
