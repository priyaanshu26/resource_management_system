# Resource Management System (RMS)

A comprehensive web application for managing organizational resources including classrooms, labs, auditoriums, and facilities with booking, approval workflows, and maintenance tracking.

## Features

- ✅ **JWT-based Authentication** with role-based access control (Admin, Employee, Student)
- ✅ **Resource Management** - Manage different types of resources organized by buildings and floors
- 📋 **Booking System** - Request and manage resource bookings with approval workflows
- 🔧 **Maintenance Tracking** - Schedule and track maintenance activities
- 📊 **Dashboard & Reports** - View usage statistics and generate reports
- 🗄️ **Storage Management** - Track cupboards and shelves within resources

## Tech Stack

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT (jsonwebtoken) with bcrypt for password hashing

## Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database (local or hosted)

## Installation

### 1. Clone and Install Dependencies

```bash
cd rms
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory (use `.env.example` as reference):

```env
# Database - Update with your PostgreSQL credentials
DATABASE_URL="postgresql://username:password@localhost:5432/rms_db?schema=public"

# JWT Authentication - CHANGE IN PRODUCTION
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-minimum-32-characters"
JWT_EXPIRES_IN="7d"

# Default Admin Credentials - CHANGE AFTER FIRST LOGIN
DEFAULT_ADMIN_EMAIL="admin@rms.com"
DEFAULT_ADMIN_PASSWORD="Admin@123"
```

**Important:** 
- Replace `username`, `password`, and `rms_db` with your PostgreSQL credentials
- Generate a strong random string for `JWT_SECRET` in production
- Change the default admin password after first login

### 3. Set Up the Database

```bash
# Generate Prisma Client
npm run db:generate

# Push the schema to your database (creates tables)
npm run db:push

# Seed the database with initial data
npm run db:seed
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Credentials

After running the seed script, you can log in with these accounts:

- **Admin:**
  - Email: `admin@rms.com`
  - Password: `Admin@123`

- **Employee:**
  - Email: `employee@rms.com`
  - Password: `Employee@123`

- **Student:**
  - Email: `student@rms.com`
  - Password: `Student@123`

## Project Structure

```
rms/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   └── auth/            # Authentication endpoints
│   ├── login/               # Login page
│   ├── register/            # Registration page
│   ├── dashboard/           # Dashboard page
│   ├── admin/               # Admin panel (to be implemented)
│   └── bookings/            # Booking pages (to be implemented)
├── lib/                     # Utility functions
│   ├── auth.ts             # JWT authentication utilities
│   └── prisma.ts           # Prisma client instance
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Database seeding script
└── middleware.ts           # Route protection middleware
```

## Database Schema

The system includes the following main models:

- **User** - System users (Admin, Employee, Student)
- **ResourceType** - Categories of resources (Classroom, Lab, etc.)
- **Building** - Physical buildings housing resources
- **Resource** - Individual resources that can be booked
- **Facility** - Amenities available with resources
- **Booking** - Resource reservation requests
- **Maintenance** - Maintenance schedules and records
- **Cupboard** & **Shelf** - Storage organization within resources

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed database with initial data
- `npm run db:studio` - Open Prisma Studio (database GUI)

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Admin Panel (To be implemented)
- Resource Types CRUD
- Buildings CRUD
- Resources CRUD
- Users Management
- Maintenance Management

### Bookings (To be implemented)
- Create booking
- View bookings
- Approve/reject bookings

## Next Steps

The following features are planned for implementation:

1. **Admin Panel** - Complete CRUD operations for all resources
2. **Booking System** - Full booking workflow with availability checking
3. **Maintenance Module** - Schedule and track maintenance
4. **Reports** - Generate usage and analysis reports
5. **Dashboard Enhancements** - Real-time statistics and charts

## Development Notes

- The application uses JWT tokens stored in HTTP-only cookies for security
- Middleware protects routes based on authentication and user roles
- All passwords are hashed using bcrypt before storage
- Prisma handles all database operations with type safety

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify DATABASE_URL in .env is correct
- Check that the database exists

### Prisma Issues
```bash
# Reset and regenerate
npm run db:generate
npm run db:push
```

### Authentication Issues
- Clear browser cookies and localStorage
- Check JWT_SECRET is set in .env
- Verify token expiration settings

## License

This project is for educational/organizational use.
