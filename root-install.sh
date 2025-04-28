
#!/bin/bash
set -e

echo "=== Latin Mix Masters Root User Installation Script ==="
echo "This script will install Latin Mix Masters on your Ubuntu 22.04 server"
echo "Domain: lmmapp.latinmixmasters.com"

# Check if running as root
if [ "$(id -u)" != "0" ]; then
  echo "This script must be run as root. Please use sudo or switch to root user."
  exit 1
fi

# Define application directory and domain
APP_DIR="/var/www/latinmixmasters"
DOMAIN="lmmapp.latinmixmasters.com"

# Create application directory and set up base structure
mkdir -p $APP_DIR
mkdir -p $APP_DIR/logs
mkdir -p $APP_DIR/dist
echo "Application directory created at $APP_DIR"

# Navigate to application directory
cd $APP_DIR
echo "Changed to directory: $(pwd)"

# Install essential packages
apt-get update
apt-get install -y git curl wget nginx

# Install Node.js if not already installed
if ! command -v node &> /dev/null; then
  echo "Installing Node.js 18.x..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
  apt-get install -y nodejs
fi

# Install PM2 if not already installed
if ! command -v pm2 &> /dev/null; then
  echo "Installing PM2..."
  npm install -g pm2
fi

# Configure Nginx with the domain
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

# Test Nginx configuration
echo "Testing Nginx configuration..."
nginx -t || {
  echo "ERROR: Nginx configuration failed. Please check the configuration."
  exit 1
}

# Start Nginx
systemctl restart nginx || {
  echo "ERROR: Failed to restart Nginx."
  systemctl status nginx
  exit 1
}

# Install SSL certificate with Let's Encrypt
echo "Setting up SSL certificate for ${DOMAIN}..."
apt-get install -y certbot

# Stop Nginx temporarily for certbot
systemctl stop nginx

# Obtain certificate using standalone method
certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos --email webmaster@$DOMAIN || {
  echo "WARNING: Failed to obtain SSL certificate. Continuing with HTTP only."
}

# Configure Nginx with SSL if certificate exists
if [ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
  echo "Configuring Nginx with SSL..."
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

  # Create cron job for certificate renewal
  (crontab -l 2>/dev/null | grep -v "certbot renew" ; echo "0 3 * * * certbot renew --quiet") | crontab -
  
  # Set proper permissions for SSL certificates
  chmod -R 755 /etc/letsencrypt/live
  chmod -R 755 /etc/letsencrypt/archive
fi

# Start Nginx again
systemctl start nginx || {
  echo "ERROR: Failed to start Nginx after configuration."
  systemctl status nginx
  exit 1
}

# Create a simple update script
cat > $APP_DIR/update.sh << EOF
#!/bin/bash
set -e

echo "=== Latin Mix Masters VPS Update Script ==="
echo "This script updates the application with minimal downtime"

# Create logs directory if it doesn't exist
mkdir -p logs

# Pull latest changes if using git
if [ -d ".git" ]; then
  echo "Fetching latest changes..."
  git fetch --depth=1 origin main

  # Store current HEAD for comparison
  CURRENT_COMMIT=\$(git rev-parse HEAD)
  REMOTE_COMMIT=\$(git rev-parse origin/main)

  if [ "\$CURRENT_COMMIT" = "\$REMOTE_COMMIT" ]; then
    echo "Already up to date. No changes to apply."
    exit 0
  fi

  # Apply changes
  echo "Applying updates..."
  git reset --hard origin/main

  # Update dependencies if package.json changed
  if git diff --name-only \$CURRENT_COMMIT \$REMOTE_COMMIT | grep -q "package.json"; then
    echo "Package changes detected, updating dependencies..."
    npm install --no-audit --no-fund --silent > logs/npm-update.log 2>&1 || {
      echo "ERROR: npm install failed. Check logs/npm-update.log for details."
      exit 1
    }
  fi
else
  echo "Not a git repository. Manual update required."
  echo "Please upload your files to $APP_DIR/dist"
  exit 0
fi

# Rebuild application
echo "Rebuilding application..."
npm run build > logs/build.log 2>&1 || {
  echo "ERROR: Build failed. Check logs/build.log for details."
  exit 1
}

# Restart application with PM2
echo "Restarting application..."
pm2 restart latinmixmasters || {
  echo "PM2 restart failed, trying to start..."
  pm2 start npm --name "latinmixmasters" -- start
}

echo "=== Update Complete ==="
echo "Application restarted with latest changes"
echo "Run 'pm2 logs latinmixmasters' to view application logs"
EOF

# Make update script executable
chmod +x $APP_DIR/update.sh

# Create a diagnostic script
cat > $APP_DIR/diagnose.sh << EOF
#!/bin/bash

echo "=== Latin Mix Masters Diagnostic Tool ==="
echo "Running diagnostics for domain: ${DOMAIN}"

# Check Nginx installation
echo -e "\n1. Checking Nginx..."
if command -v nginx &> /dev/null; then
  NGINX_VERSION=\$(nginx -v 2>&1)
  echo "✓ Nginx is installed: \$NGINX_VERSION"
  
  # Check Nginx configuration
  nginx -t && echo "✓ Nginx configuration is valid" || echo "✗ Nginx configuration has errors"
  
  # Check if Nginx is running
  systemctl is-active --quiet nginx && echo "✓ Nginx service is running" || echo "✗ Nginx service is not running"
else
  echo "✗ Nginx is not installed!"
fi

# Check SSL certificates
echo -e "\n2. Checking SSL certificates for ${DOMAIN}..."
if [ -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
  echo "✓ SSL directory exists"
  
  # Check each SSL file
  for FILE in fullchain.pem privkey.pem chain.pem; do
    if [ -f "/etc/letsencrypt/live/${DOMAIN}/\$FILE" ]; then
      echo "✓ \$FILE exists"
    else
      echo "✗ \$FILE does not exist!"
    fi
  done
else
  echo "✗ SSL directory does not exist"
fi

# Check ports
echo -e "\n3. Checking port availability..."
if command -v lsof &> /dev/null; then
  lsof -i :80 && echo "Port 80 is in use" || echo "Port 80 is not in use"
  lsof -i :443 && echo "Port 443 is in use" || echo "Port 443 is not in use"
else
  apt-get update && apt-get install -y lsof
  echo "Installed lsof. Please run this script again."
fi

# Show summary
echo -e "\n=== Diagnostic Summary ==="
echo "Domain: ${DOMAIN}"
echo "Application directory: ${APP_DIR}"
echo "SSL certificates: /etc/letsencrypt/live/${DOMAIN}/"
echo "Nginx config: /etc/nginx/sites-available/latinmixmasters"
echo ""
echo "If you're having issues:"
echo "1. Check Nginx error logs: sudo tail -f /var/log/nginx/error.log"
echo "2. Run the diagnose-nginx.sh script: sudo ./scripts/diagnose-nginx.sh"
echo "3. Rebuild SSL certificates manually:"
echo "   sudo systemctl stop nginx"
echo "   sudo certbot certonly --standalone -d ${DOMAIN} --agree-tos --email webmaster@${DOMAIN}"
echo "   sudo systemctl start nginx"
EOF

# Make diagnostic script executable
chmod +x $APP_DIR/diagnose.sh

echo "=== Installation Complete ==="
echo "Latin Mix Masters has been set up on your server!"
echo "Domain: https://${DOMAIN}"
echo ""
echo "Useful commands:"
echo "  ./update.sh            - Update the application"
echo "  ./diagnose.sh          - Run diagnostics if issues occur"
echo "  pm2 logs latinmixmasters - View application logs"

# Final message
echo ""
echo "IMPORTANT: Make sure your DNS records point ${DOMAIN} to this server's IP address."
echo "If SSL setup failed, you can run it manually:"
echo "sudo systemctl stop nginx"
echo "sudo certbot certonly --standalone -d ${DOMAIN} --agree-tos --email webmaster@${DOMAIN}"
echo "sudo systemctl start nginx"
