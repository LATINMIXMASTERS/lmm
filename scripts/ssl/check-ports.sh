
#!/bin/bash
set -e

# Check if ports 80 and 443 are available
check_ports() {
  echo "Checking if ports are in use..."
  if command -v lsof &> /dev/null; then
    if lsof -i :80 > /dev/null; then
      echo "WARNING: Port 80 is already in use by another process."
      echo "Attempting to free up port 80..."
      # Try to identify and kill the process
      PROC=$(lsof -i :80 -t)
      if [ ! -z "$PROC" ]; then
        echo "Killing process $PROC that's using port 80..."
        kill -15 $PROC || kill -9 $PROC
        sleep 3
      fi
    fi
  else
    apt-get update && apt-get install -y lsof
  fi
}

# Export the function
check_ports
