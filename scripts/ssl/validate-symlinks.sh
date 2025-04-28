
#!/bin/bash
set -e

# Validate and fix broken symlinks
validate_symlinks() {
  local DOMAIN=$1
  echo "Validating certificate symlinks..."
  if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    for file in cert.pem chain.pem fullchain.pem privkey.pem; do
      symlink="/etc/letsencrypt/live/$DOMAIN/$file"
      if [ -L "$symlink" ] && [ ! -e "$symlink" ]; then
        echo "Broken symlink detected: $symlink"
        # Find the newest matching file in archive
        target=$(find /etc/letsencrypt/archive/$DOMAIN -name "$file*" | sort -V | tail -n 1)
        if [ ! -z "$target" ]; then
          echo "Fixing symlink to point to: $target"
          ln -sf "$target" "$symlink"
        else
          echo "Cannot find target for symlink: $symlink"
        fi
      elif [ ! -f "$symlink" ]; then
        echo "Missing certificate file: $symlink"
      fi
    done
  fi
}

# Export the function
validate_symlinks "$1"
