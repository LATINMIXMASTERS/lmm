
#!/bin/bash
set -e

# Setup automatic renewal with cron
setup_renewal() {
  # Create a cron job for renewal if it doesn't exist already
  if ! crontab -l 2>/dev/null | grep -q "certbot renew"; then
    (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && systemctl reload nginx") | crontab -
    echo "Added automatic certificate renewal cron job"
  fi
}

# Export the function
setup_renewal
