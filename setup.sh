#!/bin/bash

# Exit on any error
set -e

echo "🚀 Setting up Roof Inspection Application..."

# Create logs directory for PM2 and Nginx
echo "📁 Creating log directories..."
sudo mkdir -p /var/log/nginx
mkdir -p logs

# Update system and install dependencies
echo "📦 Installing system dependencies..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y nodejs npm nginx

# Create swap file if less than 1GB memory available
if [ $(free -m | awk '/^Mem:/{print $2}') -lt 1024 ]; then
    echo "💾 Creating swap file for low memory system..."
    sudo fallocate -l 1G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Create necessary directories
echo "📁 Creating directories..."
sudo mkdir -p /var/www/html/uploads
sudo chown -R $USER:$USER /var/www/html

# Install project dependencies with increased memory limit
echo "📦 Installing project dependencies..."
export NODE_OPTIONS="--max-old-space-size=512"
npm install --no-audit --no-fund

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗃️ Running database migrations..."
npx prisma migrate deploy

# Seed the database
echo "🌱 Seeding database..."
npm run seed

# Build the frontend
echo "🏗️ Building frontend..."
npm run build

# Configure Nginx
echo "⚙️ Configuring Nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/default
sudo nginx -t && sudo systemctl restart nginx

# Open required ports
echo "🔓 Configuring firewall..."
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw allow 3000/tcp
sudo ufw --force enable

# Set correct permissions
echo "📝 Setting permissions..."
sudo chown -R www-data:www-data /var/www/html/dist
sudo chown -R www-data:www-data /var/www/html/uploads
sudo chmod -R 755 /var/www/html/dist
sudo chmod -R 755 /var/www/html/uploads

# Start the application with PM2
echo "🚀 Starting application..."
pm2 delete roof-inspection-api 2>/dev/null || true
pm2 start ecosystem.config.js --env production

# Save PM2 process list and configure startup
echo "💾 Saving PM2 process list..."
pm2 save

# Configure PM2 to start on boot
echo "⚡ Configuring PM2 startup..."
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER

echo "✅ Setup complete! The application should now be running."
echo "🌐 You can access it at: http://164.92.176.50"
echo ""
echo "To check status:"
echo "- Backend API: curl http://164.92.176.50/api-docs"
echo "- PM2 status: pm2 status"
echo "- Nginx logs: sudo tail -f /var/log/nginx/app-error.log"
echo "- App logs: pm2 logs roof-inspection-api"