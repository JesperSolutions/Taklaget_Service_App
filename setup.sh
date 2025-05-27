#!/bin/bash

# Exit on any error
set -e

echo "🚀 Setting up Roof Inspection Application..."

# Update system and install dependencies
echo "📦 Installing system dependencies..."
sudo apt update
sudo apt install -y nodejs npm nginx

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Create necessary directories
echo "📁 Creating directories..."
sudo mkdir -p /var/www/html/uploads
sudo chown -R $USER:$USER /var/www/html
sudo chmod -R 755 /var/www/html

# Install project dependencies
echo "📦 Installing project dependencies..."
npm install

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗃️ Running database migrations..."
npx prisma migrate deploy

# Build the frontend
echo "🏗️ Building frontend..."
npm run build

# Configure Nginx
echo "⚙️ Configuring Nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/default
sudo nginx -t && sudo systemctl restart nginx

# Start the application with PM2
echo "🚀 Starting application..."
pm2 start ecosystem.config.js --env production

# Save PM2 process list and configure startup
echo "💾 Saving PM2 process list..."
pm2 save

# Configure PM2 to start on boot
echo "⚡ Configuring PM2 startup..."
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER

echo "✅ Setup complete! The application should now be running."
echo "🌐 You can access it at: http://your-server-ip"