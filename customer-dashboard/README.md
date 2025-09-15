# Customer Dashboard SaaS

A complete multi-tenant SaaS application for Point of Sale (POS) system customers. Built with Node.js, Express, React, TypeScript, and PostgreSQL.

## Features

### Multi-Tenant System
- **Tenants**: Business customers with status (trial, active, suspended, expired)
- **Users**: Role-based access (owner, manager, staff)
- **Outlets**: Multiple store locations per tenant (limited by subscription)
- **Subscriptions**: Flexible pricing plans (Basic, Pro, Enterprise)
- **Modules**: Feature toggles (POS, inventory, reports, loyalty)
- **Billing**: Payment history and subscription management

### Authentication & Security
- JWT access tokens + refresh tokens
- Role-based access control (RBAC)
- Secure password hashing with bcrypt
- Session management with automatic token refresh

### Admin Panel
- Superadmin can manage all tenants
- Suspend/activate tenant accounts
- Monitor system-wide statistics
- View tenant usage and billing

## Tech Stack

### Backend
- **Runtime**: Node.js + Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Authentication**: JWT + bcryptjs
- **Validation**: Zod schemas

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Icons**: Lucide React

## Project Structure

```
customer-dashboard/
├── backend/                 # Node.js + Express API
│   ├── models/             # Database schema (Drizzle)
│   ├── routes/             # API route handlers
│   ├── middleware/         # Auth & RBAC middleware
│   ├── utils/              # JWT, password, email utilities
│   ├── scripts/            # Database seeding scripts
│   └── server.ts           # Express server entry point
├── frontend/               # React + Vite app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── App.tsx         # Main app component
│   ├── index.html          # HTML template
│   └── vite.config.ts      # Vite configuration
├── drizzle.config.ts       # Database configuration
├── package.json            # Root package configuration
└── .env                    # Environment variables
```

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database

### 1. Environment Setup
```bash
cd customer-dashboard
cp .env.example .env
```

Edit `.env` with your database credentials:
```
DATABASE_URL=postgresql://username:password@localhost:5432/your_database
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
PORT=8000
FRONTEND_URL=http://localhost:3000
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
cd ..
```

### 3. Database Setup
```bash
# Generate and push database schema
npm run db:push

# Seed initial data (subscription plans & modules)
npm run seed
```

### 4. Run Development Servers
```bash
# Start both backend and frontend concurrently
npm run dev

# Or run separately:
npm run dev:backend    # Backend on http://localhost:8000
npm run dev:frontend   # Frontend on http://localhost:3000
```

## Usage

### 1. Register Your Business
- Visit http://localhost:3000
- Click "Register your business for free"
- Fill in business and owner information
- Get 30-day trial automatically

### 2. Explore Features
- **Dashboard**: Overview of outlets, users, and subscription
- **Outlets**: Add and manage store locations
- **Billing**: View subscription plans and payment history
- **Admin Panel**: Access with admin@example.com (superadmin)

### 3. Test Subscription System
- Go to Billing page
- Select different subscription plans
- View usage limits and features
- Monitor payment history

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new tenant
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Tenants
- `GET /api/tenants/me` - Get current tenant info
- `PUT /api/tenants/me` - Update tenant info
- `GET /api/tenants/modules` - Get tenant modules
- `POST /api/tenants/modules/toggle` - Toggle module

### Outlets
- `GET /api/outlets` - List tenant outlets
- `POST /api/outlets` - Create new outlet
- `PUT /api/outlets/:id` - Update outlet
- `DELETE /api/outlets/:id` - Delete outlet

### Subscriptions
- `GET /api/subscriptions/current` - Get active subscription
- `GET /api/subscriptions/plans` - List available plans
- `POST /api/subscriptions/subscribe` - Subscribe to plan
- `GET /api/subscriptions/billing` - Get billing history

### Admin (Superadmin only)
- `GET /api/tenants/admin/all` - List all tenants
- `PUT /api/tenants/admin/:id/status` - Update tenant status

## Database Schema

### Core Tables
- `tenants` - Business customers
- `users` - People within tenants
- `outlets` - Store locations
- `subscription_plans` - Available pricing plans
- `subscriptions` - Active tenant subscriptions
- `modules` - Feature toggles
- `tenant_modules` - Enabled features per tenant
- `billing_history` - Payment records
- `refresh_tokens` - JWT refresh tokens

## Development

### Available Scripts
- `npm run dev` - Start both servers
- `npm run build` - Build both apps for production
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push schema to database
- `npm run seed` - Seed initial data

### Testing Flow
1. Register new business
2. Log in as owner
3. Add outlets (respecting subscription limits)
4. Upgrade subscription plan
5. Toggle feature modules
6. View billing history
7. Test admin panel (admin@example.com)

## Production Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Set all required environment variables:
- `DATABASE_URL` - Production PostgreSQL URL
- `JWT_SECRET` - Strong JWT secret
- `JWT_REFRESH_SECRET` - Strong refresh secret
- `NODE_ENV=production`
- `FRONTEND_URL` - Production frontend URL

### Database Migration
```bash
npm run db:push
npm run seed
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes following existing patterns
4. Test thoroughly
5. Submit pull request

## License

MIT License