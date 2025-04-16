
#!/bin/bash
set -e

echo "=== Setting up SSL with Let's Encrypt ==="

# Check if domain name was provided
if [ -z "$1" ]; then
  echo "Please provide a domain name."
  echo "Usage: $0 yourdomain.com"
  exit 1
fi

DOMAIN=$1

# Install certbot if not already installed
if ! command -v certbot &> /dev/null; then
  echo "Installing Certbot..."
  apt-get update
  apt-get install -y certbot python3-certbot-nginx
fi

# Obtain and install SSL certificate
echo "Obtaining SSL certificate for $DOMAIN..."
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email webmaster@$DOMAIN || {
  echo "ERROR: Failed to obtain SSL certificate. Please check your domain configuration."
  exit 1
}

echo "SSL certificate installed successfully for $DOMAIN!"
echo "Certificate will auto-renew via Certbot's systemd timer."
