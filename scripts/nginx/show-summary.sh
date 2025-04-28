
#!/bin/bash
set -e

# Show setup summary
show_summary() {
  local DOMAIN=$1
  local APP_DIR=$2
  local SCRIPT_DIR=$3
  
  echo "======================================================"
  echo "Nginx setup completed. Configuration:"
  echo "Domain: $DOMAIN"
  echo "App Directory: $APP_DIR"
  echo "SSL Status: $([ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ] && echo "Installed" || echo "Not installed")"
  echo "To troubleshoot issues, run: $SCRIPT_DIR/diagnose-nginx.sh"
  echo "======================================================"
}

# Export the function
show_summary "$1" "$2" "$3"
