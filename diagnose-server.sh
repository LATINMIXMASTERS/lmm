
#!/bin/bash

echo "=== Latin Mix Masters Server Diagnostic Tool ==="
echo "Running diagnostics for common issues..."

# Check Node.js installation
echo -e "\n1. Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✓ Node.js is installed: $NODE_VERSION"
else
    echo "✗ Node.js is not installed!"
    echo "   Run: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
fi

# Check npm installation
echo -e "\n2. Checking npm installation..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "✓ npm is installed: $NPM_VERSION"
else
    echo "✗ npm is not installed!"
fi

# Check PM2 installation
echo -e "\n3. Checking PM2 installation..."
if command -v pm2 &> /dev/null; then
    PM2_VERSION=$(pm2 -v)
    echo "✓ PM2 is installed: $PM2_VERSION"
else
    echo "✗ PM2 is not installed!"
    echo "   Run: sudo npm install -g pm2"
fi

# Check application directory
APP_DIR="/var/www/latinmixmasters"
echo -e "\n4. Checking application directory: $APP_DIR..."
if [ -d "$APP_DIR" ]; then
    echo "✓ Application directory exists"
    
    # Check package.json
    if [ -f "$APP_DIR/package.json" ]; then
        echo "✓ package.json exists"
    else
        echo "✗ package.json is missing!"
        echo "   This is likely why npm install is failing."
    fi
    
    # Check for build directory
    if [ -d "$APP_DIR/dist" ]; then
        echo "✓ Build directory exists"
    else
        echo "✗ Build directory is missing!"
        echo "   The application may not be built properly."
    fi
    
    # Check file permissions
    PERMISSION_ISSUES=$(find "$APP_DIR" -maxdepth 1 -not -writable -type f -or -not -readable -type f | wc -l)
    if [ "$PERMISSION_ISSUES" -eq "0" ]; then
        echo "✓ File permissions look good"
    else
        echo "✗ Permission issues found! Run: sudo chown -R $(whoami) $APP_DIR"
    fi
else
    echo "✗ Application directory doesn't exist!"
    echo "   Create it with: sudo mkdir -p $APP_DIR"
fi

# Check Nginx
echo -e "\n5. Checking Nginx..."
if command -v nginx &> /dev/null; then
    NGINX_VERSION=$(nginx -v 2>&1)
    echo "✓ Nginx is installed: $NGINX_VERSION"
    
    # Check Nginx configuration
    if [ -f "/etc/nginx/sites-available/latinmixmasters" ]; then
        echo "✓ Nginx site configuration exists"
        
        if [ -L "/etc/nginx/sites-enabled/latinmixmasters" ]; then
            echo "✓ Nginx site is enabled"
        else
            echo "✗ Nginx site is not enabled!"
            echo "   Run: sudo ln -s /etc/nginx/sites-available/latinmixmasters /etc/nginx/sites-enabled/"
        fi
    else
        echo "✗ Nginx site configuration is missing!"
    fi
    
    # Check Nginx status
    if systemctl is-active --quiet nginx; then
        echo "✓ Nginx is running"
    else
        echo "✗ Nginx is not running!"
        echo "   Run: sudo systemctl start nginx"
    fi
else
    echo "✗ Nginx is not installed!"
    echo "   Run: sudo apt-get install -y nginx"
fi

# Check PM2 processes
echo -e "\n6. Checking PM2 processes..."
if command -v pm2 &> /dev/null; then
    PM2_PROCESS=$(pm2 list | grep latinmixmasters || echo "")
    if [ -n "$PM2_PROCESS" ]; then
        echo "✓ PM2 process for latinmixmasters exists"
    else
        echo "✗ PM2 process for latinmixmasters not found!"
        echo "   Run: cd $APP_DIR && pm2 start ecosystem.config.js"
    fi
fi

# Network checks
echo -e "\n7. Checking network configuration..."
FIREWALL_STATUS=$(ufw status | grep "Status: " || echo "Firewall not installed")
echo "Firewall status: $FIREWALL_STATUS"

# Check port 80 availability
if command -v netstat &> /dev/null; then
    PORT_STATUS=$(netstat -tuln | grep ":80 " || echo "")
    if [ -n "$PORT_STATUS" ]; then
        echo "✓ Port 80 is in use (should be by Nginx)"
    else
        echo "✗ Port 80 is not in use! Nginx may not be running correctly."
    fi
else
    echo "netstat not available, install with: sudo apt-get install net-tools"
fi

echo -e "\n=== Diagnostic Summary ==="
echo "If any issues were found, please address them using the suggested commands."
echo "For further assistance, check the application logs:"
echo "  PM2 logs: pm2 logs latinmixmasters"
echo "  Nginx error logs: sudo tail -f /var/log/nginx/error.log"
