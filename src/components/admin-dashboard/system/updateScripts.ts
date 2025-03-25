
// VPS update script templates for different server setups
export const updateScripts = {
  standard: `#!/bin/bash
# Backup current version
timestamp=$(date +"%Y%m%d_%H%M%S")
mkdir -p /var/backups/latinmixmasters
tar -czf /var/backups/latinmixmasters/backup_$timestamp.tar.gz .

# Pull latest code
git pull

# Install dependencies with higher memory limit
export NODE_OPTIONS=--max_old_space_size=4096
npm install --legacy-peer-deps

# Build the application with higher memory limit
npm run build

# Fix permissions
chown -R www-data:www-data dist

# Restart the service
systemctl restart latinmixmasters
echo "System update completed at $(date)"
`,

  pm2: `#!/bin/bash
# Backup current version
timestamp=$(date +"%Y%m%d_%H%M%S")
mkdir -p /var/backups/latinmixmasters
tar -czf /var/backups/latinmixmasters/backup_$timestamp.tar.gz .

# Pull latest code
git pull

# Install dependencies with higher memory limit
export NODE_OPTIONS=--max_old_space_size=4096
npm install --legacy-peer-deps

# Build the application with higher memory limit
npm run build

# Fix permissions if needed
chown -R www-data:www-data dist

# Restart with PM2
pm2 restart latinmixmasters
echo "System update completed at $(date)"
`
};

// Helper function to copy script to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy: ", error);
    return false;
  }
};
