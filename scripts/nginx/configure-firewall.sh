
#!/bin/bash
set -e

# Configure firewall
configure_firewall() {
  echo "Checking firewall status..."
  
  if command -v ufw &> /dev/null; then
    echo "UFW is installed. Ensuring ports 80 and 443 are allowed..."
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    if ! ufw status | grep -q "Status: active"; then
      echo "UFW is installed but not active. You may need to enable it with 'ufw enable'"
    else
      echo "✓ UFW is active and ports 80/443 are allowed"
    fi
  else
    echo "UFW is not installed. Installing..."
    apt-get update && apt-get install -y ufw
    ufw allow 80/tcp
    ufw allow 443/tcp
    echo "UFW installed and ports 80/443 are allowed"
  fi
}

# Export the function
configure_firewall
