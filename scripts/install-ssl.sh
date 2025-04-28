
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

# Check if certificates already exist
if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
  echo "SSL certificates for $DOMAIN already exist."
  echo "Checking certificate validity..."
  
  if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    # Check expiration date
    EXPIRATION=$(openssl x509 -enddate -noout -in "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" | cut -d= -f 2)
    EXPIRATION_EPOCH=$(date -d "$EXPIRATION" +%s)
    CURRENT_EPOCH=$(date +%s)
    DAYS_LEFT=$(( ($EXPIRATION_EPOCH - $CURRENT_EPOCH) / 86400 ))
    
    echo "Certificate expires in $DAYS_LEFT days ($EXPIRATION)"
    
    if [ $DAYS_LEFT -lt 30 ]; then
      echo "Certificate expires soon. Attempting to renew..."
      certbot renew --force-renewal
    else
      echo "Certificate is still valid."
    fi
  else
    echo "Certificate files missing. Re-generating certificates..."
    certbot renew --force-renewal --cert-name "$DOMAIN"
  fi
else
  echo "No certificates found for $DOMAIN. Generating new certificates..."

  # Check if nginx is running, stop it if it is
  if systemctl is-active --quiet nginx; then
    echo "Stopping Nginx temporarily..."
    systemctl stop nginx
  fi

  # Check if ports are in use
  if command -v lsof &> /dev/null; then
    if lsof -i :80 > /dev/null; then
      echo "WARNING: Port 80 is already in use by another process."
      echo "Attempting to free up port 80..."
      # Try to identify and kill the process
      PROC=$(lsof -i :80 -t)
      if [ ! -z "$PROC" ]; then
        echo "Killing process $PROC that's using port 80..."
        kill -15 $PROC || kill -9 $PROC
        sleep 3
      fi
    fi
  else
    apt-get update && apt-get install -y lsof
  fi

  # Obtain certificate using standalone method to avoid nginx configuration issues
  echo "Obtaining SSL certificate for $DOMAIN..."
  certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos --email webmaster@$DOMAIN || {
    echo "ERROR: Failed to obtain SSL certificate. Please check your domain configuration."
    echo "Possible issues:"
    echo "1. DNS not properly configured to point to this server's IP"
    echo "2. Port 80 blocked by firewall"
    echo "3. Another process using port 80"
    systemctl start nginx
    exit 1
  }
fi

# Ensure proper permissions
echo "Setting proper permissions for SSL certificates..."
chmod -R 755 /etc/letsencrypt/live
chmod -R 755 /etc/letsencrypt/archive

# Create a cron job for renewal if it doesn't exist already
if ! crontab -l 2>/dev/null | grep -q "certbot renew"; then
  (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet") | crontab -
  echo "Added automatic certificate renewal cron job"
fi

# Start nginx again
echo "Starting Nginx..."
systemctl start nginx

# Check if nginx started successfully
if systemctl is-active --quiet nginx; then
  echo "Nginx started successfully"
else
  echo "WARNING: Nginx failed to start. Checking configuration..."
  nginx -t
  
  echo "Attempting to fix common issues..."
  SITE_CONFIG="/etc/nginx/sites-available/latinmixmasters"
  
  # Check if site config references SSL files that don't exist
  if [ -f "$SITE_CONFIG" ]; then
    if grep -q "ssl_certificate" "$SITE_CONFIG" && ! [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
      echo "Site configuration references SSL certificates that don't exist."
      echo "Creating HTTP-only configuration temporarily..."
      
      # Backup existing config
      cp "$SITE_CONFIG" "$SITE_CONFIG.ssl.bak"
      
      # Create HTTP-only config
      cat > "$SITE_CONFIG" << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;
    
    root /var/www/latinmixmasters/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
EOF
      
      echo "HTTP-only configuration created. Original SSL config saved as $SITE_CONFIG.ssl.bak"
      echo "Restarting Nginx..."
      systemctl restart nginx
    fi
  fi
fi

echo "SSL setup completed. Certificate will auto-renew via Certbot's systemd timer."

# Display verification information
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
  echo -e "\nCertificate information for $DOMAIN:"
  openssl x509 -in "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" -text -noout | grep -E 'Subject:|Issuer:|Not Before:|Not After :'
else
  echo -e "\nWARNING: Certificate file not found at /etc/letsencrypt/live/$DOMAIN/fullchain.pem"
fi
