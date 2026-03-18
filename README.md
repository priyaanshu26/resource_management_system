# InfraNexis

A modern, professional enterprise-grade Infrastructure & Resource Management Platform built for **Darshan University**. This system streamlines the management of organizational assets, facility bookings, and maintenance tracking through a secure, roles-based portal.

---

## 🎨 Professional Identity
- 🛡️ **Official Branding**: Features a custom-designed geometric logo and a premium Glassmorphism-inspired UI.
- 🔐 **Secure Portal**: Redesigned login experience with high-end aesthetic and radial gradient backgrounds.

## ✨ Core Features
- ✅ **Secure Authentication**: JWT-based session management with role-based access control (ADMIN, EMPLOYEE, STUDENT).
- 🏢 **Operations Hub**: Centralized management for Buildings, Resource Types, and organizational assets.
- 🔧 **Advanced Maintenance Oversight**:
  - Linear status workflow: `SCHEDULED` → `IN_PROGRESS` → `COMPLETED`/`CANCELLED`.
  - **Terminal Locking**: Completed or cancelled repairs are locked to prevent accidental reversals.
  - Role-based visibility for technicians (Employees) and oversight for Administrators.
- 📅 **Intelligent Booking**:
  - Track requests with clear "Created By" user attribution.
  - Transparent approval/rejection workflows for administrative staff.
- 🕒 **Standardized Formatting**: Unified **DD/MM/YYYY** date and 24-hour time representation across the entire system.
- 📊 **Dynamic Dashboard**: Real-time statistics and usage trends for organizational resources.

## 🛠️ Tech Stack
- **Frontend**: Next.js 14+ (App Router), TypeScript, Material UI (MUI).
- **Backend**: Next.js API Routes (Serverless).
- **ORM & Database**: Prisma with PostgreSQL.
- **Security**: BCryptJS for hashing, JWT (jose) for stateless tokens.
- **Utilities**: `date-fns` for global date consistency, `react-hook-form` + `zod` for robust validation.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18.0+
- PostgreSQL Instance

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@ep-morning-resonance-a1wesdx4-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="generate_a_strong_64_character_secret_here"
JWT_EXPIRES_IN="7d"
```

### 3. Installation & Database Sync
```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Launch Development
```bash
npm run dev
```
Portal: [http://localhost:3000](http://localhost:3000)

---

## 👥 Default Accounts (Seeded)
| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@infranexis.com` | `Admin@123` |
| **Employee** | `employee@infranexis.com` | `Employee@123` |
| **Student** | `student@infranexis.com` | `Student@123` |

---

## 📂 Project Structure
- **/app**: Next.js App Router (UI & API endpoints).
- **/components**: Reusable UI parts (Sidebar, Navbar, etc.).
- **/lib**: Core utilities (`formatters.ts`, `AuthContext.tsx`, Prisma Client).
- **/prisma**: Database schema definition and seed data.
- **/public**: Static assets including the official **logo.png**.

---

## 🔜 Future Roadmap
1. 📄 **PDF Reporting**: Direct export of booking and maintenance logs.
2. 🔔 **Notifications**: Real-time alerts for booking approvals.
3. 🗺️ **Floor Mapping**: Interactive visual floor plans for buildings.
4. 📱 **Mobile App**: Dedicated Flutter-based client for field technicians.

---

## 📖 Related Documents
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment instructions.

Developed with ❤️ for **Darshan University**.
