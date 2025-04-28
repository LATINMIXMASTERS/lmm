
#!/bin/bash
set -e

# Check if certificates exist and their validity
check_certificates() {
  local DOMAIN=$1
  echo "Checking SSL certificates for $DOMAIN..."

  if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "SSL certificates for $DOMAIN already exist."
    
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
        return 1  # Certificate was renewed
      else
        echo "Certificate is still valid."
        return 0  # Certificate is valid
      fi
    else
      echo "Certificate files missing. Re-generating certificates..."
      certbot renew --force-renewal --cert-name "$DOMAIN" || {
        echo "Certificate renewal failed. Attempting a fresh certificate..."
        rm -rf /etc/letsencrypt/live/$DOMAIN
        rm -rf /etc/letsencrypt/archive/$DOMAIN
        rm -rf /etc/letsencrypt/renewal/$DOMAIN.conf
        return 2  # Need new certificate
      }
    fi
  else
    echo "No certificates found for $DOMAIN. Generating new certificates..."
    return 2  # Need new certificate
  fi
}

# Export the function so it can be called
check_certificates "$1"
