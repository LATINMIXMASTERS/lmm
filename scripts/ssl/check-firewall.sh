
#!/bin/bash
set -e

# Check and configure firewall settings
check_firewall() {
  echo "Checking firewall settings..."
  if command -v ufw &> /dev/null; then
    if ufw status | grep -q "Status: active"; then
      echo "UFW firewall is active. Ensuring ports 80 and 443 are allowed..."
      ufw allow 80/tcp
      ufw allow 443/tcp
      echo "Firewall rules updated for HTTP/HTTPS"
    else
      echo "UFW is installed but not active"
    fi
  fi
}

# Export the function
check_firewall
