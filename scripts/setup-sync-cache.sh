
#!/bin/bash
set -e

echo "Setting up sync cache maintenance..."

# Create a sync cache directory if it doesn't exist
mkdir -p .sync-cache

# Create a script to clear old sync files periodically
cat > sync-maintenance.sh << EOF
#!/bin/bash
# Remove sync files older than 1 hour
find .sync-cache -type f -mmin +60 -delete
echo "Cleaned up old sync files at \$(date)"
EOF

chmod +x sync-maintenance.sh

# Add a cron job to run maintenance
(crontab -l 2>/dev/null || true; echo "0 * * * * \$(pwd)/sync-maintenance.sh >> \$(pwd)/logs/sync-maintenance.log 2>&1") | crontab -

echo "Sync cache maintenance configured successfully"
