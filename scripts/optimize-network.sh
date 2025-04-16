
#!/bin/bash
set -e

echo "Optimizing network settings for better synchronization..."

# Decrease TCP connection timeout for faster recovery
sysctl -w net.ipv4.tcp_keepalive_time=60
sysctl -w net.ipv4.tcp_keepalive_intvl=10
sysctl -w net.ipv4.tcp_keepalive_probes=6

# Optimize TCP for low latency applications
sysctl -w net.ipv4.tcp_low_latency=1

# Improve TCP fastopen for quick reconnection
sysctl -w net.ipv4.tcp_fastopen=3

# Increase TCP buffer sizes for better throughput
sysctl -w net.core.rmem_max=16777216
sysctl -w net.core.wmem_max=16777216

# Optimize for web socket connections
sysctl -w net.ipv4.tcp_max_syn_backlog=4096
sysctl -w net.core.somaxconn=4096

# Make changes permanent
cat > /etc/sysctl.d/99-latinmixmasters-sync.conf << EOF
# Latin Mix Masters sync optimization
net.ipv4.tcp_keepalive_time = 60
net.ipv4.tcp_keepalive_intvl = 10
net.ipv4.tcp_keepalive_probes = 6
net.ipv4.tcp_low_latency = 1
net.ipv4.tcp_fastopen = 3
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_max_syn_backlog = 4096
net.core.somaxconn = 4096
EOF

echo "System-level network optimizations applied successfully!"
