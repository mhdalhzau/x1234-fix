# Database Backup Current

Backup database Customer Dashboard SaaS yang dibuat pada tanggal **17 September 2025**.

## Status Database Saat Ini:

### Data yang Tersedia:
- ✅ **users**: 1 user (superadmin)
- ✅ **refresh_tokens**: 2 tokens aktif
- ⭕ **tenants**: 0 records (kosong)
- ⭕ **outlets**: 0 records (kosong)
- ⭕ **subscription_plans**: 0 records (kosong)
- ⭕ **subscriptions**: 0 records (kosong)
- ⭕ **modules**: 0 records (kosong)
- ⭕ **tenant_modules**: 0 records (kosong)
- ⭕ **billing_history**: 0 records (kosong)

### Struktur Role Terbaru (Diperbarui):
```
1. SUPERADMIN (Level 3) - System Administrator
   ↓
2. TENANT_OWNER (Level 2) - Business Owner/Customer  
   ↓
3. STAFF (Level 1) - Regular Employee
```

**⚠️ PERUBAHAN PENTING**: Role **ADMIN (admin di level tenant)** telah dihapus dari sistem.

## Akun Login Tersedia:

### Superadmin:
- **Email**: admin@system.com
- **Username**: superadmin
- **Password**: superadmin123
- **Role**: admin (level sistem)
- **Status**: Active
- **Akses**: System-wide access

## File Backup:

- `users_data.sql` - Data user superadmin
- `refresh_tokens_data.sql` - Data token refresh yang aktif
- `schema_backup.sql` - Struktur lengkap database

## Cara Restore:

### Import user data:
```bash
cat users_data.sql | psql $DATABASE_URL
```

### Import tokens:
```bash
cat refresh_tokens_data.sql | psql $DATABASE_URL
```

### Import schema lengkap:
```bash
cat schema_backup.sql | psql $DATABASE_URL
```

## Catatan Penting:

- Database dalam kondisi fresh install dengan hanya superadmin
- Belum ada tenant/customer yang terdaftar
- Sistem siap untuk onboarding customer pertama
- Role hierarchy telah disederhanakan tanpa role 'admin' level tenant