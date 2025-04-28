
#!/bin/bash
set -e

# Get the current directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Make all SSL scripts executable
echo "Making all SSL scripts executable..."
find "$DIR" -name "*.sh" -type f -exec chmod +x {} \;
chmod +x "$DIR/../install-ssl.sh"

echo "All SSL scripts are now executable"
