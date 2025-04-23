
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

# Stop nginx temporarily to free up port 80
echo "Stopping Nginx temporarily..."
systemctl stop nginx

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
chmod -R 755 /etc/letsencrypt/live
chmod -R 755 /etc/letsencrypt/archive

# Create a cron job for renewal if it doesn't exist already
if ! crontab -l | grep -q "certbot renew"; then
  (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet") | crontab -
  echo "Added automatic certificate renewal cron job"
fi

# Restart Nginx to apply changes
systemctl restart nginx
