# 📚 Customer Dashboard SaaS - Dokumentasi Sistem

**Tanggal Update**: 17 September 2025
**Status**: Production Ready ✅

## 🏗️ Arsitektur Sistem

### Stack Teknologi:
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL dengan Drizzle ORM
- **Authentication**: JWT dengan refresh tokens
- **Deployment**: Replit Autoscale

### Port Configuration:
- **Frontend**: Port 5000 (0.0.0.0)
- **Backend**: Port 8000 (localhost)
- **Database**: PostgreSQL (managed by Replit)

## 👥 Struktur Role (Diperbarui)

### Hierarki Role Baru:
```
1. SUPERADMIN (Level 3) - System Administrator
   ├── Akses: System-wide, semua tenant
   ├── Target: Platform administrator
   └── Database: role='superadmin', tenant_id=NULL

2. TENANT_OWNER (Level 2) - Business Owner
   ├── Akses: Single tenant, full business control
   ├── Target: Customer/pemilik bisnis yang berlangganan
   └── Database: role='tenant_owner', tenant_id=[uuid]

3. STAFF (Level 1) - Regular Employee
   ├── Akses: Single tenant, operational only
   ├── Target: Karyawan dalam bisnis customer
   └── Database: role='staff', tenant_id=[uuid]
```

### ⚠️ Perubahan Penting:
**Role "admin" level tenant telah DIHAPUS** dari sistem untuk menyederhanakan struktur.

## 🔐 Authentication & Authorization

### Login Credentials:

#### Superadmin:
- **Email**: admin@system.com
- **Username**: superadmin  
- **Password**: superadmin123
- **Role**: admin (sistem level)

### JWT Configuration:
- **Access Token**: 15 menit expiry
- **Refresh Token**: 7 hari expiry  
- **Secret Keys**: Dikelola melalui environment variables

## 💾 Database Schema

### Core Tables:
1. **users** - User accounts (superadmin, tenant_owner, staff)
2. **tenants** - Business customers yang berlangganan
3. **outlets** - Cabang/toko milik tenant
4. **subscription_plans** - Paket berlangganan yang tersedia
5. **subscriptions** - Berlangganan aktif per tenant
6. **modules** - Fitur/modul sistem (POS, Inventory, Reports)
7. **tenant_modules** - Modul yang diaktifkan per tenant
8. **billing_history** - Riwayat pembayaran dan billing
9. **refresh_tokens** - Token untuk authentication

### Database Status Saat Ini:
- ✅ **users**: 1 record (superadmin)
- ✅ **refresh_tokens**: 2 records (active sessions)
- ⭕ **tenants**: 0 records (siap untuk customer pertama)
- ⭕ **Semua tabel lain**: Kosong, siap untuk data

## 🚀 Deployment Configuration

### Development:
```bash
# Frontend
npm run dev  # Port 5000

# Backend  
cd backend && npm run dev  # Port 8000
```

### Production:
```bash
# Build
npm run build

# Start (serves frontend + backend)
npm start
```

### Environment Variables:
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - JWT access token secret
- `JWT_REFRESH_SECRET` - JWT refresh token secret
- `NODE_ENV` - Environment (development/production)

## 📝 API Endpoints

### Authentication:
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout

### Tenants:
- `GET /api/tenants` - List tenants (superadmin only)
- `POST /api/tenants` - Create tenant
- `GET /api/tenants/:id` - Get tenant details
- `PUT /api/tenants/:id` - Update tenant
- `DELETE /api/tenants/:id` - Delete tenant

### Outlets:
- `GET /api/outlets` - List outlets for tenant
- `POST /api/outlets` - Create outlet
- `PUT /api/outlets/:id` - Update outlet  
- `DELETE /api/outlets/:id` - Delete outlet

### Subscriptions:
- `GET /api/subscriptions` - List subscriptions
- `POST /api/subscriptions` - Create subscription
- `PUT /api/subscriptions/:id` - Update subscription

## 🛡️ Security Features

### CORS Configuration:
- Development: Permissive untuk localhost dan .replit domains
- Production: Restrictive untuk specific origins only

### Role-Based Access Control:
```typescript
// Middleware tersedia:
- requireSuperadmin() - Hanya superadmin
- requireOwner() - Hanya tenant_owner  
- requireMinimumRole(role) - Minimum role level
- canAccessTenant(tenantId) - Tenant-specific access
```

### Password Security:
- bcryptjs dengan salt rounds 10
- Password hashing otomatis
- Secure password validation

## 📊 Database Backup & Recovery

### Backup Location:
- **Current**: `database_backup_current/`
- **Contains**: Schema, user data, refresh tokens

### Recovery Commands:
```bash
# Full schema restore
cat database_backup_current/schema_backup.sql | psql $DATABASE_URL

# User data restore  
cat database_backup_current/users_data.sql | psql $DATABASE_URL

# Refresh tokens restore
cat database_backup_current/refresh_tokens_data.sql | psql $DATABASE_URL
```

## 🔧 Development Guidelines

### Database Migrations:
```bash
# Push schema changes
npm run db:push

# Force push (if data conflicts)  
npm run db:push --force
```

### Code Structure:
- **Frontend**: `/src` - React components dan pages
- **Backend**: `/backend` - Express server dan API routes
- **Shared**: Schema definitions dan types
- **Documentation**: README files dan backup docs

## ✅ Next Steps

1. **Customer Onboarding**: Setup flow untuk tenant pertama
2. **Subscription Plans**: Buat paket Basic, Pro, Enterprise
3. **Payment Integration**: Integrasi dengan Stripe/payment gateway
4. **Module System**: Aktifkan fitur POS, Inventory, Reports
5. **Analytics Dashboard**: Implement SaaS metrics dan reporting

## 📞 Support & Troubleshooting

### Common Issues:
1. **JWT Errors**: Check environment variables untuk secrets
2. **Database Connection**: Verify DATABASE_URL
3. **CORS Issues**: Check origin configuration
4. **Port Conflicts**: Ensure frontend (5000) dan backend (8000) tidak bentrok

### Debug Commands:
```bash
# Check database connection
npm run db:push

# View logs
npm run dev (check console output)

# Test API endpoints
curl http://localhost:8000/health
```

---

**© 2025 Customer Dashboard SaaS** - Ready for Production Deployment 🚀