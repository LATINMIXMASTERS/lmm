
// VPS update script templates for different server setups
export const updateScripts = {
  standard: `#!/bin/bash
# Backup current version
timestamp=$(date +"%Y%m%d_%H%M%S")
mkdir -p /var/backups/latinmixmasters
tar -czf /var/backups/latinmixmasters/backup_$timestamp.tar.gz .

# Pull latest code
git pull

# Install dependencies
export NODE_OPTIONS=--max_old_space_size=4096
npm install --legacy-peer-deps

# Build the application
npm run build

# Restart the service
systemctl restart latinmixmasters`,

  pm2: `#!/bin/bash
# Backup current version
timestamp=$(date +"%Y%m%d_%H%M%S")
mkdir -p /var/backups/latinmixmasters
tar -czf /var/backups/latinmixmasters/backup_$timestamp.tar.gz .

# Pull latest code
git pull

# Install dependencies
npm install --legacy-peer-deps

# Build the application
npm run build

# Restart with PM2
pm2 restart latinmixmasters`
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
