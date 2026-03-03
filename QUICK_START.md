# 🚀 MyBillBook - Quick Start (Next 10 Minutes)

## What You Need to Do

### Step 1: Create Supabase Account (2 min)
1. Go to https://supabase.com
2. Sign up with your account
3. Create a new project ("MyBillBook")
4. Wait for initialization ⏳

### Step 2: Get Credentials (1 min)
From Supabase Dashboard → Settings → API:
- Copy **Project URL** 
- Copy **anon public key**
- Copy **service_role key**

### Step 3: Update Backend .env (1 min)
Edit `/server/.env`:
```
SUPABASE_URL=your-url-here
SUPABASE_KEY=your-anon-key-here  
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Step 4: Create Database Schema (2 min)
1. In Supabase: SQL Editor → New Query
2. Copy all code from `/server/database_schema.sql`
3. Paste into Supabase → Run
4. Wait for ✅ success

### Step 5: Start Backend (1 min)
```bash
cd /Users/utsavlamsal/Documents/MYBILLBOOK/server
npm run dev
```

Should see:
```
🚀 MyBillBook API Server running on http://localhost:5000
```

### Step 6: Start Frontend (1 min)
In new terminal:
```bash
cd /Users/utsavlamsal/Documents/MYBILLBOOK
npm run dev
```

Opens: http://localhost:5173

### Step 7: Test Sign Up (1 min)
1. Click "Create free account"
2. Enter your email, password, name, business name
3. Should see "Account created successfully!" ✅
4. Auto-login to dashboard

### Step 8: Test Core Features (3 min)
- **Inventory**: Add a product ✅
- **Customers**: Add a customer ✅  
- **Billing**: Create an invoice ✅
- **Payments**: Record a payment ✅

---

## Detailed Help

See `/SUPABASE_SETUP.md` in project root for:
- Complete step-by-step guide
- Troubleshooting & error fixes
- Architecture explanation
- Deployment steps

---

## API Health Check

Once backend is running:
- **API Status**: http://localhost:5000/api/health
- Should return: `{"status":"OK"}`

---

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend won't start | Check `.env` has Supabase credentials |
| "No tables found" error | Run database schema in Supabase SQL editor |
| Login fails | Verify user was created in Supabase Auth |
| Data not saving | Check browser F12 console for errors |

**More help?** Check `/SUPABASE_SETUP.md` Troubleshooting section
