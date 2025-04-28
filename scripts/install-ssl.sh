
#!/bin/bash
set -e

echo "=== Setting up SSL with Let's Encrypt ==="

# Define the domain name
DOMAIN="lmmapp.latinmixmasters.com"

# Install certbot if not already installed
if ! command -v certbot &> /dev/null; then
  echo "Installing Certbot..."
  apt-get update
  apt-get install -y certbot
fi

# Check if nginx is running, stop it if it is
if systemctl is-active --quiet nginx; then
  echo "Stopping Nginx temporarily..."
  systemctl stop nginx
fi

# Check if ports are in use
if command -v lsof &> /dev/null; then
  if lsof -i :80 > /dev/null; then
    echo "WARNING: Port 80 is already in use by another process."
    echo "Attempting to continue anyway..."
  fi
else
  apt-get update && apt-get install -y lsof
fi

# Obtain certificate using standalone method to avoid nginx configuration issues
echo "Obtaining SSL certificate for $DOMAIN..."
certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos --email webmaster@$DOMAIN || {
  echo "ERROR: Failed to obtain SSL certificate. Please check your domain configuration."
  systemctl start nginx
  exit 1
}

# Start nginx again
echo "Starting Nginx..."
systemctl start nginx

echo "SSL certificate installed successfully for $DOMAIN!"
echo "Certificate will auto-renew via Certbot's systemd timer."

# Ensure proper permissions
echo "Setting proper permissions for SSL certificates..."
chmod -R 755 /etc/letsencrypt/live
chmod -R 755 /etc/letsencrypt/archive

# Create a cron job for renewal if it doesn't exist already
if ! crontab -l 2>/dev/null | grep -q "certbot renew"; then
  (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet") | crontab -
  echo "Added automatic certificate renewal cron job"
fi

# Restart Nginx to apply changes
echo "Restarting Nginx to apply SSL configuration..."
systemctl restart nginx || {
  echo "WARNING: Failed to restart Nginx after SSL setup."
  echo "Checking Nginx status:"
  systemctl status nginx
}

echo "SSL setup completed."
