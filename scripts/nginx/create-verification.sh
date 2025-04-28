
#!/bin/bash
set -e

# Create verification file
create_verification() {
  local APP_DIR=$1
  
  echo "Creating verification file..."
  echo "Nginx setup completed on $(date)" > "$APP_DIR/nginx-setup-completed.txt"
}

# Export the function
create_verification "$1"
