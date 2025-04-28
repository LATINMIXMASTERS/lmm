
#!/bin/bash
set -e

# Fix certificate permissions
fix_permissions() {
  echo "Setting proper permissions for SSL certificates..."
  mkdir -p /etc/letsencrypt/live
  mkdir -p /etc/letsencrypt/archive
  chmod -R 755 /etc/letsencrypt/live
  chmod -R 755 /etc/letsencrypt/archive
}

# Export the function
fix_permissions
