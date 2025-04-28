
#!/bin/bash
set -e

echo "=== Latin Mix Masters Nginx Diagnostic Tool ==="

# Set the domain
DOMAIN="lmmapp.latinmixmasters.com"
echo "Running diagnostics for domain: $DOMAIN"

# Function to check if a file exists and show its content
check_file() {
  if [ -f "$1" ]; then
    echo "✓ $2 exists"
    echo "--- Content of $1 ---"
    cat "$1"
    echo "--- End of $1 ---"
    return 0
  else
    echo "✗ $2 does not exist!"
    return 1
  fi
}

# Check nginx installation
echo -e "\n1. Checking Nginx installation..."
if command -v nginx &> /dev/null; then
  NGINX_VERSION=$(nginx -v 2>&1)
  echo "✓ Nginx is installed: $NGINX_VERSION"
else
  echo "✗ Nginx is not installed!"
  echo "Installing nginx..."
  apt-get update && apt-get install -y nginx
  echo "Nginx installed successfully."
fi

# Check nginx configuration
echo -e "\n2. Testing Nginx configuration..."
NGINX_TEST=$(nginx -t 2>&1)
if [ $? -eq 0 ]; then
  echo "✓ Nginx configuration is valid"
else
  echo "✗ Nginx configuration has errors:"
  echo "$NGINX_TEST"
  
  echo -e "\nAttempting to fix common configuration issues..."
  
  # Check if SSL certificate paths are correct
  if echo "$NGINX_TEST" | grep -q "SSL_CTX_use_PrivateKey_file"; then
    echo "Problem detected: SSL certificate issues"
    
    # Check if our site configuration exists
    SITE_CONFIG="/etc/nginx/sites-available/latinmixmasters"
    check_file "$SITE_CONFIG" "Site configuration"
    
    # Check if SSL certificates exist
    SSL_DIR="/etc/letsencrypt/live/$DOMAIN"
    if [ ! -d "$SSL_DIR" ]; then
      echo "✗ SSL directory does not exist for domain $DOMAIN"
      echo "Creating SSL directory for testing..."
      mkdir -p "$SSL_DIR"
    fi
    
    # Check each SSL file
    for FILE in fullchain.pem privkey.pem chain.pem; do
      if [ ! -f "$SSL_DIR/$FILE" ]; then
        echo "✗ $FILE does not exist in $SSL_DIR"
      else
        echo "✓ $FILE exists"
      fi
    done
    
    echo -e "\nModifying Nginx configuration to use HTTP only temporarily..."
    # Backup the original configuration
    cp "$SITE_CONFIG" "$SITE_CONFIG.bak"
    
    # Create a simple HTTP-only configuration
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
    
    echo "Created temporary HTTP-only configuration. Original saved as $SITE_CONFIG.bak"
  fi
fi

# Check SSL certificates
echo -e "\n3. Checking SSL certificates..."
SSL_DIR="/etc/letsencrypt/live/$DOMAIN"
if [ -d "$SSL_DIR" ]; then
  echo "✓ SSL directory exists for $DOMAIN"
  
  # Check each SSL file
  for FILE in fullchain.pem privkey.pem chain.pem; do
    if [ -f "$SSL_DIR/$FILE" ]; then
      echo "✓ $FILE exists"
      # Check permissions
      PERMS=$(stat -c "%a" "$SSL_DIR/$FILE")
      echo "  Permissions: $PERMS"
      if [[ "$PERMS" != "644" && "$PERMS" != "640" && "$PERMS" != "600" && "$PERMS" != "400" ]]; then
        echo "  ⚠️ Unusual permissions detected"
      fi
    else
      echo "✗ $FILE does not exist!"
    fi
  done
else
  echo "✗ SSL directory does not exist for $DOMAIN"
  echo "Would you like to generate SSL certificates now? (y/n)"
  read -r GENERATE_SSL
  
  if [[ "$GENERATE_SSL" =~ ^[Yy]$ ]]; then
    echo "Generating SSL certificates..."
    # Stop Nginx first
    systemctl stop nginx
    
    # Install certbot if not already installed
    if ! command -v certbot &> /dev/null; then
      apt-get update
      apt-get install -y certbot
    fi
    
    # Generate certificates
    certbot certonly --standalone -d "$DOMAIN" --non-interactive --agree-tos --email "webmaster@$DOMAIN" || {
      echo "Failed to generate SSL certificates."
    }
    
    # Check if generation was successful
    if [ -d "$SSL_DIR" ]; then
      echo "✓ SSL certificates generated successfully"
    else
      echo "✗ Failed to generate SSL certificates"
    fi
  fi
fi

# Check nginx service status
echo -e "\n4. Checking Nginx service status..."
if systemctl is-active --quiet nginx; then
  echo "✓ Nginx service is running"
else
  echo "✗ Nginx service is not running"
  echo "Checking service logs:"
  journalctl -u nginx --no-pager -n 20
  
  echo -e "\nAttempting to start Nginx service..."
  systemctl start nginx || {
    echo "Failed to start Nginx. Checking for additional details:"
    systemctl status nginx
  }
fi

# Check port availability
echo -e "\n5. Checking port availability..."
if command -v netstat &> /dev/null; then
  PORT80=$(netstat -tuln | grep ":80 ")
  PORT443=$(netstat -tuln | grep ":443 ")
  
  if [ -z "$PORT80" ]; then
    echo "✓ Port 80 is available (not in use by any process)"
  else
    echo "⚠️ Port 80 is in use by: $PORT80"
    echo "Checking what process is using port 80:"
    lsof -i :80 || echo "Could not determine process using port 80"
  fi
  
  if [ -z "$PORT443" ]; then
    echo "✓ Port 443 is available (not in use by any process)"
  else
    echo "⚠️ Port 443 is in use by: $PORT443"
    echo "Checking what process is using port 443:"
    lsof -i :443 || echo "Could not determine process using port 443"
  fi
else
  echo "netstat not available, installing net-tools..."
  apt-get update && apt-get install -y net-tools
  echo "Rerun this script after installation."
fi

echo -e "\n=== Manual SSL Certificate Installation ===\n"
echo "To manually install SSL certificate with Certbot, follow these steps:"
echo "1. Stop Nginx: sudo systemctl stop nginx"
echo "2. Run Certbot: sudo certbot certonly --standalone -d $DOMAIN --agree-tos --email webmaster@$DOMAIN"
echo "3. Start Nginx: sudo systemctl start nginx"
echo "4. If problems persist, check Nginx error logs: sudo tail -f /var/log/nginx/error.log"

echo -e "\n=== Diagnostic Summary ===\n"
echo "If issues persist, try these steps:"
echo "1. Check error logs: tail -f /var/log/nginx/error.log"
echo "2. Restore HTTP-only config if needed: cp /etc/nginx/sites-available/latinmixmasters.bak /etc/nginx/sites-available/latinmixmasters"
echo "3. For persistent errors, consider updating your domain's DNS A record to point to this server's IP"
echo "4. Ensure firewall allows ports 80 and 443: sudo ufw allow 80/tcp && sudo ufw allow 443/tcp"
