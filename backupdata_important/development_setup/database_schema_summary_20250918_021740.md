# Database Schema Summary
**Backup Date:** 2025-09-18 02:17:40  
**Environment:** Development  

## Complete Table Structure (14 Tables)

### 🏢 **Core Business Tables**

#### 1. `tenants` - Business Customers
- **Purpose**: Store business customer information
- **Key Fields**: business_name, email, status, stripe_customer_id
- **Status Types**: trial, active, suspended, expired
- **Features**: Auto-generated UUID, Stripe integration

#### 2. `users` - System Users  
- **Purpose**: All users in the system (superadmin, owners, staff)
- **Key Fields**: username, email, password_hash, role, tenant_id
- **Roles**: superadmin, tenant_owner, staff
- **Multi-tenancy**: Users belong to tenants via tenant_id

#### 3. `outlets` - Business Locations
- **Purpose**: Physical stores/locations per tenant
- **Key Fields**: name, address, phone, tenant_id
- **Features**: Multi-outlet support per tenant

### 💳 **Subscription & Billing Tables**

#### 4. `subscription_plans` - Available Plans
- **Purpose**: Define subscription packages (Basic, Pro, Enterprise)
- **Key Fields**: name, price, currency, interval, max_outlets, max_users
- **Features**: Feature arrays, pricing flexibility

#### 5. `subscriptions` - Active Subscriptions  
- **Purpose**: Link tenants to their subscription plans
- **Key Fields**: tenant_id, plan_id, stripe_subscription_id, status
- **Status Types**: active, expired, cancelled, pending

#### 6. `billing_history` - Payment Records
- **Purpose**: Track all payment transactions
- **Key Fields**: amount, currency, payment_method, status, stripe_invoice_id
- **Status Types**: pending, paid, failed, refunded

### 🔧 **System Management Tables**

#### 7. `modules` - Available Features
- **Purpose**: System features/modules (POS, inventory, reports)
- **Key Fields**: name, display_name, description, is_default

#### 8. `tenant_modules` - Enabled Features
- **Purpose**: Track which modules are enabled per tenant
- **Key Fields**: tenant_id, module_id, is_enabled
- **Features**: Granular feature control per tenant

#### 9. `refresh_tokens` - Authentication
- **Purpose**: JWT refresh token management
- **Key Fields**: user_id, token, expires_at
- **Security**: Secure session management

### 📝 **Content Management Tables**

#### 10. `blog_posts` - Blog System
- **Purpose**: Content marketing and blog management
- **Key Fields**: title, content, author, status, category
- **Status Types**: draft, published, scheduled
- **Features**: View tracking, tags, categories

#### 11. `faqs` - Help Center
- **Purpose**: Frequently asked questions
- **Key Fields**: question, answer, category, is_published
- **Features**: View tracking, ordering, categorization

#### 12. `testimonials` - Customer Reviews
- **Purpose**: Customer testimonials and reviews
- **Key Fields**: customer_name, testimonial, rating, is_featured
- **Features**: Rating system, featured testimonials

#### 13. `roadmap_features` - Product Roadmap
- **Purpose**: Product development planning
- **Key Fields**: title, description, status, priority
- **Status Types**: planned, in_progress, completed, cancelled
- **Priority Levels**: low, medium, high, critical

#### 14. `feature_votes` - Community Voting
- **Purpose**: Feature voting system
- **Key Fields**: feature_id, user_id, ip_address
- **Features**: Anonymous voting, abuse prevention

## Database Features

### 🔑 **Primary Keys**
- All tables use UUID primary keys (`gen_random_uuid()`)
- Provides better security and distribution

### 🔗 **Relationships**
- **Tenants** → Users (1:many)
- **Tenants** → Outlets (1:many)  
- **Tenants** → Subscriptions (1:many)
- **Users** → Content (1:many for all content tables)

### 📊 **Multi-Tenancy**
- Complete tenant isolation via `tenant_id`
- Role-based access: superadmin → tenant_owner → staff
- Secure data separation per business

### 🎯 **Key Features**
- **SaaS-Ready**: Multi-tenant architecture
- **Subscription Management**: Stripe integration
- **Content Management**: Blog, FAQ, testimonials
- **Feature Management**: Modular system
- **Audit Trail**: Created/updated timestamps
- **Security**: JWT refresh tokens, role-based access

## Test Data Available
- **Superadmin**: admin@system.com (system-wide access)
- **Tenant Owner**: admin@owner.com (Test Business)
- **Staff**: admin@staff.com (under Test Business)
- **Subscription Plans**: Basic, Pro, Enterprise tiers
- **Modules**: POS, Inventory, Reports, Analytics