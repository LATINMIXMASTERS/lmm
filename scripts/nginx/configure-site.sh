
#!/bin/bash
set -e

# Configure and enable Nginx site
configure_site() {
  echo "Setting up Nginx site configuration..."
  
  # Enable site and remove default site
  ln -sf /etc/nginx/sites-available/latinmixmasters /etc/nginx/sites-enabled/
  rm -f /etc/nginx/sites-enabled/default
}

# Export the function
configure_site
