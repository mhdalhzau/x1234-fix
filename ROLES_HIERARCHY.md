# 🔐 Role Hierarchy & Permissions - SaaS Dashboard Platform

## Overview
Dokumentasi lengkap tentang hierarki role dan permission system dalam SaaS Dashboard Platform.

---

## 🏗️ ROLE HIERARCHY STRUCTURE

### Hierarki Level (dari tertinggi ke terendah):

```
1. SUPERADMIN (Level 4) - System Administrator
   ↓
2. TENANT_OWNER (Level 3) - Business Owner/Customer  
   ↓
3. ADMIN (Level 2) - Tenant Administrator
   ↓  
4. STAFF (Level 1) - Regular Employee
```

---

## 👥 DETAIL ROLE DEFINITIONS

### 1. SUPERADMIN
**Scope**: System-wide access
**Target User**: Platform administrator, bukan customer
**Database**: `role = 'superadmin'`, `tenant_id = NULL`

**Akses & Permissions:**
- ✅ Akses ke semua tenant data
- ✅ Manage subscription plans dan pricing
- ✅ System administration (logs, performance)
- ✅ Create/suspend/delete tenant accounts
- ✅ Full API management dan integrations
- ✅ White-label system configuration
- ✅ Database backup & system export

**UI Access:**
- Superadmin Panel header
- System Administration section
- All tenant analytics & metrics
- Global subscriber management

### 2. TENANT_OWNER
**Scope**: Single tenant/business access
**Target User**: Pelanggan bisnis yang berlangganan
**Database**: `role = 'tenant_owner'`, `tenant_id = [uuid]`

**Akses & Permissions:**
- ✅ Full business dashboard & analytics
- ✅ Subscription billing & invoice management
- ✅ Team management untuk tenant mereka
- ✅ Business branding & customization
- ✅ Outlet/store management
- ✅ Business-level integrations
- ❌ TIDAK bisa akses tenant lain
- ❌ TIDAK bisa system administration

**UI Access:**
- Business Dashboard header
- Subscription & billing section
- Team management tools
- Branding customization

### 3. ADMIN
**Scope**: Single tenant, administrative access
**Target User**: Administrator dalam bisnis customer
**Database**: `role = 'admin'`, `tenant_id = [uuid]`

**Akses & Permissions:**
- ✅ Tenant management dashboard
- ✅ User management dalam tenant
- ✅ Outlet/store operations
- ✅ Limited analytics (tidak financial)
- ❌ TIDAK bisa subscription/billing
- ❌ TIDAK bisa branding changes
- ❌ TIDAK bisa tenant-level settings

### 4. STAFF
**Scope**: Single tenant, operational access
**Target User**: Karyawan biasa dalam bisnis customer
**Database**: `role = 'staff'`, `tenant_id = [uuid]`

**Akses & Permissions:**
- ✅ Basic dashboard view
- ✅ Operational tasks (POS, inventory)
- ❌ TIDAK bisa user management
- ❌ TIDAK bisa analytics
- ❌ TIDAK bisa settings

---

## 🛡️ PERMISSION MATRIX

| Feature Area | Superadmin | Tenant Owner | Admin | Staff |
|--------------|------------|--------------|-------|-------|
| **Dashboard** | ✅ All | ✅ Business | ✅ Tenant | ✅ Basic |
| **Analytics** | ✅ Global | ✅ Business | ✅ Limited | ❌ |
| **User Management** | ✅ Global | ✅ Tenant | ✅ Tenant | ❌ |
| **Subscriptions** | ✅ All Plans | ✅ Own Plan | ❌ | ❌ |
| **Billing** | ✅ All | ✅ Own | ❌ | ❌ |
| **Tenants** | ✅ CRUD | ❌ | ❌ | ❌ |
| **Outlets** | ✅ All | ✅ Own | ✅ Own | ❌ |
| **Branding** | ✅ All | ✅ Own | ❌ | ❌ |
| **Integrations** | ✅ All | ✅ Business | ❌ | ❌ |
| **System Admin** | ✅ | ❌ | ❌ | ❌ |

---

## 🔧 TECHNICAL IMPLEMENTATION

### Backend Middleware

**File**: `backend/middleware/auth.ts`

```typescript
// Role hierarchy levels
const ROLE_HIERARCHY = {
  superadmin: 4,
  tenant_owner: 3,
  admin: 2,
  staff: 1
};

// Key middleware functions:
requireSuperadmin()     // Only superadmin
requireOwner()          // Only tenant_owner  
requireMinimumRole()    // Minimum role level
canAccessTenant()       // Superadmin OR same tenant
```

### Frontend Access Control

**File**: `src/components/ComprehensiveSidebar.tsx`

```typescript
// Navigation items with role restrictions
const saasNavigation: NavItem[] = [
  { 
    name: 'Dashboard', 
    roles: ['superadmin', 'tenant_owner', 'admin', 'staff'] 
  },
  { 
    name: 'Analytics', 
    roles: ['superadmin', 'tenant_owner', 'admin'] 
  },
  // etc...
];

// Access control function
const canAccess = (item: NavItem) => {
  return item.roles.includes(user.role);
};
```

---

## 📋 ROLE ASSIGNMENT RULES

### 1. Registration Flow
```typescript
// NEW TENANT REGISTRATION
POST /api/auth/register
→ Creates: tenant (business) + user (tenant_owner)
→ Role: 'tenant_owner'
→ Tenant: newly created tenant ID
```

### 2. User Creation by Tenant Owner
```typescript
// TENANT OWNER CREATES STAFF
POST /api/users (tenant_owner only)
→ Creates: user with tenant_id = owner's tenant
→ Role: 'admin' OR 'staff'
→ Tenant: same as owner
```

### 3. Superadmin Creation
```sql
-- MANUAL DATABASE INSERT ONLY
INSERT INTO users (username, email, password_hash, role) 
VALUES ('superadmin', 'admin@system.com', '[hash]', 'superadmin');
-- tenant_id = NULL for superadmin
```

---

## 🚨 SECURITY RULES

### Data Isolation
1. **Superadmin**: Can access ANY tenant data
2. **Tenant Users**: Can ONLY access their own tenant data
3. **Cross-tenant access**: FORBIDDEN (403 error)

### API Route Protection
```typescript
// Example route protections:
router.get('/tenants/admin/all', requireSuperadmin);  // Global tenant list
router.put('/tenants/me', requireTenantOwner);        // Update own tenant
router.get('/users', canAccessTenant);                // Users in same tenant
router.post('/subscriptions', requireMinimumRole('tenant_owner'));
```

### Frontend Route Guards
```typescript
// Hide/show features based on role
{user.role === 'superadmin' && <SystemAdminPanel />}
{['superadmin', 'tenant_owner'].includes(user.role) && <BillingSection />}
```

---

## 🧪 TESTING ROLE ACCESS

### Test Accounts
```sql
-- After database restore, you have:
-- Superadmin: admin@system.com / superadmin / NULL tenant
-- Tenant Owner: owner@demo.com / tenant_owner / Demo Tenant  
-- Staff: staff@demo.com / staff / Demo Tenant (tenant-bound)
```

### Test Scenarios
1. **Login sebagai superadmin** → Harus lihat semua fitur
2. **Login sebagai tenant_owner** → Harus lihat business features saja
3. **Login sebagai staff** → Harus lihat basic features saja
4. **API cross-tenant access** → Harus dapat 403 error

### Role Switch Testing
```javascript
// Frontend test: change user role manually di localStorage
const testUser = { ...user, role: 'staff' };
localStorage.setItem('user', JSON.stringify(testUser));
// Refresh → UI harus berubah sesuai role
```

---

## 🔄 ROLE MIGRATION CHECKLIST

Jika mengubah role system di masa depan:

- [ ] Update `ROLE_HIERARCHY` di middleware
- [ ] Update navigation roles di sidebar
- [ ] Update API route protections  
- [ ] Update database seeds/migration
- [ ] Test all role combinations
- [ ] Update dokumentasi ini

---

## ⚠️ COMMON MISTAKES & SOLUTIONS

### Mistake 1: Menggunakan 'admin' untuk system admin
❌ **Wrong**: `role = 'admin'` untuk system-wide access
✅ **Correct**: `role = 'superadmin'` untuk system-wide access

### Mistake 2: Tenant owner tidak bisa manage subscription
❌ **Wrong**: Hanya superadmin yang bisa billing
✅ **Correct**: Tenant owner harus bisa manage subscription sendiri

### Mistake 3: Staff bisa akses analytics
❌ **Wrong**: Staff role bisa lihat business metrics
✅ **Correct**: Staff hanya basic operational access

### Mistake 4: Cross-tenant data leak
❌ **Wrong**: User bisa akses data tenant lain
✅ **Correct**: Strict tenant isolation (kecuali superadmin)

---

## 📚 REFERENCES

- **Auth Middleware**: `backend/middleware/auth.ts`
- **User Schema**: `backend/models/schema.ts`  
- **Frontend Sidebar**: `src/components/ComprehensiveSidebar.tsx`
- **Auth Routes**: `backend/routes/auth.ts`
- **Tenant Routes**: `backend/routes/tenants.ts`