
#!/bin/bash
set -e

# Check DNS resolution for the domain
check_dns() {
  local DOMAIN=$1
  echo "DNS Resolution check for $DOMAIN:"
  dig +short $DOMAIN || echo "DNS lookup failed"
  nslookup $DOMAIN || echo "nslookup failed"

  echo "Testing HTTP connectivity to your domain..."
  curl -s --connect-timeout 5 http://$DOMAIN/ > /dev/null
  CURL_EXIT=$?
  if [ $CURL_EXIT -ne 0 ]; then
    echo "WARNING: Cannot connect to http://$DOMAIN/ (exit code $CURL_EXIT)"
    echo "This may indicate DNS is not properly configured."
    echo "Your domain should resolve to this server: $(curl -s ifconfig.me)"
    return 1
  fi
  return 0
}

# Export the function
check_dns "$1"
