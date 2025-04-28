
#!/bin/bash
set -e

# Get or renew SSL certificate
obtain_certificate() {
  local DOMAIN=$1
  
  echo "Obtaining SSL certificate for $DOMAIN..."
  certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos --email webmaster@$DOMAIN --verbose || {
    echo "ERROR: Failed to obtain SSL certificate. Please check your domain configuration."
    echo "Detailed diagnostics:"
    echo "1. Checking if DNS resolves properly:"
    host $DOMAIN
    echo "2. Checking if ports 80 and 443 are open:"
    nc -zv $DOMAIN 80
    nc -zv $DOMAIN 443
    echo "3. Trying certbot with manual DNS verification as fallback..."
    echo ""
    echo "To generate certificates manually, try running:"
    echo "certbot certonly --manual --preferred-challenges dns -d $DOMAIN"
    echo "Then follow the instructions to place a DNS TXT record."
    return 1
  }
  
  return 0
}

# Export the function
obtain_certificate "$1"
