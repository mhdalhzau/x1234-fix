-- COMPLETE DATABASE BACKUP EXPORT for 20250917_200538_WIB
-- SaaS Dashboard Platform - PostgreSQL Database Backup  
-- Generated on: 17 September 2025 20:05:38 WIB
-- Database: heliumdb (PostgreSQL 16.9)
-- Total Tables: 9 | Total Records: 15

-- DATABASE SUMMARY:
-- - Users: 1 record (superadmin)
-- - Tenants: 0 records  
-- - Subscription Plans: 6 records (Basic, Pro, Enterprise x2 each)
-- - Subscriptions: 0 records
-- - Modules: 8 records (POS, Inventory, Reports, Loyalty x2 each)
-- - Tenant Modules: 0 records
-- - Outlets: 0 records
-- - Billing History: 0 records

-- TABLE SIZES:
-- refresh_tokens: 48 kB
-- users: 48 kB  
-- tenants: 32 kB
-- subscription_plans: 32 kB
-- modules: 32 kB
-- billing_history: 24 kB
-- outlets: 16 kB
-- subscriptions: 16 kB
-- tenant_modules: 8192 bytes

-- ========================================
-- USERS TABLE BACKUP
-- ========================================
INSERT INTO users (id, tenant_id, username, email, password_hash, role, is_active, last_login_at, created_at, updated_at, stripe_customer_id, stripe_subscription_id)
VALUES ('9519bbe5-f835-4e5e-9848-fde5dbbdae71', NULL, 'superadmin', 'admin@system.com', '$2a$10$BjGQFR/1b5xPSFaltA2sLeOmnoqh6DCMQczxb.4LMAYNd/b/Hmt0K', 'superadmin', true, NULL, '2025-09-17 05:02:43.76983', '2025-09-17 05:02:43.76983', NULL, NULL);

-- ========================================
-- SUBSCRIPTION PLANS TABLE BACKUP  
-- ========================================
INSERT INTO subscription_plans (id, name, description, price, currency, interval, max_outlets, max_users, features, is_active, created_at)
VALUES 
('d426cdf5-37c4-470c-93dd-311400c3172e', 'Basic', 'Perfect for small businesses', 250000.00, 'IDR', 'monthly', 1, 3, '{"Basic POS","Inventory Management","Sales Reports","Email Support"}', true, '2025-09-17 09:48:47.763673'),
('e4bdb7bc-61e7-47d6-823a-b71b9d1d593c', 'Pro', 'Great for growing businesses', 500000.00, 'IDR', 'monthly', 5, 10, '{"Advanced POS","Multi-outlet Management","Advanced Reports","Loyalty Program","Priority Support"}', true, '2025-09-17 09:48:47.763673'),
('d12816a3-ec4c-44c4-a908-b49c3caa20d9', 'Enterprise', 'For large businesses', 1000000.00, 'IDR', 'monthly', 999, 999, '{"Enterprise POS","Unlimited Outlets","Custom Reports","API Access","Dedicated Support"}', true, '2025-09-17 09:48:47.763673'),
('81a2c644-983d-463c-9b0f-0f3bd9d02a4b', 'Basic', 'Perfect for small businesses', 250000.00, 'IDR', 'monthly', 1, 3, '{"Basic POS","Inventory Management","Sales Reports","Email Support"}', true, '2025-09-17 09:50:19.460439'),
('38e74822-6b27-4b5d-b28a-4f6c26756b51', 'Pro', 'Great for growing businesses', 500000.00, 'IDR', 'monthly', 5, 10, '{"Advanced POS","Multi-outlet Management","Advanced Reports","Loyalty Program","Priority Support"}', true, '2025-09-17 09:50:19.460439'),
('a4ab536d-e310-41f2-9486-5543d9dba054', 'Enterprise', 'For large businesses', 1000000.00, 'IDR', 'monthly', 999, 999, '{"Enterprise POS","Unlimited Outlets","Custom Reports","API Access","Dedicated Support"}', true, '2025-09-17 09:50:19.460439');

-- ========================================
-- MODULES TABLE BACKUP
-- ========================================
INSERT INTO modules (id, name, display_name, description, is_default, created_at)
VALUES
('23a65cee-aca4-4d93-beb2-79ca61821eb9', 'pos', 'Point of Sale', 'Core POS functionality for sales processing', true, '2025-09-17 09:48:47.769706'),
('1c8f777d-c25d-48fc-850b-38191660934d', 'inventory', 'Inventory Management', 'Track and manage product inventory', true, '2025-09-17 09:48:47.769706'),
('599c9cf4-0339-44ef-8db8-9b5a662d2aed', 'reports', 'Reports & Analytics', 'Sales reports and business analytics', false, '2025-09-17 09:48:47.769706'),
('05fef497-5073-4b9c-95b6-8030e35ce8e3', 'loyalty', 'Loyalty Program', 'Customer loyalty and rewards program', false, '2025-09-17 09:48:47.769706'),
('bb453315-8e8b-49e7-a3b3-ba8c92629d1f', 'pos', 'Point of Sale', 'Core POS functionality for sales processing', true, '2025-09-17 09:50:19.465241'),
('2c901236-3924-490c-a160-bf07402b0ad4', 'inventory', 'Inventory Management', 'Track and manage product inventory', true, '2025-09-17 09:50:19.465241'),
('14587b41-98c4-450a-9577-94b50bacaee6', 'reports', 'Reports & Analytics', 'Sales reports and business analytics', false, '2025-09-17 09:50:19.465241'),
('e5d6f1c1-0a01-4e75-bde6-bd7e6208e4f6', 'loyalty', 'Loyalty Program', 'Customer loyalty and rewards program', false, '2025-09-17 09:50:19.465241');

-- ========================================
-- EMPTY TABLES (READY FOR DATA)
-- ========================================
-- tenants: 0 records - Ready for tenant registration  
-- subscriptions: 0 records - Ready for subscription data
-- tenant_modules: 0 records - Ready for module assignments
-- outlets: 0 records - Ready for outlet registration
-- billing_history: 0 records - Ready for billing data

-- END OF BACKUP FILE
-- Generated: 17 September 2025 20:05:38 WIB