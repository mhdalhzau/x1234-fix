-- Database Schema Backup - Customer Dashboard SaaS
-- Generated: 17 September 2025

-- Tenants table - business customers
CREATE TABLE IF NOT EXISTS tenants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name text NOT NULL,
    email varchar(255) NOT NULL UNIQUE,
    phone varchar(20),
    address text,
    status text NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'suspended', 'expired')),
    trial_ends_at timestamp,
    subscription_id uuid,
    max_outlets integer NOT NULL DEFAULT 1,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
);

-- Users table - people within tenants
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid REFERENCES tenants(id),
    username varchar NOT NULL,
    email varchar NOT NULL UNIQUE,
    password_hash text NOT NULL,
    role text NOT NULL DEFAULT 'staff' CHECK (role IN ('superadmin', 'tenant_owner', 'staff')),
    is_active boolean NOT NULL DEFAULT true,
    last_login_at timestamp,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
);

-- Outlets table - stores/locations per tenant
CREATE TABLE IF NOT EXISTS outlets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    name text NOT NULL,
    address text,
    phone varchar(20),
    is_active boolean NOT NULL DEFAULT true,
    created_by uuid NOT NULL REFERENCES users(id),
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
);

-- Subscription plans
CREATE TABLE IF NOT EXISTS subscription_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    currency text NOT NULL DEFAULT 'IDR',
    "interval" text NOT NULL DEFAULT 'monthly' CHECK ("interval" IN ('monthly', 'yearly')),
    max_outlets integer NOT NULL DEFAULT 1,
    max_users integer NOT NULL DEFAULT 5,
    features text[] NOT NULL DEFAULT '{}',
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp NOT NULL DEFAULT now()
);

-- Tenant subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    plan_id uuid NOT NULL REFERENCES subscription_plans(id),
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
    start_date timestamp NOT NULL DEFAULT now(),
    end_date timestamp NOT NULL,
    auto_renew boolean NOT NULL DEFAULT true,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
);

-- Available modules/features
CREATE TABLE IF NOT EXISTS modules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    display_name text NOT NULL,
    description text,
    is_default boolean NOT NULL DEFAULT false,
    created_at timestamp NOT NULL DEFAULT now()
);

-- Tenant modules - which modules are enabled for each tenant
CREATE TABLE IF NOT EXISTS tenant_modules (
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    module_id uuid NOT NULL REFERENCES modules(id),
    is_enabled boolean NOT NULL DEFAULT true,
    enabled_at timestamp NOT NULL DEFAULT now(),
    enabled_by uuid NOT NULL REFERENCES users(id),
    PRIMARY KEY (tenant_id, module_id)
);

-- Billing history
CREATE TABLE IF NOT EXISTS billing_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    subscription_id uuid REFERENCES subscriptions(id),
    amount numeric(10,2) NOT NULL,
    currency text NOT NULL DEFAULT 'IDR',
    payment_method text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
    paid_at timestamp,
    description text,
    created_at timestamp NOT NULL DEFAULT now()
);

-- Refresh tokens for JWT auth
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id),
    token text NOT NULL UNIQUE,
    expires_at timestamp NOT NULL,
    created_at timestamp NOT NULL DEFAULT now()
);