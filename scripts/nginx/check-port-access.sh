
#!/bin/bash
set -e

# Check if port 80 is accessible
check_port_access() {
  echo "Checking if port 80 is accessible..."
  
  if command -v curl &> /dev/null; then
    HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost)
    if [ "$HTTP_RESPONSE" = "200" ] || [ "$HTTP_RESPONSE" = "404" ]; then
      echo "✓ Port 80 is accessible (HTTP status: $HTTP_RESPONSE)"
    else
      echo "⚠️ HTTP check failed (status: $HTTP_RESPONSE)"
    fi
  else
    apt-get update && apt-get install -y curl
    echo "Curl installed for HTTP checks"
  fi
}

# Export the function
check_port_access
