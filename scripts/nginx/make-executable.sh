
#!/bin/bash
set -e

# Get the current directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Make all Nginx scripts executable
echo "Making all Nginx scripts executable..."
find "$DIR" -name "*.sh" -type f -exec chmod +x {} \;

echo "All Nginx scripts are now executable"
