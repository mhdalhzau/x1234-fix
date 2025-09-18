#!/bin/bash
# Database Backup Script
# Generated: 2025-09-18 02:17:40
# Purpose: Create valid database backup with schema and data

set -e  # Exit on any error

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="backupdata_important/database_backup"

echo "Starting database backup at $(date)"

# Check if database URL is available
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL environment variable not set"
    exit 1
fi

echo "Database URL: ${DATABASE_URL%/*}/***"  # Hide password in logs

# Create schema backup (structure only)
echo "Creating schema backup..."
pg_dump "$DATABASE_URL" --schema-only --no-owner --no-privileges > "$BACKUP_DIR/schema_backup_${TIMESTAMP}.sql"

if [ $? -eq 0 ]; then
    echo "✅ Schema backup created: schema_backup_${TIMESTAMP}.sql"
else
    echo "❌ Schema backup failed"
    exit 1
fi

# Create data backup (data only)
echo "Creating data backup..."
pg_dump "$DATABASE_URL" --data-only --inserts --no-owner --no-privileges > "$BACKUP_DIR/data_backup_${TIMESTAMP}.sql"

if [ $? -eq 0 ]; then
    echo "✅ Data backup created: data_backup_${TIMESTAMP}.sql"
else
    echo "❌ Data backup failed"
    exit 1
fi

# Verify backups
echo "Verifying backups..."

SCHEMA_SIZE=$(wc -l < "$BACKUP_DIR/schema_backup_${TIMESTAMP}.sql")
DATA_SIZE=$(wc -l < "$BACKUP_DIR/data_backup_${TIMESTAMP}.sql")

echo "Schema backup: $SCHEMA_SIZE lines"
echo "Data backup: $DATA_SIZE lines"

if [ $SCHEMA_SIZE -lt 10 ]; then
    echo "⚠️  WARNING: Schema backup seems too small ($SCHEMA_SIZE lines)"
fi

if [ $DATA_SIZE -lt 5 ]; then
    echo "⚠️  WARNING: Data backup seems too small ($DATA_SIZE lines)"
fi

echo "✅ Database backup completed successfully at $(date)"
echo "Files created:"
echo "  - $BACKUP_DIR/schema_backup_${TIMESTAMP}.sql"
echo "  - $BACKUP_DIR/data_backup_${TIMESTAMP}.sql"