
#!/bin/bash
set -e

echo "=== Setting up SSL with Let's Encrypt ==="

# Define the domain name
DOMAIN="lmmapp.latinmixmasters.com"

# Output debug info
echo "Server IP address: $(curl -s ifconfig.me)"
echo "Current working directory: $(pwd)"
echo "Running as user: $(whoami)"
echo "Checking DNS resolution:"
host $DOMAIN || echo "DNS lookup failed - verify your DNS settings"

# Make all SSL scripts executable
chmod +x scripts/ssl/*.sh

# Step 1: Check and install dependencies
scripts/ssl/check-dependencies.sh

# Step 2: Check if certificates already exist
scripts/ssl/check-certificates.sh "$DOMAIN"
CERT_STATUS=$?

# Step 3: Check ports and free up if needed
scripts/ssl/check-ports.sh

# Step 4: Check and configure firewall
scripts/ssl/check-firewall.sh

# Step 5: Check if nginx is running, stop it if it is
if systemctl is-active --quiet nginx; then
  echo "Stopping Nginx temporarily..."
  systemctl stop nginx
fi

# Step 6: Check DNS resolution
scripts/ssl/check-dns.sh "$DOMAIN"
DNS_STATUS=$?

# Step 7: Obtain or renew certificate if needed
if [ $CERT_STATUS -eq 2 ] || [ $CERT_STATUS -eq 1 ]; then
  scripts/ssl/obtain-certificate.sh "$DOMAIN"
fi

# Step 8: Fix permissions
scripts/ssl/fix-permissions.sh

# Step 9: Validate and fix symlinks
scripts/ssl/validate-symlinks.sh "$DOMAIN"

# Step 10: Setup automatic renewal
scripts/ssl/setup-renewal.sh

# Step 11: Start nginx again
echo "Starting Nginx..."
systemctl start nginx

# Step 12: Validate certificate installation
scripts/ssl/validate-certificate.sh "$DOMAIN"

echo "SSL installation process completed."
