# Database Migrations

This directory contains SQL migration scripts for the Super Secret Supper database.

## Applying Migrations

### Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref <your-project-ref>

# Apply all pending migrations
supabase db push

# Or apply a specific migration
supabase db push --file supabase/migrations/20260219_pairing_workflow_updates.sql
```

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of the migration file
4. Paste and execute

### Using Direct SQL Connection

```bash
# Connect to your database
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Run migration
\i supabase/migrations/20260219_pairing_workflow_updates.sql
```

## Migration Files

### `20260219_pairing_workflow_updates.sql`
**Issue:** #26
**Description:** Adds tables and columns to support the full dinner pairing workflow:
- `availability_slots` table for user availability
- `deadline_at` and `auto_declined` columns to `dinner_invites`
- `location_id` column to `dinner_matches`
- `pairing_algorithm_metadata` column to `dinner_events`
- Performance indexes on frequently queried fields
- RLS policies for data access control

**Changes:**
- ✅ New table: `availability_slots`
- ✅ New columns: `dinner_invites.deadline_at`, `dinner_invites.auto_declined`
- ✅ New column: `dinner_matches.location_id`
- ✅ New column: `dinner_events.pairing_algorithm_metadata`
- ✅ 11 new indexes for performance
- ✅ RLS policies on `availability_slots`
- ✅ Helper function: `check_location_date_conflict()`

**Rollback:** See commented rollback script at end of migration file.

## Testing Migrations

After applying a migration:

1. **Verify tables exist:**
   ```sql
   SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'availability_slots';
   ```

2. **Verify columns added:**
   ```sql
   SELECT column_name, data_type FROM information_schema.columns
   WHERE table_name = 'dinner_invites' AND column_name IN ('deadline_at', 'auto_declined');
   ```

3. **Check indexes:**
   ```sql
   SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'dinner_invites';
   ```

4. **Test RLS policies:**
   ```sql
   -- Should return only your own availability slots
   SELECT * FROM availability_slots;
   ```

## Best Practices

- Always backup database before running migrations in production
- Test migrations in a development environment first
- Include rollback scripts for easy reversal
- Use timestamped filenames (YYYYMMDD_description.sql)
- Document breaking changes clearly
