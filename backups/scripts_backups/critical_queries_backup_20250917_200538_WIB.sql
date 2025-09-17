-- ========================================
-- CRITICAL QUERIES BACKUP
-- Generated: 17 September 2025 20:05:38 WIB
-- Purpose: Essential queries for SaaS Dashboard operations
-- ========================================

-- ========================================
-- USER MANAGEMENT QUERIES
-- ========================================

-- Create Superadmin User
INSERT INTO users (id, username, email, password_hash, role, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'superadmin', 
  'admin@system.com',
  '$2a$10$BjGQFR/1b5xPSFaltA2sLeOmnoqh6DCMQczxb.4LMAYNd/b/Hmt0K', -- password: superadmin123
  'superadmin',
  true,
  now(),
  now()
);

-- Create Tenant Owner
INSERT INTO users (id, tenant_id, username, email, password_hash, role, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  $1, -- tenant_id parameter
  $2, -- username parameter  
  $3, -- email parameter
  $4, -- password_hash parameter
  'tenant_owner',
  true,
  now(),
  now()
);

-- ========================================
-- TENANT MANAGEMENT QUERIES
-- ========================================

-- Create New Tenant
INSERT INTO tenants (id, business_name, email, phone, address, status, max_outlets, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  $1, -- business_name
  $2, -- email
  $3, -- phone
  $4, -- address
  'trial',
  1, -- default max outlets
  now(),
  now()
);

-- Activate Tenant Subscription
UPDATE tenants 
SET status = 'active', 
    subscription_id = $1,
    trial_ends_at = now() + interval '30 days',
    updated_at = now()
WHERE id = $2;

-- ========================================
-- SUBSCRIPTION MANAGEMENT QUERIES  
-- ========================================

-- Create Subscription
INSERT INTO subscriptions (id, tenant_id, plan_id, status, start_date, auto_renew, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  $1, -- tenant_id
  $2, -- plan_id
  'active',
  now(),
  true,
  now(), 
  now()
);

-- Cancel Subscription
UPDATE subscriptions 
SET status = 'cancelled',
    end_date = now(),
    auto_renew = false,
    updated_at = now()
WHERE id = $1 AND tenant_id = $2;

-- ========================================
-- MODULE MANAGEMENT QUERIES
-- ========================================

-- Enable Module for Tenant
INSERT INTO tenant_modules (tenant_id, module_id, is_enabled, enabled_at, enabled_by)
VALUES ($1, $2, true, now(), $3)
ON CONFLICT (tenant_id, module_id) 
DO UPDATE SET 
  is_enabled = true,
  enabled_at = now(),
  enabled_by = $3;

-- Disable Module for Tenant
UPDATE tenant_modules 
SET is_enabled = false,
    enabled_at = now(),
    enabled_by = $1
WHERE tenant_id = $2 AND module_id = $3;

-- Get Tenant Active Modules
SELECT m.name, m.display_name, m.description, tm.is_enabled, tm.enabled_at
FROM modules m
LEFT JOIN tenant_modules tm ON m.id = tm.module_id AND tm.tenant_id = $1
WHERE tm.is_enabled = true OR m.is_default = true;

-- ========================================
-- ANALYTICS QUERIES (TENANT-SCOPED)
-- ========================================

-- Get Tenant Subscription Metrics
SELECT 
  COUNT(*) FILTER (WHERE status = 'active') as active_subscriptions,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_subscriptions,
  COUNT(*) FILTER (WHERE status = 'trial') as trial_subscriptions,
  AVG(sp.price) FILTER (WHERE s.status = 'active') as avg_revenue_per_user
FROM subscriptions s
JOIN subscription_plans sp ON s.plan_id = sp.id
WHERE s.tenant_id = $1;

-- Get Tenant User Analytics  
SELECT 
  DATE(created_at) as registration_date,
  COUNT(*) as new_users,
  role as user_role
FROM users 
WHERE tenant_id = $1 
  AND created_at >= $2 -- date_filter
GROUP BY DATE(created_at), role
ORDER BY registration_date DESC;

-- Get Tenant Revenue Trends
SELECT 
  DATE(created_at) as payment_date,
  SUM(amount) as daily_revenue,
  COUNT(*) as transaction_count
FROM billing_history 
WHERE tenant_id = $1 
  AND status = 'paid'
  AND created_at >= $2 -- date_filter
GROUP BY DATE(created_at)
ORDER BY payment_date DESC;

-- ========================================
-- SUPERADMIN ANALYTICS QUERIES (GLOBAL)
-- ========================================

-- Get Global SaaS Metrics
SELECT 
  COUNT(DISTINCT t.id) as total_tenants,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'active') as active_subscriptions,
  COUNT(DISTINCT u.id) as total_users,
  SUM(sp.price) FILTER (WHERE s.status = 'active' AND sp.interval = 'monthly') as monthly_recurring_revenue,
  AVG(sp.price) FILTER (WHERE s.status = 'active') as average_revenue_per_user
FROM tenants t
LEFT JOIN subscriptions s ON t.id = s.tenant_id  
LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
LEFT JOIN users u ON t.id = u.tenant_id;

-- Get Platform Growth Metrics
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as new_tenants,
  SUM(COUNT(*)) OVER (ORDER BY DATE_TRUNC('month', created_at)) as cumulative_tenants
FROM tenants
WHERE created_at >= $1 -- start_date
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month;

-- ========================================
-- DATA CLEANUP QUERIES
-- ========================================

-- Clean Expired Refresh Tokens
DELETE FROM refresh_tokens 
WHERE expires_at < now();

-- Clean Trial Tenants (Older than 30 days)
UPDATE tenants 
SET status = 'expired' 
WHERE status = 'trial' 
  AND trial_ends_at < now()
  AND trial_ends_at IS NOT NULL;

-- ========================================
-- BACKUP & MAINTENANCE QUERIES
-- ========================================

-- Get Database Size Information
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  pg_total_relation_size(schemaname||'.'||tablename) as bytes
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Get Row Counts for All Tables
SELECT 
  'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'tenants', COUNT(*) FROM tenants
UNION ALL  
SELECT 'subscriptions', COUNT(*) FROM subscriptions
UNION ALL
SELECT 'subscription_plans', COUNT(*) FROM subscription_plans
UNION ALL
SELECT 'modules', COUNT(*) FROM modules
UNION ALL
SELECT 'tenant_modules', COUNT(*) FROM tenant_modules
UNION ALL
SELECT 'outlets', COUNT(*) FROM outlets
UNION ALL
SELECT 'billing_history', COUNT(*) FROM billing_history
UNION ALL
SELECT 'refresh_tokens', COUNT(*) FROM refresh_tokens;

-- ========================================
-- SECURITY QUERIES
-- ========================================

-- Check for Duplicate Admin Users
SELECT email, COUNT(*) as count
FROM users 
WHERE role = 'superadmin'
GROUP BY email
HAVING COUNT(*) > 1;

-- Verify Tenant Data Isolation  
SELECT 
  t.id as tenant_id,
  t.business_name,
  COUNT(u.id) as user_count,
  COUNT(s.id) as subscription_count,
  COUNT(o.id) as outlet_count
FROM tenants t
LEFT JOIN users u ON t.id = u.tenant_id
LEFT JOIN subscriptions s ON t.id = s.tenant_id
LEFT JOIN outlets o ON t.id = o.tenant_id
GROUP BY t.id, t.business_name
ORDER BY t.created_at DESC;

-- END OF CRITICAL QUERIES BACKUP
-- Generated: 17 September 2025 20:05:38 WIB