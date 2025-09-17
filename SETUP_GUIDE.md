# 🚀 Setup Guide - SaaS Dashboard Platform di Replit

## Overview
Panduan lengkap untuk setup project SaaS Dashboard Platform dengan role hierarchy yang tepat di environment Replit.

## Prerequisites
- Replit account dengan akses ke PostgreSQL database
- Node.js knowledge
- Basic understanding TypeScript/React

---

## 🔧 LANGKAH SETUP LENGKAP

### 1. Import GitHub Project ke Replit

```bash
# Pastikan project structure seperti ini:
├── backend/          # Node.js/Express API
├── src/             # React frontend
├── database_backup/ # SQL backup files
├── package.json     # Frontend dependencies
├── backend/package.json # Backend dependencies
└── replit.md        # Project configuration
```

### 2. Install Dependencies

**PENTING**: Jalankan ini di urutan yang benar!

```bash
# 1. Install frontend dependencies dulu
npm install

# 2. Install backend dependencies
cd backend && npm install
```

**⚠️ Troubleshooting Dependencies:**
- Jika ada error `tsx: not found` → Backend dependencies belum terinstall
- Jika ada error `vite: not found` → Frontend dependencies belum terinstall

### 3. Setup PostgreSQL Database

```bash
# Cek environment variables database
env | grep -E "(DATABASE_URL|PGHOST|PGUSER|PGPASSWORD|PGDATABASE|PGPORT)"

# Jika database belum ada, gunakan tools Replit untuk create database
# Atau minta Agent untuk create database dengan command berikut:
```

**Environment Variables yang dibutuhkan:**
```
DATABASE_URL=postgresql://postgres:password@helium/heliumdb?sslmode=disable
PGPORT=5432
PGPASSWORD=password
PGUSER=postgres
PGDATABASE=heliumdb
PGHOST=helium
```

### 4. Restore Database dari Backup

```bash
# Restore full database (RECOMMENDED)
psql "$DATABASE_URL" < database_backup/full_database_backup.sql

# Atau restore bertahap:
psql "$DATABASE_URL" < database_backup/schema_only.sql
psql "$DATABASE_URL" < database_backup/users_data.sql
psql "$DATABASE_URL" < database_backup/tenants_data.sql
# dst...
```

**⚠️ Error Handling:**
- Error `role "neondb_owner" does not exist` → NORMAL, abaikan
- Error `role "neon_superuser" does not exist` → NORMAL, abaikan
- Yang penting: tabel berhasil dibuat dan data ter-import

### 5. Setup Workflows

**Frontend Workflow:**
```yaml
name: Frontend
command: npm run dev
port: 5000 (WAJIB untuk Replit webview)
output_type: webview
```

**Backend Workflow:**
```yaml
name: Backend  
command: cd backend && JWT_SECRET=your-super-secret-jwt-key-for-development-only JWT_REFRESH_SECRET=your-super-secret-refresh-key-for-development-only NODE_ENV=development npm run dev
port: 8000
output_type: console
```

**⚠️ CRITICAL untuk Frontend:**
- HARUS menggunakan port 5000
- HARUS menggunakan host 0.0.0.0
- Replit routing mengharuskan configuration ini

### 6. Verify Setup

**Cek Database:**
```sql
-- Cek tabel berhasil dibuat
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Cek user data
SELECT email, username, role FROM users;

-- Cek tenant data  
SELECT id, business_name, email, status FROM tenants;
```

**Cek Workflows:**
- Frontend: Akses webview, harus load React app
- Backend: Console log harus show "🚀 Customer Dashboard Backend running on port 8000"

---

## 🔑 USER ACCOUNTS SETELAH RESTORE

### Superadmin (System-wide access)
```
Email: admin@system.com
Username: superadmin
Role: superadmin
Password: [Hash dari backup]
Tenant: NULL (akses semua tenant)
```

### Demo Tenant Owner 
```
Email: owner@demo.com
Username: tenant_owner  
Role: tenant_owner
Password: password
Tenant: Demo Tenant
```

### Staff User
```
Email: staff@demo.com
Username: staff_user
Role: staff  
Password: password
Tenant: Demo Tenant (staff harus tenant-bound)
```

---

## ⚡ COMMON ERRORS & SOLUTIONS

### Frontend tidak load / blank page
**Causes:**
- Port bukan 5000
- Host bukan 0.0.0.0  
- Vite config tidak allow semua hosts

**Solution:**
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5000
  }
})
```

### Backend API tidak bisa diakses dari frontend
**Causes:**
- Backend port bentrok dengan frontend
- CORS tidak di-setup

**Solution:**
- Backend gunakan port 8000
- Frontend environment setup API base URL dengan benar

### Database connection error
**Causes:**
- Environment variables tidak ada
- Database belum di-provision

**Solution:**
```bash
# Check environment vars
env | grep DATABASE_URL

# Jika kosong, buat database baru atau hubungi support
```

### Authentication error / JWT issues
**Causes:**
- JWT secrets tidak di-set
- Refresh token mechanism belum benar

**Solution:**
```bash
# Set JWT secrets in workflow command
JWT_SECRET=your-super-secret-jwt-key-for-development-only 
JWT_REFRESH_SECRET=your-super-secret-refresh-key-for-development-only
```

---

## 📋 CHECKLIST SETUP SUKSES

- [ ] Dependencies installed (frontend & backend)
- [ ] Database environment variables configured
- [ ] Database restored dari backup
- [ ] Frontend workflow running di port 5000 dengan webview
- [ ] Backend workflow running di port 8000 dengan console logs
- [ ] React app load di browser (via Replit webview)
- [ ] API endpoints responding (test dengan /api/auth/login)
- [ ] Role hierarchy working (superadmin, tenant_owner, staff)

---

## 🔄 NEXT STEPS SETELAH SETUP

1. **Test Authentication:**
   - Login dengan superadmin account
   - Verify role-based UI differences
   - Test JWT refresh mechanism

2. **Setup Production Secrets:**
   - Move JWT secrets ke Replit Secrets
   - Setup Stripe keys jika diperlukan
   - Configure email service credentials

3. **Deploy ke Production:**
   - Configure deployment settings
   - Test production build
   - Setup monitoring & logging

---

## 📞 NEED HELP?

**Common Resources:**
- Replit Docs: https://docs.replit.com/
- Project replit.md: Berisi preferences dan context
- Database backup README: `database_backup/README.md`

**Debug Commands:**
```bash
# Check logs
npm run dev 2>&1 | tee debug.log

# Check database status
psql "$DATABASE_URL" -c "\dt"

# Check environment
env | grep -E "(NODE_ENV|DATABASE|JWT)"
```