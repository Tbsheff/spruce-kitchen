# Spruce Kitchen - Development Setup Guide

## Quick Start

1. **Clone and Install**
   \`\`\`bash
   git clone <repository-url>
   cd spruce-kitchen
   npm install
   \`\`\`

2. **Environment Setup**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

3. **Configure Required Variables**
   Edit `.env.local` and set these required variables:
   \`\`\`env
   DATABASE_URL="postgresql://username:password@localhost:5432/spruce_kitchen"
   BETTER_AUTH_SECRET="your-32-char-secret-here"
   BETTER_AUTH_URL="http://localhost:3000"
   \`\`\`

4. **Database Setup**
   \`\`\`bash
   # Create database
   createdb spruce_kitchen
   
   # Run existing migrations
   npm run db:migrate
   
   # Or push schema directly (for development)
   npm run db:push
   
   # Seed database with test data (optional)
   npm run db:seed
   \`\`\`

5. **Start Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

## Required Environment Variables

### 🚨 Critical (App won't work without these)

| Variable | Purpose | How to Get |
|----------|---------|------------|
| `DATABASE_URL` | PostgreSQL connection | Set up local PostgreSQL or use cloud provider |
| `BETTER_AUTH_SECRET` | Session encryption | Generate with `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Auth callback URL | `http://localhost:3000` for development |

### 📧 Email (Required for password reset & verification)

| Variable | Purpose | How to Get |
|----------|---------|------------|
| `RESEND_API_KEY` | Email sending | Sign up at [resend.com](https://resend.com) |

### 🔗 Social Auth (Optional)

| Variable | Purpose | How to Get |
|----------|---------|------------|
| `GOOGLE_CLIENT_ID` | Google OAuth | [Google Console](https://console.developers.google.com) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | Same as above |
| `FACEBOOK_CLIENT_ID` | Facebook OAuth | [Facebook Developers](https://developers.facebook.com) |
| `FACEBOOK_CLIENT_SECRET` | Facebook OAuth | Same as above |

### ⚙️ System (Usually auto-configured)

| Variable | Purpose | Default |
|----------|---------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `VERCEL_URL` | Deployment URL | Auto-set by Vercel |

## Database Setup Options

### Option 1: Local PostgreSQL
\`\`\`bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb spruce_kitchen

# Set DATABASE_URL
DATABASE_URL="postgresql://$(whoami)@localhost:5432/spruce_kitchen"
\`\`\`

### Option 2: Docker PostgreSQL
\`\`\`bash
# Run PostgreSQL in Docker
docker run --name spruce-postgres \
  -e POSTGRES_DB=spruce_kitchen \
  -e POSTGRES_USER=spruce \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15

# Set DATABASE_URL
DATABASE_URL="postgresql://spruce:password@localhost:5432/spruce_kitchen"
\`\`\`

### Option 3: Cloud Database
Use any PostgreSQL cloud provider:
- [Neon](https://neon.tech) - Free tier available
- [Supabase](https://supabase.com) - Free tier available  
- [Railway](https://railway.app) - Free tier available
- [Planetscale](https://planetscale.com) - MySQL alternative

## Security Configuration

### Generate Secure Secrets
\`\`\`bash
# Generate BETTER_AUTH_SECRET
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
\`\`\`

### Production Environment Variables
Make sure to set these for production:
\`\`\`env
NODE_ENV=production
BETTER_AUTH_URL="https://yourdomain.com"
DATABASE_URL="your-production-database-url"
\`\`\`

## Optional Services Setup

### Email (Resend)
1. Sign up at [resend.com](https://resend.com)
2. Verify your domain
3. Get API key from dashboard
4. Set `RESEND_API_KEY` in `.env.local`

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### Facebook OAuth
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create new app
3. Add Facebook Login product
4. Set Valid OAuth redirect URI: `http://localhost:3000/api/auth/callback/facebook`
5. Set `FACEBOOK_CLIENT_ID` and `FACEBOOK_CLIENT_SECRET`

## Common Issues

### Database Connection Issues
\`\`\`bash
# Check if PostgreSQL is running
pg_isready

# Check connection
psql $DATABASE_URL -c "SELECT 1"
\`\`\`

### Auth Secret Issues
Make sure `BETTER_AUTH_SECRET` is at least 32 characters long:
\`\`\`bash
echo $BETTER_AUTH_SECRET | wc -c
\`\`\`

### Port Already in Use
\`\`\`bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
\`\`\`

## Development Workflow

1. **Make changes** to code
2. **Hot reload** automatically updates the app
3. **Check console** for any errors
4. **Test features** in browser at `http://localhost:3000`

## Available Scripts

\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:seed      # Populate database with test data
\`\`\`

## Database Management

This project uses **Drizzle ORM** for database management. Here are the available database commands:

### Migration Commands

\`\`\`bash
# Generate new migrations from schema changes
npm run db:generate

# Apply existing migrations to database
npm run db:migrate

# Push schema directly to database (development only)
npm run db:push

# Open Drizzle Studio (database GUI)
npm run db:studio

# Populate database with test data
npm run db:seed

# Drop all tables (DANGEROUS!)
npm run db:drop
\`\`\`

### Migration Workflow

1. **Make schema changes** in `lib/db/schema.ts`
2. **Generate migration** with `npm run db:generate`
3. **Review migration** in `lib/db/migrations/`
4. **Apply migration** with `npm run db:migrate`

### Development vs Production

**Development:**
\`\`\`bash
# Quick schema sync (no migration files)
npm run db:push
\`\`\`

**Production:**
\`\`\`bash
# Always use migrations for production
npm run db:migrate
\`\`\`

## Security Features Enabled

✅ **Authentication** - Required database connection  
✅ **Rate Limiting** - Database-backed with fallback  
✅ **Input Validation** - XSS protection + Zod schemas  
✅ **Security Headers** - CSP, HSTS, X-Frame-Options  
✅ **Audit Logging** - Security event tracking  
✅ **Password Policy** - Strong password requirements  
✅ **RBAC** - Role-based access control  

## Need Help?

- Check the [.env.example](./.env.example) file for all available variables
- Review error messages in the browser console
- Check the terminal output for server-side errors
- Ensure all required environment variables are set

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions.
