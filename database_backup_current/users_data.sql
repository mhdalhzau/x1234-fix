-- Users Data Backup - 17 September 2025
-- Customer Dashboard SaaS

INSERT INTO users (id, tenant_id, username, email, password_hash, role, is_active, last_login_at, created_at, updated_at) VALUES
('9519bbe5-f835-4e5e-9848-fde5dbbdae71'::uuid, NULL, 'superadmin', 'admin@system.com', '$2a$10$BjGQFR/1b5xPSFaltA2sLeOmnoqh6DCMQczxb.4LMAYNd/b/Hmt0K', 'superadmin', true, NULL, '2025-09-17 05:02:43.76983'::timestamp, '2025-09-17 05:02:43.76983'::timestamp);