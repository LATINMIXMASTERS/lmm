
#!/bin/bash
set -e

echo "=== Setting up Nginx for Latin Mix Masters ==="

APP_DIR="/var/www/latinmixmasters"

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
  echo "Installing Nginx..."
  apt-get install -y nginx
fi

# Create nginx config
cat > /etc/nginx/sites-available/latinmixmasters << EOF
server {
    listen 80;
    server_name _;

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

# Enable site and remove default site
ln -sf /etc/nginx/sites-available/latinmixmasters /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t || {
  echo "ERROR: Nginx configuration failed. Please check the configuration."
  exit 1
}

# Restart Nginx
systemctl restart nginx

echo "Nginx setup complete"
