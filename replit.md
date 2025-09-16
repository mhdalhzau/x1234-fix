# POS SaaS Application

## Overview
This is a Point of Sale (POS) SaaS application with multiple components. The main focus is on the `posapps` directory which contains the full-stack POS application.

## Project Structure

### Main Applications:
1. **POS Apps** (`posapps/`) - Primary SaaS application (Full-stack React + Express)
2. **Customer Dashboard Frontend** (root `/`) - React frontend on port 3000
3. **Customer Dashboard Backend** (`backend/`) - Express API server on port 8000

## Current Setup Status

### Active Application: POS SaaS (`posapps/`)
- **Port**: 5000 (configured for Replit)
- **Frontend**: React with Vite
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL (to be configured)
- **Status**: Running in development mode

### Technology Stack:
- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Express.js, TypeScript, Drizzle ORM
- **Database**: PostgreSQL with Drizzle migrations
- **Build Tool**: Vite with custom configuration for Replit

### Key Features:
- Point of Sale interface
- Product management
- Customer management
- Inventory tracking
- User management
- Store management
- Reports and analytics
- Real-time updates

## Configuration Details

### Server Configuration:
- Serves on `0.0.0.0:5000` (Replit compatible)
- Combined frontend and backend in single service
- Automatic development/production mode switching
- Built-in API logging and error handling

### Database Configuration:
- Uses Drizzle ORM for database operations
- Migration files located in `posapps/migrations/`
- Schema defined in `posapps/shared/schema.ts`

### Workflow:
- Command: `cd posapps && npm run dev`
- Auto-starts on port 5000
- Webview output for user interface

## Dependencies Status:
- ✅ Main dependencies installed for posapps
- ⚠️  Minor vulnerabilities present (non-blocking)
- ✅ Development server running successfully

## Next Steps:
1. Set up PostgreSQL database
2. Run database migrations
3. Configure customer subscription functionality
4. Set up deployment for production

## User Preferences:
- Focus on customer subscription features first
- Deploy SaaS application as priority
- Indonesian language support preferred

## Recent Changes:
- **2025-09-16**: Initial Replit environment setup
- **2025-09-16**: Configured POS SaaS application to run on port 5000
- **2025-09-16**: Installed dependencies and set up workflow