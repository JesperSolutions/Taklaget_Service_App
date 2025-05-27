# Roof Inspection Reports API

A Node.js Express application for managing roof inspection reports with multi-company support.

## Features

- Multi-company support under a parent group structure
- Comprehensive inspection report management
- Image upload and attachment functionality
- RESTful API with versioning and Swagger documentation
- SQLite or PostgreSQL database support via Prisma ORM
- Input validation and error handling
- API token authentication
- GDPR-compliant customer data handling

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (optional, can use SQLite instead)

## Important Note

This project requires specific versions of Prisma to ensure stability:
- @prisma/client: 5.14.0
- prisma: 5.14.0

## Quick Start

1. Clone the repository and install dependencies:
```bash
git clone https://github.com/your-username/roof-inspection-api.git
cd roof-inspection-api
npm install
```

2. Set up environment:
```bash
cp .env.example .env
```
Edit the `.env` file to configure your database and other settings.

3. Initialize database:
```bash
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run seed        # Seed sample data
```

4. Start development servers:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api-docs

## Production Deployment

### Server Requirements

- Ubuntu 20.04 or higher
- Node.js 20.x
- Nginx
- PM2 (installed globally)
- Let's Encrypt SSL (recommended)

### Automated Setup

Run the setup script:
```bash
chmod +x setup.sh
./setup.sh
```

The script will:
1. Update system packages
2. Install Node.js, Nginx, and PM2
3. Configure project directories and permissions
4. Set up the database
5. Build the frontend
6. Configure Nginx
7. Start the application with PM2

### Manual Setup Steps

1. Install required software:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2
```

2. Set up project:
```bash
# Create project directory
sudo mkdir -p /var/www/html
cd /var/www/html

# Clone repository
git clone <your-repo-url> .

# Install dependencies
npm install

# Build the frontend
npm run build

# Create uploads directory
sudo mkdir -p uploads
sudo chown -R $USER:$USER uploads
```

3. Configure firewall:
```bash
# Allow HTTP, HTTPS, SSH and API ports
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw allow 3000/tcp  # Required for direct API access
sudo ufw enable
```

4. Configure Nginx:
```bash
# Copy nginx config
sudo cp nginx.conf /etc/nginx/sites-available/default
sudo nginx -t
sudo systemctl restart nginx
```

5. Set up SSL (recommended):
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

6. Start application:
```bash
npm run pm2:start
```

### Security Considerations

1. File Permissions:
```bash
sudo chown -R $USER:$USER /var/www/html
sudo chmod -R 755 /var/www/html
```

2. Environment Variables:
- Use strong secrets for API tokens
- Configure proper database credentials
- Set NODE_ENV to 'production'

3. Database Backups:
- Set up regular database backups
- Store backups in a secure location
- Test backup restoration regularly

## Troubleshooting

### Common Issues

1. Port 3000 already in use:
```bash
# Check what's using port 3000
sudo lsof -i :3000

# Kill the process if needed
sudo kill <PID>
```

2. PM2 Issues:
```bash
# View logs
pm2 logs

# Check status
pm2 status

# Restart application
pm2 restart all
```

3. Nginx Issues:
```bash
# Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test nginx config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

4. Permission Issues:
```bash
# Fix uploads directory permissions
sudo chown -R www-data:www-data uploads/
sudo chmod -R 755 uploads/

# Fix nginx access
sudo chown -R www-data:www-data /var/www/html/dist
```

5. Database Connection:
- Verify credentials in .env
- Check database service status
- Ensure database port is accessible

### Prisma Issues

If you encounter Prisma-related errors:

1. Ensure correct versions:
```bash
npm install @prisma/client@5.14.0 prisma@5.14.0
```

2. Regenerate client:
```bash
npx prisma generate
```

## API Documentation

Access the Swagger documentation at:
```
http://your-domain.com/api-docs
```

## API Authentication

All API endpoints require an API token in the `x-api-token` header.

Format: `companyCode:inspectorCode`

Demo tokens:
- `ABC:INS-001-ABC` - ABC Roofing company with Inspector John Doe
- `XYZ:INS-001-XYZ` - XYZ Contractors company with Inspector John Doe

## Project Structure

```
/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.js            # Database seeding script
├── src/
│   ├── components/        # React components
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Custom middleware
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── app.js           # Express application setup
│   └── server.js        # Server entry point
├── uploads/             # Uploaded files storage
├── .env                # Environment variables
├── .env.example        # Example environment variables
└── package.json        # Project dependencies
```

## API Endpoints

### Reports
- `GET /api/v1/reports` - Get all reports (paginated)
- `GET /api/v1/reports/:id` - Get report by ID
- `GET /api/v1/reports/code/:code` - Get report by code
- `POST /api/v1/reports` - Create a new report
- `PUT /api/v1/reports/:id` - Update a report
- `DELETE /api/v1/reports/:id` - Delete a report

### Images
- `POST /api/v1/reports/:reportId/images` - Upload images to a report
- `GET /api/v1/reports/:reportId/images` - Get all images for a report
- `DELETE /api/v1/reports/images/:imageId` - Delete an image

### Company
- `GET /api/v1/company` - Get company information
- `GET /api/v1/company/inspectors` - Get all inspectors for the company
- `GET /api/v1/company/departments` - Get all departments for the company

## License

MIT