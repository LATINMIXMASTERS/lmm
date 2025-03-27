
#!/bin/bash
# Make all scripts executable
chmod +x install.sh
chmod +x deploy-from-github.sh

echo "=== Setup Complete ==="
echo "Installation scripts are now executable."
echo ""
echo "QUICK DEPLOYMENT INSTRUCTIONS:"
echo "-------------------------------"
echo "1. Deploy from GitHub: ./deploy-from-github.sh username@your-server-ip your-github-repo-url"
echo "   Example: ./deploy-from-github.sh root@123.456.789.10 https://github.com/yourusername/latinmixmasters.git"
echo ""
echo "2. Connect to your server: ssh username@your-server-ip"
echo "3. Run the installation: cd /var/www/latinmixmasters && ./install.sh"
echo ""
echo "The optimized scripts will provide maximum performance on your VPS."
