
#!/bin/bash
set -e

# Validate and display certificate information
validate_certificate() {
  local DOMAIN=$1
  if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo -e "\nCertificate information for $DOMAIN:"
    openssl x509 -in "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" -text -noout | grep -E 'Subject:|Issuer:|Not Before:|Not After :'
    
    # Output success message with next steps
    echo -e "\n=== SSL Setup Complete ==="
    echo -e "Certificate is installed for: $DOMAIN"
    echo -e "Certificate will auto-renew via Certbot's systemd timer."
    echo -e "You can now test your site at https://$DOMAIN"
    echo -e "Run the diagnose script if you encounter issues:"
    echo -e "  ./scripts/diagnose-nginx.sh"
    return 0
  else
    echo -e "\nWARNING: Certificate file not found at /etc/letsencrypt/live/$DOMAIN/fullchain.pem"
    echo -e "Something may have gone wrong with the certificate generation process."
    echo -e "Run the diagnose script to fix the problem:"
    echo -e "  ./scripts/diagnose-nginx.sh"
    return 1
  fi
}

# Export the function
validate_certificate "$1"
