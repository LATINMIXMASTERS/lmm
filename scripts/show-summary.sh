
#!/bin/bash
set -e

# Determine server IP
SERVER_IP=$(hostname -I | awk '{print $1}')

echo "=== Installation Complete ==="
echo "Your Latin Mix Masters application is now installed and running!"
echo "Access your application at http://$SERVER_IP"
echo ""
echo "Useful commands:"
echo "  pm2 status                  - Check application status"
echo "  pm2 logs latinmixmasters    - View application logs"
echo "  pm2 restart latinmixmasters - Restart the application"
echo "  ./update.sh                 - Update the application"

# Optional: Setup SSL with Certbot
echo ""
echo "To secure your site with HTTPS, you can run:"
echo "sudo apt install -y certbot python3-certbot-nginx"
echo "sudo certbot --nginx -d yourdomain.com"
