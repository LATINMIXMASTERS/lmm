
#!/bin/bash
set -e

echo "=== Setting up Nginx for Latin Mix Masters ==="

APP_DIR="/var/www/latinmixmasters"
DOMAIN="lmmapp.latinmixmasters.com"

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
  echo "Installing Nginx..."
  apt-get update
  apt-get install -y nginx
fi

# Install net-tools for network diagnostics
if ! command -v netstat &> /dev/null; then
  echo "Installing net-tools for diagnostics..."
  apt-get update
  apt-get install -y net-tools
fi

# Ensure directory exists
if [ ! -d "$APP_DIR" ]; then
  echo "Creating app directory at $APP_DIR..."
  mkdir -p "$APP_DIR"
fi

# Create nginx config with HTTP only first
cat > /etc/nginx/sites-available/latinmixmasters << EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};
    
    # For HTTP only setup initially
    root $APP_DIR/dist;
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

# Enable site and remove default site
ln -sf /etc/nginx/sites-available/latinmixmasters /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration before SSL
echo "Testing Nginx configuration (HTTP only)..."
nginx -t || {
  echo "ERROR: Nginx HTTP configuration failed. Please check the configuration."
  exit 1
}

# Ensure config directories exist
echo "Creating configuration directories..."
mkdir -p /etc/letsencrypt/live/$DOMAIN
mkdir -p /etc/letsencrypt/archive/$DOMAIN

# Start Nginx to make sure it works with HTTP first
echo "Starting Nginx with HTTP config..."
systemctl restart nginx || {
  echo "ERROR: Failed to restart Nginx with HTTP configuration"
  echo "Checking Nginx status:"
  systemctl status nginx
  exit 1
}

# Check if port 80 is accessible
echo "Checking if port 80 is accessible..."
if command -v curl &> /dev/null; then
  HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost)
  if [ "$HTTP_RESPONSE" = "200" ] || [ "$HTTP_RESPONSE" = "404" ]; then
    echo "✓ Port 80 is accessible (HTTP status: $HTTP_RESPONSE)"
  else
    echo "⚠️ HTTP check failed (status: $HTTP_RESPONSE)"
  fi
else
  apt-get update && apt-get install -y curl
  echo "Curl installed for HTTP checks"
fi

# Ensure firewall allows HTTP and HTTPS
if command -v ufw &> /dev/null; then
  echo "Checking firewall..."
  if ufw status | grep -q "Status: active"; then
    echo "UFW is active, ensuring ports 80 and 443 are allowed..."
    ufw allow 80/tcp
    ufw allow 443/tcp
    echo "✓ Firewall configured to allow HTTP and HTTPS"
  else
    echo "UFW is not active"
  fi
fi

# Get the current script's directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Check if SSL is already set up
if [ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
  echo "Setting up SSL certificate..."
  # Use the absolute path to the install-ssl.sh script
  if [ -f "$SCRIPT_DIR/install-ssl.sh" ]; then
    chmod +x "$SCRIPT_DIR/install-ssl.sh"
    "$SCRIPT_DIR/install-ssl.sh" || {
      echo "WARNING: SSL setup failed. Keeping HTTP-only configuration."
      exit 0
    }
  else
    echo "ERROR: install-ssl.sh script not found at $SCRIPT_DIR/install-ssl.sh"
    echo "Continuing with HTTP-only configuration."
    exit 0
  fi
else
  echo "SSL certificate already exists for ${DOMAIN}"
fi

# Only proceed with SSL configuration if certificates exist and are valid
if [ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ] && [ -f "/etc/letsencrypt/live/${DOMAIN}/privkey.pem" ]; then
  # Verify certificate files
  if openssl x509 -checkend 0 -noout -in "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"; then
    echo "✓ SSL certificate is valid"
    echo "Updating Nginx configuration to use SSL..."
    
    # Create full configuration with SSL
    cat > /etc/nginx/sites-available/latinmixmasters << EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};
    
    # Redirect HTTP to HTTPS
    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${DOMAIN};

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/${DOMAIN}/chain.pem;
    
    # SSL optimization
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    root $APP_DIR/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Add proper CORS headers
    add_header Access-Control-Allow-Origin "*";
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, DELETE";
    add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
    add_header Access-Control-Allow-Credentials "true";
}
EOF

    # Test Nginx configuration with SSL
    echo "Testing Nginx configuration with SSL..."
    nginx -t && {
      echo "✓ SSL configuration is valid"
      systemctl restart nginx && echo "✓ Nginx restarted with SSL configuration" || echo "✗ Failed to restart Nginx"
    } || {
      echo "✗ SSL configuration is invalid"
      echo "Reverting to HTTP-only configuration..."
      
      # Revert to HTTP only configuration
      cat > /etc/nginx/sites-available/latinmixmasters << EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};
    
    root $APP_DIR/dist;
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
      systemctl restart nginx && echo "✓ Nginx restarted with HTTP configuration" || echo "✗ Failed to restart Nginx"
    }
  else
    echo "✗ SSL certificate validation failed"
    echo "Certificate might be expired or corrupted. Running diagnose-nginx.sh for troubleshooting..."
    if [ -f "$SCRIPT_DIR/diagnose-nginx.sh" ]; then
      chmod +x "$SCRIPT_DIR/diagnose-nginx.sh"
      "$SCRIPT_DIR/diagnose-nginx.sh"
    else
      echo "diagnose-nginx.sh not found at $SCRIPT_DIR/diagnose-nginx.sh"
    fi
  fi
else
  echo "Required SSL certificate files not found"
  echo "Using HTTP-only configuration for now"
fi

# Create a verification file to check if setup is complete
echo "Nginx setup completed on $(date)" > "$APP_DIR/nginx-setup-completed.txt"
