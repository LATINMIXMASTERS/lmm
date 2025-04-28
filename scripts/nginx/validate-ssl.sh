
#!/bin/bash
set -e

# Validate SSL certificate
validate_ssl() {
  local DOMAIN=$1
  
  if [ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
    # Verify certificate files
    if openssl x509 -checkend 0 -noout -in "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"; then
      echo "✓ SSL certificate is valid"
      return 0
    else
      echo "✗ SSL certificate validation failed"
      echo "Certificate might be expired or corrupted."
      return 1
    fi
  else
    echo "Required SSL certificate files not found"
    echo "Using HTTP-only configuration for now"
    return 2
  fi
}

# Export the function
validate_ssl "$1"
