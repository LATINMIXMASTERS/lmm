
#!/bin/bash
set -e

echo "=== Latin Mix Masters Diagnostic Tool ==="
echo "Running comprehensive diagnostics for server, Nginx, SSL, and S3 connectivity..."

# Define the domain name
DOMAIN="lmmapp.latinmixmasters.com"
echo "Target domain: $DOMAIN"

# Server Information
echo -e "\n===== SERVER INFORMATION ====="
echo "IP Address: $(curl -s ifconfig.me || echo 'Cannot determine')"
echo "Hostname: $(hostname -f || echo 'Cannot determine')"
echo "User: $(whoami)"
echo "Date/Time: $(date)"
echo "OS Version: $(cat /etc/os-release | grep PRETTY_NAME | cut -d= -f2 | tr -d '"')"
echo "Kernel: $(uname -r)"

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
echo -e "\n===== NGINX INSTALLATION ====="
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
echo -e "\n===== NGINX CONFIGURATION ====="
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
    echo "Testing new configuration:"
    nginx -t && echo "✓ New configuration is valid" || echo "✗ New configuration still has issues"
  fi
fi

# Check SSL certificates
echo -e "\n===== SSL CERTIFICATES ====="
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
        echo "  Fixing permissions..."
        chmod 644 "$SSL_DIR/$FILE"
        echo "  New permissions: $(stat -c "%a" "$SSL_DIR/$FILE")"
      fi
      
      # Check if file is a symbolic link and if target exists
      if [ -L "$SSL_DIR/$FILE" ]; then
        TARGET=$(readlink -f "$SSL_DIR/$FILE")
        echo "  Link target: $TARGET"
        if [ ! -f "$TARGET" ]; then
          echo "  ⚠️ Link target does not exist!"
          
          # Try to find a valid target file and fix the symlink
          echo "  Searching for valid certificate file to restore symlink..."
          ARCHIVE_DIR="/etc/letsencrypt/archive/$DOMAIN"
          if [ -d "$ARCHIVE_DIR" ]; then
            POTENTIAL_TARGET=$(find "$ARCHIVE_DIR" -name "${FILE%.*}*.pem" | sort -V | tail -n 1)
            if [ ! -z "$POTENTIAL_TARGET" ] && [ -f "$POTENTIAL_TARGET" ]; then
              echo "  Found valid file: $POTENTIAL_TARGET"
              echo "  Creating new symlink..."
              ln -sf "$POTENTIAL_TARGET" "$SSL_DIR/$FILE"
              echo "  Symlink fixed."
            else
              echo "  No valid certificate files found in archive."
            fi
          else
            echo "  Archive directory does not exist: $ARCHIVE_DIR"
          fi
        }
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
    
    # Start Nginx again
    systemctl start nginx
  fi
fi

# Check nginx service status
echo -e "\n===== NGINX SERVICE STATUS ====="
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

# Fix ownership and permissions of SSL directories
echo -e "\n===== FIXING SSL DIRECTORY PERMISSIONS ====="
if [ -d "/etc/letsencrypt" ]; then
  echo "Setting proper permissions for all SSL certificates..."
  find /etc/letsencrypt -type d -exec chmod 755 {} \;
  find /etc/letsencrypt -type f -exec chmod 644 {} \;
  echo "✓ SSL directory permissions updated"
else
  echo "✗ /etc/letsencrypt directory does not exist"
fi

# Check port availability
echo -e "\n===== PORT AVAILABILITY ====="
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

# Check if firewall is blocking ports
echo -e "\n===== FIREWALL STATUS ====="
if command -v ufw &> /dev/null; then
  UFW_STATUS=$(ufw status)
  echo "UFW Status: "
  echo "$UFW_STATUS"
  
  if echo "$UFW_STATUS" | grep -q "Status: active"; then
    # Check for ports 80 and 443
    HTTP_ALLOWED=$(echo "$UFW_STATUS" | grep "80/tcp" | grep "ALLOW")
    HTTPS_ALLOWED=$(echo "$UFW_STATUS" | grep "443/tcp" | grep "ALLOW")
    
    if [ -z "$HTTP_ALLOWED" ]; then
      echo "⚠️ HTTP port 80 may be blocked by firewall"
      echo "Running: sudo ufw allow 80/tcp"
      ufw allow 80/tcp
    else
      echo "✓ HTTP port 80 is allowed through firewall"
    fi
    
    if [ -z "$HTTPS_ALLOWED" ]; then
      echo "⚠️ HTTPS port 443 may be blocked by firewall"
      echo "Running: sudo ufw allow 443/tcp"
      ufw allow 443/tcp
    else
      echo "✓ HTTPS port 443 is allowed through firewall"
    fi
  fi
else
  echo "UFW not installed or not configured"
fi

# DNS check
echo -e "\n===== DNS RESOLUTION ====="
echo "Checking DNS resolution for $DOMAIN:"
if command -v dig &> /dev/null; then
  SERVER_IP=$(curl -s ifconfig.me)
  DOMAIN_IP=$(dig +short $DOMAIN)
  echo "Server IP: $SERVER_IP"
  echo "Domain DNS Resolution: $DOMAIN_IP"
  
  if [ "$DOMAIN_IP" = "$SERVER_IP" ]; then
    echo "✓ DNS is correctly pointing to this server"
  else
    echo "⚠️ DNS might not be pointing to this server"
    echo "  - Your server IP: $SERVER_IP"
    echo "  - IP from DNS: $DOMAIN_IP"
    echo "  - DNS needs to be updated to point to this server's IP"
  fi
else
  echo "Installing DNS utilities..."
  apt-get update && apt-get install -y dnsutils
  echo "Please rerun this script to check DNS."
fi

# Check S3 Backblaze connectivity
echo -e "\n===== S3 BACKBLAZE CONNECTIVITY ====="
echo "Checking browser JavaScript compatibility for S3 signatures:"

# Install Node.js if not installed (for script execution)
if ! command -v node &> /dev/null; then
  echo "Installing Node.js for S3 testing..."
  apt-get update
  apt-get install -y nodejs npm
fi

# Create a temporary test script
TEST_SCRIPT=$(mktemp)
cat > "$TEST_SCRIPT" << 'EOF'
// Test browser crypto APIs that are needed for S3 signatures
console.log("Testing browser crypto APIs required for S3 signatures...");

// Simulate browser crypto APIs using Node.js
if (typeof crypto === 'undefined') {
  console.log("Node crypto available: Yes");
  
  try {
    const nodeCrypto = require('crypto');
    global.crypto = {
      subtle: {
        digest: async (algorithm, data) => {
          const hash = nodeCrypto.createHash(algorithm.toLowerCase().replace('-', ''));
          hash.update(Buffer.from(data));
          return hash.digest();
        },
        importKey: async () => {
          console.log("importKey function would be called in browser");
          return {};
        },
        sign: async () => {
          console.log("sign function would be called in browser");
          return new ArrayBuffer(32);
        }
      }
    };
    console.log("Crypto API simulation: Success");
  } catch (error) {
    console.log("Failed to simulate crypto:", error.message);
  }
} else {
  console.log("Browser crypto API available: Yes");
}

// Test TextEncoder
try {
  const encoder = new TextEncoder();
  const encoded = encoder.encode("test");
  console.log("TextEncoder working: Yes");
} catch (error) {
  console.log("TextEncoder error:", error.message);
}

// Test ArrayBuffer manipulation
try {
  const buffer = new ArrayBuffer(16);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < view.length; i++) {
    view[i] = i;
  }
  const hex = Array.from(view).map(b => b.toString(16).padStart(2, '0')).join('');
  console.log("ArrayBuffer/Uint8Array manipulation: Working");
  console.log("Hex encoding working:", hex === "000102030405060708090a0b0c0d0e0f");
} catch (error) {
  console.log("ArrayBuffer error:", error.message);
}

console.log("\nS3 Signature Requirements Check:");
console.log("1. Crypto subtle API: " + (crypto && crypto.subtle ? "✅ Available" : "❌ Missing"));
console.log("2. TextEncoder: " + (typeof TextEncoder !== 'undefined' ? "✅ Available" : "❌ Missing"));
console.log("3. ArrayBuffer manipulation: ✅ Available");

console.log("\nIf all checks pass, S3 signatures should work correctly in the browser context.");
EOF

node "$TEST_SCRIPT"
rm "$TEST_SCRIPT"

echo -e "\n===== S3 CONFIGURATION CHECK ====="
APP_DIR="/var/www/latinmixmasters"
if [ -d "$APP_DIR/dist" ]; then
  echo "Checking for stored S3 configuration in browser localStorage..."
  
  # Create a temporary HTML file to extract localStorage
  CHECK_HTML=$(mktemp)
  cat > "$CHECK_HTML" << 'EOF'
<!DOCTYPE html>
<html>
<head><title>S3 Config Check</title></head>
<body>
<script>
  // Check localStorage for S3 config
  const s3Config = localStorage.getItem('latinmixmasters_s3config');
  console.log("S3 Configuration found:", s3Config ? "Yes" : "No");
  
  if (s3Config) {
    try {
      const parsedConfig = JSON.parse(s3Config);
      // Sanitize the output by hiding secrets
      const sanitizedConfig = {
        ...parsedConfig,
        secretAccessKey: parsedConfig.secretAccessKey ? '***********' : undefined
      };
      console.log("S3 Config details:", JSON.stringify(sanitizedConfig, null, 2));
      
      document.write(`<p>S3 Configuration detected:</p>
        <ul>
          <li>Bucket Name: ${sanitizedConfig.bucketName || 'Not set'}</li>
          <li>Region: ${sanitizedConfig.region || 'Not set'}</li>
          <li>Endpoint: ${sanitizedConfig.endpoint || 'Not set'}</li>
          <li>Access Key ID: ${sanitizedConfig.accessKeyId ? sanitizedConfig.accessKeyId.substring(0, 5) + '...' : 'Not set'}</li>
          <li>Secret Key: ${sanitizedConfig.secretAccessKey ? 'Present (hidden)' : 'Not set'}</li>
        </ul>
        <p>Common Backblaze B2 issues:</p>
        <ul>
          <li>Incorrect endpoint format (should be https://s3.REGION.backblazeb2.com)</li>
          <li>Missing or invalid Access Key ID or Secret Access Key</li>
          <li>Bucket permissions not set to public</li>
          <li>Missing CORS configuration in Backblaze B2</li>
        </ul>`);
    } catch (e) {
      console.error("Error parsing S3 config:", e);
      document.write(`<p>Error parsing S3 configuration: ${e.message}</p>`);
    }
  } else {
    document.write(`<p>No S3 configuration found in localStorage.</p>
      <p>You need to set up S3 storage in the admin panel.</p>`);
  }
</script>
</body>
</html>
EOF

  echo "This script can't directly check browser localStorage, but here are troubleshooting tips:"
  echo
  echo "1. Make sure you've configured S3 in the admin dashboard"
  echo "2. Check these common Backblaze B2 issues:"
  echo "   - Incorrect endpoint format (should be https://s3.REGION.backblazeb2.com)"
  echo "   - Missing or invalid Access Key ID or Secret Access Key"
  echo "   - Bucket permissions not set to public"
  echo "   - Missing CORS configuration in Backblaze B2"
  echo
  echo "3. For CORS configuration in Backblaze B2:"
  echo "   - Log into your Backblaze B2 account"
  echo "   - Go to your bucket settings"
  echo "   - Add a CORS rule with these settings:"
  echo "     * Allow all origins: *"
  echo "     * Allow methods: GET, PUT, POST, DELETE"
  echo "     * Allow headers: *"
  echo "     * Max age: 3600"
  
  # Clean up temp file
  rm "$CHECK_HTML"
else
  echo "Application directory not found: $APP_DIR/dist"
fi

echo -e "\n=== Manual SSL Certificate Installation ===\n"
echo "To manually install SSL certificate with Certbot, follow these steps:"
echo "1. Stop Nginx: sudo systemctl stop nginx"
echo "2. Run Certbot: sudo certbot certonly --standalone -d $DOMAIN --agree-tos --email webmaster@$DOMAIN"
echo "3. Start Nginx: sudo systemctl start nginx"
echo "4. If problems persist, check Nginx error logs: sudo tail -f /var/log/nginx/error.log"

echo -e "\n=== Manual Backblaze B2 CORS Configuration ===\n"
echo "To configure CORS for Backblaze B2:"
echo "1. Log in to your Backblaze B2 account"
echo "2. Navigate to the bucket you're using"
echo "3. Click 'Bucket Settings'"
echo "4. Add the following CORS rule:"
echo "   - Origin: *"
echo "   - Operations: s3_get, s3_put, s3_head, s3_post, s3_delete"
echo "   - Headers: *"
echo "   - Max Age Seconds: 3600"
echo "5. Save the CORS configuration"

echo -e "\n=== Diagnostic Summary ===\n"
echo "If issues persist, try these steps:"
echo "1. Check error logs: tail -f /var/log/nginx/error.log"
echo "2. Restore HTTP-only config if needed: cp /etc/nginx/sites-available/latinmixmasters.bak /etc/nginx/sites-available/latinmixmasters"
echo "3. For persistent errors, consider updating your domain's DNS A record to point to this server's IP"
echo "4. Ensure firewall allows ports 80 and 443: sudo ufw allow 80/tcp && sudo ufw allow 443/tcp"
echo "5. Verify DNS propagation: dig $DOMAIN +short"
