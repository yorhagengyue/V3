# Deployment Guide - Pixel Canvas for Change

This guide covers deployment to Cloudflare's edge platform (Pages + Workers + D1).

## Prerequisites

- Cloudflare account (free tier sufficient)
- Wrangler CLI installed (`npm install -g wrangler`)
- Project built and tested locally
- Every.org API key
- Gmail app-specific password (optional, for email verification)

---

## Step 1: Prepare Environment

### 1.1 Login to Cloudflare

```bash
npx wrangler login
```

This will open a browser window for authentication.

### 1.2 Create D1 Database

```bash
cd C:\Users\gengy\Desktop\MY\BuildingBlocs
npx wrangler d1 create pixel-canvas-db
```

**Output:**
```
Created database pixel-canvas-db
Database ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Copy the `database_id` and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "pixel-canvas-db"
database_id = "paste-your-database-id-here"
```

---

## Step 2: Database Setup

### 2.1 Generate Migrations

```bash
pnpm db:generate
```

This creates migration files in `./migrations/`.

### 2.2 Run Migrations on Production

```bash
npx wrangler d1 execute pixel-canvas-db --remote --file=./migrations/0000_initial.sql
```

**Verify:**
```bash
npx wrangler d1 execute pixel-canvas-db --remote --command="SELECT name FROM sqlite_master WHERE type='table';"
```

You should see all 10 tables listed.

### 2.3 Seed Production Database

```bash
npx wrangler d1 execute pixel-canvas-db --remote --file=./db/seed.sql
```

**Verify:**
```bash
npx wrangler d1 execute pixel-canvas-db --remote --command="SELECT COUNT(*) FROM users;"
npx wrangler d1 execute pixel-canvas-db --remote --command="SELECT COUNT(*) FROM pixels;"
```

Expected: 2 users, 23 pixels

---

## Step 3: Configure Secrets

Cloudflare Workers stores sensitive data as encrypted secrets.

### 3.1 Set Every.org API Key

```bash
npx wrangler secret put EVERYORG_API_KEY
```

Enter your Every.org API key when prompted.

### 3.2 Set Gmail Credentials (Optional)

```bash
npx wrangler secret put GMAIL_USER
npx wrangler secret put GMAIL_APP_PASSWORD
```

**Note:** If not configured, the login system will still work but will return verification codes directly in the API response (dev mode).

### 3.3 Verify Secrets

```bash
npx wrangler secret list
```

You should see:
- `EVERYORG_API_KEY`
- `GMAIL_USER` (if configured)
- `GMAIL_APP_PASSWORD` (if configured)

---

## Step 4: Deploy Backend (Workers)

### 4.1 Build the Project

```bash
pnpm build
```

### 4.2 Deploy Workers

```bash
npx wrangler deploy
```

**Output:**
```
Published pixel-canvas-api
  https://pixel-canvas-api.<your-subdomain>.workers.dev
```

### 4.3 Test API Endpoints

```bash
# Health check
curl https://pixel-canvas-api.<your-subdomain>.workers.dev/health

# Get projects
curl https://pixel-canvas-api.<your-subdomain>.workers.dev/api/projects
```

Expected: JSON response with project data

---

## Step 5: Deploy Frontend (Pages)

### 5.1 Deploy to Cloudflare Pages

```bash
npx wrangler pages deploy ./build/client --project-name=pixel-canvas
```

**First-time setup:**
- Choose a project name (e.g., `pixel-canvas`)
- Select production branch: `main`

**Output:**
```
Deploying to Cloudflare Pages...
  https://pixel-canvas.pages.dev
```

### 5.2 Configure Pages Environment Variables

Go to Cloudflare Dashboard → Pages → pixel-canvas → Settings → Environment Variables

Add:
- **Name**: `API_URL`
- **Value**: `https://pixel-canvas-api.<your-subdomain>.workers.dev`
- **Environment**: Production

**Redeploy after adding variables:**
```bash
npx wrangler pages deploy ./build/client --project-name=pixel-canvas
```

---

## Step 6: Custom Domain (Optional)

### 6.1 Add Custom Domain to Pages

1. Go to Cloudflare Dashboard → Pages → pixel-canvas → Custom Domains
2. Click "Set up a custom domain"
3. Enter your domain (e.g., `pixelcanvas.yourdomain.com`)
4. Cloudflare will automatically configure DNS

### 6.2 Add Custom Domain to Workers

1. Go to Workers → pixel-canvas-api → Triggers → Custom Domains
2. Add your API subdomain (e.g., `api.pixelcanvas.yourdomain.com`)

### 6.3 Update API_URL in Pages

Update the `API_URL` environment variable in Pages settings to use your custom domain.

---

## Step 7: Post-Deployment Testing

### 7.1 Test Authentication

1. Visit your deployed site
2. Click "Login"
3. Enter email and request verification code
4. Check if code is received (or shown in API response if Gmail not configured)
5. Verify and login

### 7.2 Test Canvas Functionality

1. Navigate to a project
2. Simulate a $10 donation
3. Verify you receive 10 pixels
4. Select a color and place a pixel
5. Verify cooldown activates (5 minutes)
6. Check leaderboard

### 7.3 Test API Performance

```bash
# Measure response times
curl -w "@curl-format.txt" -o /dev/null -s https://your-api.workers.dev/api/projects
```

Expected: < 500ms response time globally

---

## Monitoring & Logs

### View Logs

```bash
# Workers logs
npx wrangler tail

# Pages logs
npx wrangler pages tail pixel-canvas
```

### Cloudflare Dashboard

1. **Analytics**: Workers → Analytics → pixel-canvas-api
   - Requests per second
   - Error rate
   - Latency

2. **D1 Metrics**: Storage → D1 → pixel-canvas-db
   - Query count
   - Database size

3. **Pages Metrics**: Pages → pixel-canvas → Analytics
   - Page views
   - Bandwidth usage

---

## Rollback Procedure

### Rollback Workers

```bash
# List deployments
npx wrangler deployments list

# Rollback to previous version
npx wrangler rollback <deployment-id>
```

### Rollback Pages

1. Go to Cloudflare Dashboard → Pages → pixel-canvas → Deployments
2. Find previous successful deployment
3. Click "..." → "Rollback to this deployment"

### Rollback Database

**IMPORTANT:** D1 migrations are not easily reversible. Always:
1. Backup before major changes:
   ```bash
   npx wrangler d1 execute pixel-canvas-db --remote --command="SELECT * FROM projects" > backup.sql
   ```
2. Test migrations locally first
3. Have a rollback migration ready

---

## Troubleshooting

### Issue: 500 Error on API Calls

**Cause:** Database binding not configured

**Fix:**
```bash
# Check wrangler.toml has correct database_id
npx wrangler d1 list
```

Update `wrangler.toml` and redeploy.

---

### Issue: "Invalid session" Error

**Cause:** Session IDs not persisting, possibly due to localStorage issues

**Fix:**
- Check browser localStorage permissions
- Verify API endpoint returns correct session data
- Check CORS configuration in `src/index.ts`

---

### Issue: Pixels Not Appearing

**Cause:** Possible database read/write issue

**Fix:**
```bash
# Check database
npx wrangler d1 execute pixel-canvas-db --remote --command="SELECT COUNT(*) FROM pixels;"

# Check API response
curl https://your-api.workers.dev/api/projects/your-project-id
```

---

### Issue: Gmail Verification Not Working

**Cause:** Gmail credentials not configured or incorrect

**Solutions:**
1. **Option A** (Development): Leave credentials empty, system will return code in API response
2. **Option B** (Production): Configure Gmail app-specific password:
   - Enable 2FA on Gmail account
   - Generate app-specific password: https://myaccount.google.com/apppasswords
   - Set secrets:
     ```bash
     npx wrangler secret put GMAIL_USER
     npx wrangler secret put GMAIL_APP_PASSWORD
     ```

---

## Performance Optimization

### Enable Caching

Add caching headers to static API responses:

```typescript
// In src/index.ts
app.get('/api/projects', async (c) => {
  c.header('Cache-Control', 'public, max-age=60'); // Cache for 1 minute
  // ... rest of code
});
```

### Optimize Database Queries

Create indexes for frequently queried fields:

```sql
-- In migrations
CREATE INDEX idx_pixels_project ON pixels(project_id);
CREATE INDEX idx_pixels_position ON pixels(project_id, position_x, position_y);
CREATE INDEX idx_user_tokens ON user_tokens(user_id, project_id);
```

### Use Cloudflare Images (Future)

For user-uploaded images, integrate Cloudflare Images:
- Automatic optimization
- WebP conversion
- Resize on-demand

---

## Scaling Considerations

### Current Limits (Free Tier)

- **Workers**: 100,000 requests/day
- **D1**: 5 GB storage, 5 million reads/day
- **Pages**: Unlimited bandwidth (fair use)

### If You Exceed Limits

1. **Upgrade to Paid Plan**
   - Workers: $5/month for 10 million requests
   - D1: Pay-as-you-go beyond free tier

2. **Optimize**
   - Implement aggressive caching
   - Use pagination for large datasets
   - Compress API responses

3. **Monitor**
   ```bash
   # Check usage
   npx wrangler dev --remote # Shows real-time metrics
   ```

---

## Security Checklist

- [ ] All secrets configured via `wrangler secret put`
- [ ] `.dev.vars` added to `.gitignore`
- [ ] CORS configured correctly (only allow your domain in production)
- [ ] Input validation on all API endpoints
- [ ] SQL injection prevention (using Drizzle ORM parameterized queries)
- [ ] Rate limiting considered (Cloudflare Workers Rate Limiting)
- [ ] Session tokens expire appropriately

---

## Maintenance Tasks

### Weekly

- [ ] Check error logs: `npx wrangler tail`
- [ ] Monitor database size: D1 Dashboard
- [ ] Review API analytics

### Monthly

- [ ] Backup database:
  ```bash
  npx wrangler d1 execute pixel-canvas-db --remote --command=".dump" > backup-$(date +%Y%m%d).sql
  ```
- [ ] Update dependencies: `pnpm update`
- [ ] Review Cloudflare billing

### As Needed

- [ ] Rotate secrets (especially if exposed)
- [ ] Update Every.org API key (if changed)
- [ ] Apply security patches

---

## Cost Estimate

### Free Tier (Sufficient for Hackathon)

- Workers: $0 (up to 100k requests/day)
- D1: $0 (up to 5 GB storage)
- Pages: $0 (unlimited)
- **Total**: $0/month

### Production (Moderate Traffic)

- Workers: $5/month (10M requests)
- D1: $0-5/month (depends on reads/writes)
- Pages: $0
- Custom domain: $0 (if using Cloudflare DNS)
- **Total**: ~$5-10/month

---

## Support

For deployment issues:
- Cloudflare Docs: https://developers.cloudflare.com
- Cloudflare Discord: https://discord.gg/cloudflaredev
- Drizzle Docs: https://orm.drizzle.team
- Every.org Support: support@every.org

---

## Conclusion

Your Pixel Canvas for Change app is now deployed globally on Cloudflare's edge network!

- **Frontend**: Served from 200+ datacenters worldwide
- **API**: Sub-100ms response times globally
- **Database**: Replicated and cached at the edge

**Next Steps:**
1. Share your deployment URL
2. Monitor analytics
3. Gather user feedback
4. Iterate and improve

**Deployed URLs:**
- Frontend: `https://pixel-canvas.pages.dev`
- API: `https://pixel-canvas-api.<subdomain>.workers.dev`

---

**Deployment Version**: 1.0.0
**Last Updated**: 2025-12-11
**Status**: Production Ready
