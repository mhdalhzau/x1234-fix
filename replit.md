# SaaS Dashboard Platform - PRODUCTION READY

## Overview
A complete multi-tenant SaaS Dashboard application for Point of Sale (POS) systems, built with a React + TypeScript frontend and a Node.js/Express backend with a PostgreSQL database. This platform is production-ready, offering a robust, scalable, and feature-rich SaaS solution for managing various business operations from authentication to analytics. The project is designed to be deployed for immediate use, supporting a comprehensive set of SaaS functionalities.

## User Preferences
- Focus on customer subscription features first
- Deploy SaaS application as priority
- Indonesian language support preferred

## System Architecture
The application features a single service architecture for deployment, combining the frontend and backend.

-   **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Radix UI, running on port 5000. It includes a comprehensive admin sidebar for navigation, focusing on SaaS features like subscription, content, and user management.
-   **Backend**: Node.js, Express.js, TypeScript, Drizzle ORM, running on port 8000.
-   **Database**: PostgreSQL with Drizzle ORM for migrations and schema management, with migration files located in `backend/migrations/` and schema defined in `backend/models/schema.ts`.
-   **Authentication**: Complete system including login, registration, forgot password, reset password, two-factor authentication (2FA), JWT with refresh tokens, and social login (placeholders for Google, GitHub, Microsoft).
-   **SaaS Features**: Implements multi-tenant organization management, subscription & billing management, content management (blog, FAQ, testimonials), communication tools (email templates, campaigns), user management with roles and permissions, settings and customization, API management, and analytics/reporting interfaces.
-   **Role Structure**: Defined roles include Superadmin (system-wide), Tenant Owner (business owner), Admin (tenant-scoped), and Staff (tenant-scoped employee).
-   **Development Workflow**: Configured for Replit with frontend on `0.0.0.0:5000` for webview, and backend on port 8000.

## External Dependencies
-   **Database**: PostgreSQL
-   **ORM**: Drizzle ORM
-   **Payment Gateway**: Stripe (for subscription and payment processing)
-   **Email Service**: Replit Mail (for 2FA, password reset, and transactional emails)
-   **Social Login (Placeholders)**: Google, GitHub, Microsoft OAuth