
#!/bin/bash
set -e

# Set up a Redis server for better caching (optional)
if ! command -v redis-server &> /dev/null; then
  echo "Installing Redis for improved caching..."
  apt-get update && apt-get install -y redis-server
  
  # Configure Redis for better performance
  cp /etc/redis/redis.conf /etc/redis/redis.conf.bak
  cat > /etc/redis/redis.conf << EOF
bind 127.0.0.1
port 6379
maxmemory 128mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec
EOF
  
  # Enable and restart Redis
  systemctl enable redis-server
  systemctl restart redis-server
  
  echo "Redis installed and configured for caching."
else
  echo "Redis is already installed."
fi
