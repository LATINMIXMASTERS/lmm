
#!/bin/bash
set -e

# Check server information for debugging
check_server_info() {
  local DOMAIN=$1
  
  echo "SERVER INFORMATION:"
  echo "IP Address: $(curl -s ifconfig.me || echo 'Cannot determine')"
  echo "Hostname: $(hostname -f || echo 'Cannot determine')"
  echo "DNS Resolution for $DOMAIN:"
  host $DOMAIN || echo "Warning: DNS resolution failed"
}

# Export the function
check_server_info "$1"
