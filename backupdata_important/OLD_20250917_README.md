# Database Backup

Folder ini berisi backup lengkap dari database Customer Dashboard SaaS.

## File-file yang tersedia:

### Backup Lengkap:
- `full_database_backup.sql` - Backup lengkap termasuk schema dan data
- `schema_only.sql` - Hanya struktur tabel dan schema

### Data per Tabel:
- `users_data.sql` - Data pengguna (termasuk superadmin)
- `tenants_data.sql` - Data tenant/pelanggan
- `outlets_data.sql` - Data cabang/toko
- `subscription_plans_data.sql` - Data paket berlangganan
- `subscriptions_data.sql` - Data berlangganan aktif
- `billing_history_data.sql` - Data riwayat pembayaran
- `modules_data.sql` - Data modul sistem
- `tenant_modules_data.sql` - Data modul per tenant
- `refresh_tokens_data.sql` - Data token refresh

## Cara Restore:

### Restore lengkap:
```bash
psql database_url < full_database_backup.sql
```

### Restore schema saja:
```bash
psql database_url < schema_only.sql
```

### Restore data tertentu:
```bash
psql database_url < users_data.sql
```

## Akun Superadmin:
- Email: admin@system.com
- Password: superadmin123
- Role: admin