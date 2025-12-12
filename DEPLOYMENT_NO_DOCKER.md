# Deployment Guide (Without Docker)

Complete guide for deploying Pixel Canvas for Change without using Docker.

---

## Table of Contents

- [Local Development Setup](#local-development-setup)
- [Cloud Database Options](#cloud-database-options)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Method 1: Install PostgreSQL Locally

#### Windows

**Step 1: Install PostgreSQL**

1. Download installer from https://www.postgresql.org/download/windows/
2. Run installer and follow wizard:
   - Default port: 5432
   - Set password for postgres user (remember this!)
   - Install pgAdmin 4 (optional, for GUI management)
3. Add PostgreSQL to PATH (installer usually does this)

**Step 2: Create Database**

Open Command Prompt or PowerShell:

```powershell
# Connect to PostgreSQL
psql -U postgres

# Inside psql, run:
CREATE DATABASE pixel_canvas;

# Verify database was created
\l

# Exit psql
\q
```

**Step 3: Configure Project**

Create `.env` file in project root:

```bash
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/pixel_canvas"
NEXTAUTH_SECRET="generate-random-string-here"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-gmail-app-password"
NODE_ENV="development"
```

**Step 4: Initialize and Run**

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed initial data
npm run db:seed

# Start development server
npm run dev
```

Visit http://localhost:3000

#### Mac

**Step 1: Install PostgreSQL**

Using Homebrew (recommended):

```bash
# Install PostgreSQL 15
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Verify installation
psql --version
```

**Step 2: Create Database**

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE pixel_canvas;

# Exit
\q
```

**Step 3: Configure and Run**

Same as Windows Step 3 & 4, but default connection string is:

```bash
DATABASE_URL="postgresql://localhost:5432/pixel_canvas"
```

Then run:
```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

#### Linux (Ubuntu/Debian)

**Step 1: Install PostgreSQL**

```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Check status
sudo systemctl status postgresql
```

**Step 2: Create Database and User**

```bash
# Switch to postgres user
sudo -i -u postgres

# Open psql
psql

# Create database
CREATE DATABASE pixel_canvas;

# Create user (optional, for better security)
CREATE USER pixel_user WITH PASSWORD 'secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE pixel_canvas TO pixel_user;

# Exit
\q
exit
```

**Step 3: Configure and Run**

Create `.env`:

```bash
# Using default postgres user
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pixel_canvas"

# Or using custom user
DATABASE_URL="postgresql://pixel_user:secure_password@localhost:5432/pixel_canvas"
```

Then run:
```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

---

## Cloud Database Options

No local PostgreSQL installation needed. Use a free managed database.

### Option 1: Neon (Recommended)

**Why Neon:**
- Free tier: 10 GB storage
- Serverless PostgreSQL
- Instant setup
- Great for Vercel deployment

**Setup Steps:**

1. Visit https://neon.tech
2. Sign up with GitHub/Google
3. Click "Create Project"
4. Choose region closest to you
5. Copy connection string (looks like):
   ```
   postgresql://user:pass@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

6. Create `.env`:
   ```bash
   DATABASE_URL="your-neon-connection-string"
   NEXTAUTH_SECRET="random-secret"
   NODE_ENV="development"
   ```

7. Initialize:
   ```bash
   npm install
   npx prisma generate
   npx prisma migrate deploy
   npm run db:seed
   npm run dev
   ```

**Note:** Use `migrate deploy` instead of `migrate dev` for cloud databases.

### Option 2: Supabase

**Why Supabase:**
- Free tier: 500 MB database
- Includes authentication (optional)
- Built-in dashboard
- Good for small projects

**Setup Steps:**

1. Visit https://supabase.com
2. Sign up and create new project
3. Wait for database provisioning (2-3 minutes)
4. Go to Settings > Database
5. Scroll to "Connection string" section
6. Copy "Connection string" (Transaction mode)
7. Replace `[YOUR-PASSWORD]` with your database password

Example:
```
postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

8. Create `.env` and initialize same as Neon

### Option 3: ElephantSQL

**Why ElephantSQL:**
- Simple setup
- 20 MB free tier (good for testing)
- Reliable uptime

**Setup Steps:**

1. Visit https://www.elephantsql.com
2. Sign up for free account
3. Create new instance (Tiny Turtle plan - FREE)
4. Choose data center near you
5. Copy "URL" from details page
   ```
   postgresql://user:pass@ruby.db.elephantsql.com/dbname
   ```

6. Create `.env` and initialize

### Option 4: Railway

**Why Railway:**
- Generous free tier ($5/month credit)
- Easy PostgreSQL addon
- Can host both database and application

**Setup Steps:**

1. Visit https://railway.app
2. Sign up with GitHub
3. Create new project
4. Add "PostgreSQL" service
5. Click on PostgreSQL service
6. Go to "Connect" tab
7. Copy "Postgres Connection URL"

8. Create `.env`:
   ```bash
   DATABASE_URL="postgresql://postgres:xxx@containers-us-west-xxx.railway.app:7432/railway"
   ```

9. Initialize database

---

## Production Deployment

### Vercel + Neon (Recommended Combo)

**Step 1: Set up Neon Database**

1. Create Neon project (see above)
2. Copy connection string
3. Run migrations locally first:
   ```bash
   DATABASE_URL="your-neon-url" npx prisma migrate deploy
   DATABASE_URL="your-neon-url" npm run db:seed
   ```

**Step 2: Deploy to Vercel**

1. Push code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/username/repo.git
   git push -u origin main
   ```

2. Go to https://vercel.com
3. Click "Import Project"
4. Select your GitHub repository
5. Configure environment variables:
   ```
   DATABASE_URL: your-neon-connection-string
   NEXTAUTH_SECRET: generate-random-secret
   EMAIL_USER: your-email@gmail.com
   EMAIL_PASSWORD: your-gmail-app-password
   NODE_ENV: production
   ```

6. Click "Deploy"
7. Wait for deployment (2-3 minutes)
8. Visit your site at `https://your-project.vercel.app`

### Railway (All-in-One)

**Step 1: Deploy from GitHub**

1. Visit https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your repo
5. Select your repository

**Step 2: Add PostgreSQL**

1. Click "New" in your project
2. Select "Database" > "PostgreSQL"
3. Railway automatically creates `DATABASE_URL` variable

**Step 3: Configure Environment**

1. Go to your web service
2. Click "Variables"
3. Add:
   ```
   NEXTAUTH_SECRET: your-secret
   EMAIL_USER: your-email
   EMAIL_PASSWORD: your-password
   NODE_ENV: production
   ```

**Step 4: Initialize Database**

1. Click on your web service
2. Go to "Settings" > "Deploy"
3. Add custom start command:
   ```
   npx prisma migrate deploy && npm run db:seed && npm start
   ```

4. Redeploy

### Render

**Step 1: Create PostgreSQL Database**

1. Visit https://render.com
2. Click "New" > "PostgreSQL"
3. Choose free tier
4. Copy "Internal Database URL"

**Step 2: Create Web Service**

1. Click "New" > "Web Service"
2. Connect your GitHub repository
3. Configure:
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npx prisma migrate deploy && npm run db:seed && npm start`

**Step 3: Add Environment Variables**

Add all required environment variables including `DATABASE_URL`

**Step 4: Deploy**

Click "Create Web Service" and wait for deployment

---

## Troubleshooting

### "Can't reach database server"

**Problem:** PostgreSQL is not running

**Solutions:**

Windows:
```bash
# Check if service is running
services.msc
# Look for "postgresql-x64-15" and start it
```

Mac:
```bash
brew services restart postgresql@15
```

Linux:
```bash
sudo systemctl restart postgresql
```

### "Connection refused on port 5432"

**Problem:** PostgreSQL is not accepting connections

**Solutions:**

1. Check if PostgreSQL is running on correct port:
   ```bash
   # Windows/Mac/Linux
   psql -U postgres -h localhost -p 5432
   ```

2. Check pg_hba.conf for connection permissions
3. Verify firewall isn't blocking port 5432

### "SSL connection required"

**Problem:** Cloud database requires SSL

**Solution:**

Add `?sslmode=require` to connection string:
```bash
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

### "Database does not exist"

**Problem:** Database hasn't been created

**Solution:**

Create database manually:
```bash
psql -U postgres -c "CREATE DATABASE pixel_canvas;"
```

### "Prisma Client not initialized"

**Problem:** Prisma Client hasn't been generated

**Solution:**

```bash
npx prisma generate
```

### "Migration failed"

**Problem:** Database schema is out of sync

**Solutions:**

For development (WARNING: deletes data):
```bash
npx prisma migrate reset
```

For production (safer):
```bash
npx prisma migrate deploy
```

### "Port 3000 already in use"

**Problem:** Another process is using port 3000

**Solutions:**

Windows:
```bash
# Find process
netstat -ano | findstr :3000
# Kill process (replace PID)
taskkill /PID <PID> /F
```

Mac/Linux:
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
```

Or use different port:
```bash
PORT=3001 npm run dev
```

---

## Database Management Commands

### View All Data

```bash
# Open Prisma Studio (GUI)
npx prisma studio
```

Visit http://localhost:5555

### Reset Database

```bash
# Delete all data and re-seed
npm run db:reset
```

### Backup Database

```bash
# Dump database to file
pg_dump -U postgres pixel_canvas > backup.sql

# Restore from backup
psql -U postgres pixel_canvas < backup.sql
```

### Check Database Size

```bash
psql -U postgres -c "SELECT pg_database.datname, pg_size_pretty(pg_database_size(pg_database.datname)) AS size FROM pg_database;"
```

---

## Performance Tips

### For Local PostgreSQL

1. **Increase shared_buffers** (postgres.conf):
   ```
   shared_buffers = 256MB
   ```

2. **Enable query logging** for debugging:
   ```
   log_statement = 'all'
   ```

3. **Create indexes** for frequently queried fields (already in Prisma schema)

### For Cloud Databases

1. **Connection Pooling:**
   - Neon: Built-in pooling
   - Supabase: Use transaction mode for serverless
   - Railway: Enable connection pooling in settings

2. **Use Environment-Specific URLs:**
   ```bash
   # Development (direct connection)
   DATABASE_URL="postgresql://..."
   
   # Production (with pooling)
   DATABASE_URL="postgresql://...?pgbouncer=true"
   ```

3. **Monitor Connection Limits:**
   - Free tiers have limited concurrent connections
   - Close connections properly
   - Use Prisma's connection pooling

---

## Security Best Practices

### Local Development

1. **Use strong passwords** for postgres user
2. **Don't commit .env** file (already in .gitignore)
3. **Restrict PostgreSQL connections** to localhost

### Production

1. **Use SSL connections** (required by most cloud providers)
2. **Rotate secrets regularly**
3. **Use environment-specific credentials**
4. **Enable database backups**
5. **Monitor for suspicious activity**

### Environment Variables

Never hardcode:
- Database passwords
- API keys
- Email credentials
- Secret keys

Always use `.env` files and environment variables.

---

## Cost Considerations

### Free Tiers Comparison

| Provider | Storage | Bandwidth | Connections | Limits |
|----------|---------|-----------|-------------|---------|
| Neon | 10 GB | Unlimited | Unlimited | Good for production |
| Supabase | 500 MB | 2 GB | 60 | Good for small apps |
| ElephantSQL | 20 MB | Unlimited | 5 | Good for testing |
| Railway | $5 credit/month | Included | 100 | Pay as you grow |

### When to Upgrade

Upgrade from free tier when:
- Database exceeds storage limit
- Need more concurrent connections
- Require better performance
- Need automated backups
- Require SLA guarantees

---

## Support

For deployment issues:

1. Check this guide's troubleshooting section
2. Review platform-specific documentation
3. Check Prisma docs: https://www.prisma.io/docs
4. Create GitHub issue with deployment logs

---

**Last Updated:** December 2025

