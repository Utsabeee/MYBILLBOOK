# MyBillBook Production Deployment Guide

## Overview
This document covers deploying MyBillBook to production using Railway (backend) and Vercel (frontend).

## Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     Production Environment                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend (Vercel)              Backend (Railway)            │
│  mybillbook.vercel.app    ←→    mybillbook-api.railway.app  │
│  React + Vite                    Express.js + Supabase      │
│  Port: 443/80                    Port: 8080                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    Supabase PostgreSQL
                    (Shared Database)
```

## Prerequisites
1. Railway account (https://railway.app)
2. Vercel account (https://vercel.com)
3. Supabase account (already configured)
4. GitHub account (for easy deployment)

## Backend Deployment (Railway)

### Step 1: Prepare Backend
```bash
cd server
npm install
npm run build  # if needed
```

### Step 2: Deploy to Railway

**Option A: Using Railway CLI**
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

**Option B: Using GitHub (Recommended)**
1. Push code to GitHub
2. Go to https://railway.app
3. Click "New Project" → "Deploy from GitHub"
4. Select the MYBILLBOOK repository
5. Configure environment variables:
   - SUPABASE_URL
   - SUPABASE_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - JWT_SECRET (generate new random string)
   - JWT_EXPIRE=15m
   - JWT_REFRESH_EXPIRE=30d
   - NODE_ENV=production
   - FRONTEND_URL=https://mybillbook.vercel.app

### Step 3: Configure Railway
1. Set "Build Command": `npm install`
2. Set "Start Command": `node index.js`
3. Set "PORT": 8080
4. Add all environment variables from .env.production

### Step 4: Note Railway URL
After deployment, Railway will assign: `https://mybillbook-api.railway.app`

## Frontend Deployment (Vercel)

### Step 1: Prepare Frontend
```bash
npm run build
# Verify dist folder is created
```

### Step 2: Deploy to Vercel

**Option A: Using Vercel CLI**
```bash
npm install -g vercel
vercel
```

**Option B: Using GitHub (Recommended)**
1. Go to https://vercel.com
2. Click "New Project"
3. Import the MYBILLBOOK GitHub repository
4. Configure environment variables:
   - `VITE_API_URL=https://mybillbook-api.railway.app/api`
5. Click "Deploy"

### Step 3: Configure Vercel
1. Environment: Production
2. Route: Root directory
3. Build command: `npm run build`
4. Output directory: `dist`

### Step 4: Note Vercel URL
After deployment, Vercel will assign: `https://mybillbook.vercel.app`

## Post-Deployment Configuration

### 1. Update Backend CORS
In `server/index.js`, update CORS configuration:
```javascript
cors({
  origin: ['https://mybillbook.vercel.app', 'http://localhost:5173'],
  credentials: true
})
```

### 2. Update Frontend API URL
In `src/api/client.js`, update:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://mybillbook-api.railway.app/api';
```

### 3. Test Production Endpoints
```bash
# Test backend
curl https://mybillbook-api.railway.app/health

# Test signup
curl -X POST https://mybillbook-api.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","businessName":"Test","ownerName":"Owner"}'
```

### 4. Update Supabase CORS
Go to Supabase dashboard → API → CORS headers:
```
https://mybillbook.vercel.app
https://mybillbook-api.railway.app
```

## Monitoring & Maintenance

### Railway Dashboard
- Monitor logs: Dashboard → Logs
- View metrics: Dashboard → Metrics
- Update environment: Settings → Variables

### Vercel Dashboard
- Monitor deployments: Deployments
- View analytics: Analytics
- Manage domains: Settings → Domains

## Troubleshooting

### Backend fails to start
- Check logs in Railway dashboard
- Verify Supabase credentials
- Ensure JWT_SECRET is set
- Check Node.js version (should be 18+)

### Frontend shows API errors
- Check VITE_API_URL environment variable
- Verify CORS settings in backend
- Check browser console for error details

### Database connection issues
- Verify SUPABASE_URL and keys
- Check Supabase database status
- Ensure RLS policies are properly configured

## Rollback

### Railway
1. Go to Dashboard → Deployments
2. Select previous deployment
3. Click "Redeploy"

### Vercel
1. Go to Deployments
2. Select previous deployment
3. Click "Redeploy"

## Scaling & Performance

### Database
- Monitor Supabase storage and connections
- Add indexes for frequently queried fields
- Enable query caching

### Backend
- Monitor Railway CPU and memory usage
- Scale up if needed: Settings → Deployer → Instance Type
- Consider caching with Redis

### Frontend
- Vercel automatically scales
- Enable ISR (Incremental Static Regeneration) if using Next.js
- Optimize images and bundles

## Security Checklist

- [ ] JWT_SECRET is random and secure
- [ ] SUPABASE_SERVICE_ROLE_KEY only in backend
- [ ] Environment variables not committed to git
- [ ] CORS properly configured
- [ ] RLS policies enabled on sensitive tables
- [ ] Rate limiting enabled on API endpoints
- [ ] HTTPS enforced (automatic on Railway/Vercel)
- [ ] Database backups configured

## CI/CD Pipeline

### GitHub Actions (Optional Setup)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run build
      - run: npm test
      - uses: railway-app/action@main
        with:
          token: ${{ secrets.RAILWAY_TOKEN }}
```

## Support

For issues:
- Railway support: https://railway.app/help
- Vercel documentation: https://vercel.com/docs
- Supabase docs: https://supabase.com/docs
