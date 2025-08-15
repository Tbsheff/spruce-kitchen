# Database Setup Guide

This application requires a PostgreSQL database for authentication and core functionality.

## Quick Setup Options

### Option 1: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database:
   ```sql
   CREATE DATABASE spruce_kitchen;
   ```
3. Set environment variable:
   ```bash
   export DATABASE_URL="postgresql://username:password@localhost:5432/spruce_kitchen"
   ```

### Option 2: Docker PostgreSQL

```bash
# Start PostgreSQL container
docker run --name spruce-db -e POSTGRES_DB=spruce_kitchen -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15

# Set environment variable
export DATABASE_URL="postgresql://postgres:password@localhost:5432/spruce_kitchen"
```

### Option 3: Cloud Database (Recommended for Development)

**Neon (Free tier)**:
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string and set:
   ```bash
   export DATABASE_URL="your_neon_connection_string"
   ```

**Supabase (Free tier)**:
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database and copy the connection string
4. Set environment variable:
   ```bash
   export DATABASE_URL="your_supabase_connection_string"
   ```

## Environment Variables

Create a `.env.local` file in your project root:

```bash
# Required for authentication
DATABASE_URL="your_database_connection_string"

# Security configuration
CSRF_SECRET="your_csrf_secret_key_change_in_production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # Change to your domain in production

# Optional: Email functionality
RESEND_API_KEY="your_resend_api_key"

# Optional: OAuth providers
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
FACEBOOK_CLIENT_ID="your_facebook_client_id"
FACEBOOK_CLIENT_SECRET="your_facebook_client_secret"
```

## Database Migration

After setting up your database:

```bash
# Generate and run migrations
npx drizzle-kit generate
npx drizzle-kit migrate
```

## Security Notes

- ✅ **DATABASE_URL is REQUIRED** - no authentication bypasses available
- ✅ **Production validation** - ensures DATABASE_URL is set in production
- ✅ **Secure by default** - fails closed when misconfigured
- ✅ **Environment isolation** - development and production configs are separate

## Troubleshooting

**Error: "Database configuration required"**
- Set the `DATABASE_URL` environment variable
- Ensure your database is running and accessible
- Check that the connection string is correct

**Migration errors**:
- Ensure database exists and is accessible
- Check user permissions for database operations
- Verify database schema is up to date

**Authentication not working**:
- Verify `DATABASE_URL` is set correctly
- Check database connection in your environment
- Ensure migrations have been applied