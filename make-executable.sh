
#!/bin/bash
# Make all scripts executable
chmod +x update.sh
chmod +x scripts/*.sh

echo "=== Setup Complete ==="
echo "All scripts are now executable."
echo ""
echo "To update your application, run:"
echo "./update.sh"
echo ""
echo "If you're still having permission issues, run:"
echo "sudo chmod +x update.sh"
echo "sudo ./update.sh"
