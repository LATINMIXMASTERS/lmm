
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

# Install certbot if not already installed
if ! command -v certbot &> /dev/null; then
  echo "Installing Certbot..."
  apt-get update
  apt-get install -y certbot
fi

# Install required utilities if not present
for pkg in curl net-tools lsof netcat; do
  if ! command -v $pkg &> /dev/null; then
    echo "Installing $pkg..."
    apt-get install -y $pkg
  fi
done

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
    certbot renew --force-renewal --cert-name "$DOMAIN" || {
      echo "Certificate renewal failed. Attempting a fresh certificate..."
      rm -rf /etc/letsencrypt/live/$DOMAIN
      rm -rf /etc/letsencrypt/archive/$DOMAIN
      rm -rf /etc/letsencrypt/renewal/$DOMAIN.conf
    }
  fi
else
  echo "No certificates found for $DOMAIN. Generating new certificates..."
fi

# Always ensure ports 80 and 443 are available before attempting certificate generation
echo "Checking if ports are in use..."
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

# Check firewall settings
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

# Check if nginx is running, stop it if it is
if systemctl is-active --quiet nginx; then
  echo "Stopping Nginx temporarily..."
  systemctl stop nginx
fi

# Output DNS resolution info for debugging
echo "DNS Resolution check for $DOMAIN:"
dig +short $DOMAIN || echo "DNS lookup failed"
nslookup $DOMAIN || echo "nslookup failed"

# Attempt a quick HTTP connection to verify DNS resolves correctly
echo "Testing HTTP connectivity to your domain..."
curl -s --connect-timeout 5 http://$DOMAIN/ > /dev/null
CURL_EXIT=$?
if [ $CURL_EXIT -ne 0 ]; then
  echo "WARNING: Cannot connect to http://$DOMAIN/ (exit code $CURL_EXIT)"
  echo "This may indicate DNS is not properly configured."
  echo "Your domain should resolve to this server: $(curl -s ifconfig.me)"
fi

# Obtain or renew certificate with increased verbosity and more diagnostics
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ] || [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
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
    systemctl start nginx
    exit 1
  }
fi

# Fix permissions issues that might cause Nginx to fail reading certificates
echo "Setting proper permissions for SSL certificates..."
mkdir -p /etc/letsencrypt/live
mkdir -p /etc/letsencrypt/archive
chmod -R 755 /etc/letsencrypt/live
chmod -R 755 /etc/letsencrypt/archive

# Better symlink validation and repair
echo "Validating certificate symlinks..."
if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
  for file in cert.pem chain.pem fullchain.pem privkey.pem; do
    symlink="/etc/letsencrypt/live/$DOMAIN/$file"
    if [ -L "$symlink" ] && [ ! -e "$symlink" ]; then
      echo "Broken symlink detected: $symlink"
      # Find the newest matching file in archive
      target=$(find /etc/letsencrypt/archive/$DOMAIN -name "$file*" | sort -V | tail -n 1)
      if [ ! -z "$target" ]; then
        echo "Fixing symlink to point to: $target"
        ln -sf "$target" "$symlink"
      else
        echo "Cannot find target for symlink: $symlink"
      fi
    elif [ ! -f "$symlink" ]; then
      echo "Missing certificate file: $symlink"
    fi
  done
fi

# Create a cron job for renewal if it doesn't exist already
if ! crontab -l 2>/dev/null | grep -q "certbot renew"; then
  (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && systemctl reload nginx") | crontab -
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

# Display verification information
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
  echo -e "\nCertificate information for $DOMAIN:"
  openssl x509 -in "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" -text -noout | grep -E 'Subject:|Issuer:|Not Before:|Not After :'
  
  # Output success message with next steps
  echo -e "\n=== SSL Setup Complete ==="
  echo -e "Certificate is installed for: $DOMAIN"
  echo -e "Certificate will auto-renew via Certbot's systemd timer."
  echo -e "You can now test your site at https://$DOMAIN"
  echo -e "Run the diagnose script if you encounter issues:"
  echo -e "  ./scripts/diagnose-nginx.sh"
else
  echo -e "\nWARNING: Certificate file not found at /etc/letsencrypt/live/$DOMAIN/fullchain.pem"
  echo -e "Something may have gone wrong with the certificate generation process."
  echo -e "Run the diagnose script to fix the problem:"
  echo -e "  ./scripts/diagnose-nginx.sh"
fi
