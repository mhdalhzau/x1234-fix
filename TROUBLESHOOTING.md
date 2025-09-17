# 🛠️ Troubleshooting Guide - SaaS Dashboard Platform

## Overview
Panduan mengatasi masalah umum yang sering terjadi saat setup dan development SaaS Dashboard Platform di Replit.

---

## 🚨 CRITICAL ERRORS & SOLUTIONS

### 1. **Dependencies Not Found Errors**

#### Error: `tsx: not found` atau `vite: not found`
```bash
# Error message:
sh: 1: tsx: not found
sh: 1: vite: not found
```

**Root Cause**: Dependencies belum terinstall dengan benar

**Solution**:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies  
cd backend && npm install

# Restart workflows setelah install
```

**Prevention**: Selalu install dependencies di urutan yang benar (frontend dulu, lalu backend)

---

### 2. **Database Connection Issues**

#### Error: Database not provisioned
```bash
Database is not provisioned. If a database is needed, use create_postgresql_database_tool
```

**Root Cause**: PostgreSQL database belum dibuat di Replit

**Solution**:
1. Gunakan Replit Database tool dari Tool dock
2. Atau minta Agent create database
3. Verify environment variables:
```bash
env | grep -E "(DATABASE_URL|PGHOST|PGUSER|PGPASSWORD|PGDATABASE|PGPORT)"
```

#### Error: Database backup restore issues
```sql
ERROR: role "neondb_owner" does not exist
ERROR: role "neon_superuser" does not exist
```

**Root Cause**: Backup dari environment berbeda (Neon) ke Replit PostgreSQL

**Solution**: **ABAIKAN ERROR INI** - Normal dan tidak berpengaruh
- Yang penting: tables berhasil dibuat
- Data berhasil di-import
- User accounts tersedia

**Verify Success**:
```sql
-- Cek tabel berhasil dibuat
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Cek user data
SELECT email, username, role FROM users;
```

---

### 3. **Frontend Tidak Load / Blank Page**

#### Error: Page tidak load di Replit webview
**Root Cause**: Port atau host configuration salah

**Solution**:
```typescript
// vite.config.ts - HARUS ada config ini
export default defineConfig({
  server: {
    host: '0.0.0.0',  // CRITICAL: Replit requires this
    port: 5000        // CRITICAL: Must be 5000
  }
})
```

#### Error: Frontend load tapi API calls gagal
**Root Cause**: API base URL salah atau backend tidak running

**Solution**:
```typescript
// Check API base URL configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8000' 
  : `https://${window.location.hostname.replace('-00-', '-00-').replace('.pike.replit.dev', '-8000.pike.replit.dev')}`;
```

**Verify Backend Running**:
- Check console logs: "🚀 Customer Dashboard Backend running on port 8000"
- Test API endpoint: `/api/auth/login`

---

### 4. **Authentication & JWT Issues**

#### Error: Invalid or expired token
**Root Cause**: JWT secrets tidak di-set atau salah

**Solution**:
```bash
# Set JWT secrets di workflow command:
JWT_SECRET=your-super-secret-jwt-key-for-development-only 
JWT_REFRESH_SECRET=your-super-secret-refresh-key-for-development-only 
NODE_ENV=development
```

#### Error: Login berhasil tapi role access salah
**Root Cause**: Role hierarchy tidak sesuai atau permission logic salah

**Solution**:
1. Check database user role:
```sql
SELECT email, username, role, tenant_id FROM users WHERE email = 'admin@system.com';
```

2. Verify role di frontend:
```javascript
console.log('Current user role:', user.role);
```

3. Check role hierarchy di `backend/middleware/auth.ts`:
```typescript
const ROLE_HIERARCHY = {
  superadmin: 4,
  tenant_owner: 3,
  admin: 2,
  staff: 1
};
```

---

### 5. **Workflow Configuration Issues**

#### Error: Workflows not starting
**Root Cause**: Command atau configuration salah

**Correct Frontend Workflow**:
```yaml
name: Frontend
command: npm run dev
wait_for_port: 5000
output_type: webview
```

**Correct Backend Workflow**:
```yaml
name: Backend
command: cd backend && JWT_SECRET=your-super-secret-jwt-key-for-development-only JWT_REFRESH_SECRET=your-super-secret-refresh-key-for-development-only NODE_ENV=development npm run dev
wait_for_port: 8000
output_type: console
```

#### Error: Port conflicts
**Root Cause**: Multiple services menggunakan port yang sama

**Solution**: **STRICT PORT ASSIGNMENT**
- Frontend: Port 5000 (FIXED, tidak boleh diganti)
- Backend: Port 8000 (recommended)
- Database: Port 5432 (automatic)

---

## 🔧 DEBUGGING TECHNIQUES

### 1. Check Logs Systematically
```bash
# Frontend logs (Vite dev server)
npm run dev

# Backend logs  
cd backend && npm run dev

# Database connection test
psql "$DATABASE_URL" -c "SELECT version();"
```

### 2. Verify Environment Variables
```bash
# All database vars
env | grep -E "(DATABASE|PG)"

# JWT secrets
env | grep JWT

# Node environment
env | grep NODE_ENV
```

### 3. Test API Endpoints Manually
```bash
# Test login endpoint
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@system.com","password":"password"}'

# Test tenant info
curl -X GET http://localhost:8000/api/tenants/me \
  -H "Authorization: Bearer [token]"
```

### 4. Database Debugging
```sql
-- Check all tables
\dt

-- Check user roles
SELECT email, role, tenant_id FROM users;

-- Check tenant data  
SELECT id, business_name, status FROM tenants;

-- Check subscriptions
SELECT * FROM subscriptions;
```

---

## 🎯 SPECIFIC ERROR CODES

### HTTP 401 - Unauthorized
**Possible Causes:**
- Token expired atau invalid
- JWT secrets tidak match
- User account inactive

**Debug Steps:**
1. Check token format di localStorage
2. Verify JWT secrets di backend
3. Check user `is_active` status di database

### HTTP 403 - Forbidden  
**Possible Causes:**
- Role tidak memiliki permission
- Cross-tenant access attempt
- Missing middleware protection

**Debug Steps:**
1. Check user role di request
2. Verify route protection middleware
3. Check tenant_id matching

### HTTP 500 - Internal Server Error
**Possible Causes:**
- Database connection error
- Unhandled exception di backend
- Missing environment variables

**Debug Steps:**
1. Check backend console logs
2. Verify database connection
3. Check required environment variables

---

## 📋 DEBUGGING CHECKLIST

### Frontend Issues:
- [ ] Vite dev server running di port 5000?
- [ ] Host configuration 0.0.0.0?
- [ ] API base URL correct?
- [ ] Browser console errors?
- [ ] Network requests succeeding?

### Backend Issues:
- [ ] Express server running di port 8000?
- [ ] Database connection successful?
- [ ] JWT secrets configured?
- [ ] Environment variables set?
- [ ] Route middleware applied correctly?

### Database Issues:
- [ ] PostgreSQL service running?
- [ ] Environment variables correct?
- [ ] Tables and data imported?
- [ ] User accounts available?
- [ ] Foreign key constraints working?

### Authentication Issues:
- [ ] Login endpoint responding?
- [ ] JWT tokens generating?
- [ ] Role hierarchy correct?
- [ ] Frontend storing tokens?
- [ ] Refresh mechanism working?

---

## 🚀 PERFORMANCE TROUBLESHOOTING

### Slow Database Queries
```sql
-- Check query performance
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';

-- Add indexes if needed
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
```

### Frontend Bundle Size Issues
```bash
# Analyze bundle
npm run build
npm run preview

# Check bundle analyzer
npx vite-bundle-analyzer
```

### Memory Issues
```bash
# Check Node.js memory usage
node --max-old-space-size=4096 backend/server.js

# Monitor memory in production
pm2 monit
```

---

## 📞 ESCALATION PROCEDURES

### When to Ask for Help:
1. **Database corruption**: Data loss atau foreign key violations
2. **Security issues**: JWT compromise atau unauthorized access
3. **Environment problems**: Replit-specific configuration issues
4. **Performance degradation**: Query timeouts atau memory leaks

### Information to Provide:
- Complete error messages
- Relevant log snippets  
- Environment details (Node version, etc.)
- Steps to reproduce
- Recent changes made

### Emergency Contacts:
- Replit Support: https://replit.com/support
- Database Issues: Check Replit PostgreSQL documentation
- Security Issues: Change all secrets immediately

---

## 🔄 RECOVERY PROCEDURES

### Database Recovery:
```bash
# Restore from backup
psql "$DATABASE_URL" < database_backup/full_database_backup.sql

# Recreate critical data
psql "$DATABASE_URL" < database_backup/users_data.sql
```

### Code Recovery:
```bash
# Git rollback to working version
git log --oneline
git reset --hard [commit-hash]

# Restore from Replit history
# Use File History feature in Replit
```

### Environment Recovery:
```bash
# Reset environment variables
unset JWT_SECRET JWT_REFRESH_SECRET
# Re-export correct values

# Restart all workflows
# Use Replit workflow management
```