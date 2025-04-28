
#!/bin/bash
set -e

echo "=== Setting up Nginx for Latin Mix Masters ==="

APP_DIR="/var/www/latinmixmasters"
DOMAIN="lmmapp.latinmixmasters.com"

# Get the current script's directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
NGINX_SCRIPTS_DIR="${SCRIPT_DIR}/nginx"

# Make nginx scripts executable
chmod +x ${NGINX_SCRIPTS_DIR}/*.sh

# Setup directories
${NGINX_SCRIPTS_DIR}/setup-directories.sh "$APP_DIR"

# Install dependencies
${NGINX_SCRIPTS_DIR}/install-dependencies.sh

# Display server information
${NGINX_SCRIPTS_DIR}/check-server-info.sh "$DOMAIN"

# Create initial HTTP-only configuration
${NGINX_SCRIPTS_DIR}/create-config.sh "$APP_DIR" "$DOMAIN" "false"

# Configure the site
${NGINX_SCRIPTS_DIR}/configure-site.sh

# Test initial configuration
${NGINX_SCRIPTS_DIR}/test-configuration.sh "HTTP"

# Start Nginx with initial configuration
echo "Starting Nginx with HTTP config..."
systemctl restart nginx || {
  echo "ERROR: Failed to restart Nginx with HTTP configuration"
  echo "Checking Nginx status:"
  systemctl status nginx
  exit 1
}

# Check port access
${NGINX_SCRIPTS_DIR}/check-port-access.sh

# Configure firewall
${NGINX_SCRIPTS_DIR}/configure-firewall.sh

# Run SSL setup script
echo "Setting up SSL certificates with Let's Encrypt..."
if [ -f "$SCRIPT_DIR/install-ssl.sh" ]; then
  chmod +x "$SCRIPT_DIR/install-ssl.sh"
  "$SCRIPT_DIR/install-ssl.sh" || {
    echo "WARNING: SSL setup failed. Keeping HTTP-only configuration."
    echo "Run the diagnostics script to troubleshoot:"
    echo "$SCRIPT_DIR/diagnose-nginx.sh"
  }
else
  echo "ERROR: install-ssl.sh script not found at $SCRIPT_DIR/install-ssl.sh"
  echo "Continuing with HTTP-only configuration."
fi

# Check if SSL certificates exist and update configuration if needed
SSL_STATUS=$(${NGINX_SCRIPTS_DIR}/validate-ssl.sh "$DOMAIN")
SSL_EXIT_CODE=$?

if [ $SSL_EXIT_CODE -eq 0 ]; then
  # SSL is valid, update to HTTPS configuration
  echo "Updating Nginx configuration to use SSL..."
  ${NGINX_SCRIPTS_DIR}/create-config.sh "$APP_DIR" "$DOMAIN" "true"
  
  # Test the SSL configuration
  if ${NGINX_SCRIPTS_DIR}/test-configuration.sh "SSL"; then
    echo "✓ SSL configuration is valid"
    systemctl restart nginx && echo "✓ Nginx restarted with SSL configuration" || echo "✗ Failed to restart Nginx"
  else
    echo "✗ SSL configuration is invalid"
    echo "Reverting to HTTP-only configuration..."
    ${NGINX_SCRIPTS_DIR}/create-config.sh "$APP_DIR" "$DOMAIN" "false"
    systemctl restart nginx
  fi
else
  echo "Using HTTP-only configuration"
  echo "You can try to set up SSL certificates later by running:"
  echo "$SCRIPT_DIR/install-ssl.sh"
fi

# Create verification file
${NGINX_SCRIPTS_DIR}/create-verification.sh "$APP_DIR"

# Show summary
${NGINX_SCRIPTS_DIR}/show-summary.sh "$DOMAIN" "$APP_DIR" "$SCRIPT_DIR"
