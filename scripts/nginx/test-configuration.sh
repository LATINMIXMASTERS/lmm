
#!/bin/bash
set -e

# Test Nginx configuration
test_nginx_configuration() {
  local CONFIG_TYPE=$1
  
  echo "Testing Nginx $CONFIG_TYPE configuration..."
  nginx -t || {
    echo "ERROR: Nginx $CONFIG_TYPE configuration failed. Please check the configuration."
    return 1
  }
  return 0
}

# Export the function
test_nginx_configuration "$1"
