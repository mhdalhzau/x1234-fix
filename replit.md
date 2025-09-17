# SaaS Dashboard Platform - PRODUCTION READY

## Overview
A complete multi-tenant SaaS Dashboard application for Point of Sale (POS) systems. This platform is built with a React + TypeScript frontend and a Node.js/Express backend with a PostgreSQL database. It is production-ready for deployment. The project aims to provide a robust, scalable, and feature-rich SaaS solution capable of managing various business operations from authentication to analytics.

## User Preferences
- Focus on customer subscription features first
- Deploy SaaS application as priority
- Indonesian language support preferred

## System Architecture
The application features a single service architecture for deployment, combining the frontend and backend.
-   **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Radix UI, running on port 5000.
-   **Backend**: Node.js, Express.js, TypeScript, Drizzle ORM, running on port 8000.
-   **Database**: PostgreSQL with Drizzle ORM for migrations and schema management, located in `backend/migrations/` and `backend/models/schema.ts` respectively.
-   **UI/UX**: Comprehensive admin sidebar for navigation, with a focus on SaaS features like subscription, content, and user management.
-   **Authentication**: Complete system including login, registration, forgot password, reset password, 2FA, JWT with refresh tokens, and social login placeholders.
-   **SaaS Features**: Implements multi-tenant organization management, subscription & billing management, content management (blog, FAQ, testimonials), communication tools (email templates, campaigns), user management with roles and permissions, settings and customization, API management, and analytics/reporting interfaces.
-   **Role Structure**: Defined roles include Superadmin (system-wide), Tenant Owner (business owner), Admin (tenant-scoped), and Staff (tenant-scoped employee).
-   **Development Workflow**: `npm run dev` for frontend (port 5000) and `cd backend && npm run dev` for backend (port 8000). Configured for Replit with `0.0.0.0:5000` for webview.

## External Dependencies
-   **Database**: PostgreSQL
-   **ORM**: Drizzle ORM
-   **Payment Gateway**: Stripe (for subscription and payment processing)
-   **Email Service**: Replit Mail (for 2FA, password reset, and transactional emails)
-   **Social Login (Placeholders)**: Google, GitHub, Microsoft OAuth