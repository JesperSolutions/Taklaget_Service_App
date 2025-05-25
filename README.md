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

## Installation

1. Clone the repository

```bash
git clone https://github.com/your-username/roof-inspection-api.git
cd roof-inspection-api
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env
```

Edit the `.env` file to configure your database and other settings.

4. Generate Prisma client

```bash
npm run db:generate
```

5. Run database migrations

```bash
npm run db:migrate
```

6. Seed the database with sample data

```bash
npm run seed
```

## Running the Application

### Development Mode

Start the backend API:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api-docs

### Production Mode

```bash
npm start
```

## API Documentation

Access the Swagger documentation at:
```
http://localhost:3000/api-docs
```

## Database Management

- View and manage database using Prisma Studio:
```bash
npm run db:studio
```

- Create new migrations after schema changes:
```bash
npm run db:migrate
```

## API Authentication

All API endpoints require an API token to be included in the `x-api-token` header.

Format: `companyCode:inspectorCode`

For development, use one of these demo tokens:
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

## Troubleshooting

If you encounter Prisma-related errors:

1. Ensure you're using the correct Prisma versions:
```bash
npm install @prisma/client@5.14.0 prisma@5.14.0
```

2. Regenerate the Prisma client:
```bash
npx prisma generate
```

## Future Extensions

The application is designed to be extensible for future enhancements:
- User authentication and authorization
- Role-based access control
- Cloud storage integration for images
- Report templating and PDF generation
- Mobile application integration
- Notification system for report status changes

## License

MIT