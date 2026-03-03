# MyBillBook - Complete Setup Guide (Supabase + Backend + Frontend)

## Step 1: Create & Configure Supabase (5 minutes)

### 1.1 Create Supabase Account
1. Go to https://supabase.com
2. Click "Start your project" → Sign up with GitHub/Google/Email
3. Create a new organization or use existing one
4. Create a new project:
   - **Name**: MyBillBook
   - **Database Password**: Choose a strong password (save it)
   - **Region**: Choose closest to you (Singapore, US East, EU, etc.)
5. Wait for project to initialize (2-3 minutes)

### 1.2 Get Your Credentials
Once project is ready:
1. Go to **Project Settings** (bottom left) → **API**
2. Copy these values:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** (under API keys) → `SUPABASE_KEY`
   - **service_role** (under API keys) → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ KEEP SECRET)

Example:
```
SUPABASE_URL=https://abcdefg123456.supabase.co
SUPABASE_KEY=eyJhbGc... (long anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (long service role key)
```

### 1.3 Create Database Schema
1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open `/server/database_schema.sql` file from your project
4. Copy ALL the SQL code
5. Paste into Supabase SQL editor
6. Click **Run** button
7. Wait for success message ✅

Expected tables created:
- users
- businesses
- products
- customers
- invoices
- payments
- expenses
- stock_logs
- quotations
- credit_notes
- debit_notes
- purchase_orders
- tax_rates

---

## Step 2: Configure Backend (2 minutes)

### 2.1 Update Backend .env
Open `/server/.env` and replace with your Supabase credentials:

```dotenv
# Supabase Configuration
SUPABASE_URL=https://your-actual-project.supabase.co
SUPABASE_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key

# JWT Configuration (keep as is for development)
JWT_SECRET=mybillbook-super-secret-key-change-in-production-12345
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=30d

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 2.2 Start Backend Server
```bash
cd /path/to/MYBILLBOOK/server
npm run dev
```

Expected output:
```
✅ Supabase connected!
🚀 Server running on http://localhost:5000
```

---

## Step 3: Configure Frontend (1 minute)

### 3.1 Check Frontend .env
Verify `/Users/utsavlamsal/Documents/MYBILLBOOK/.env` has:
```dotenv
VITE_API_URL=http://localhost:5000/api
```

---

## Step 4: Test the Full Integration (5 minutes)

### 4.1 Start Frontend
```bash
cd /path/to/MYBILLBOOK
npm run dev
```

Opens on: http://localhost:5173

### 4.2 Test Authentication Flow

**Sign Up:**
1. Click "Create free account"
2. Fill in:
   - Full Name: John Doe
   - Mobile: +1234567890
   - Email: test@example.com
   - Password: Test123!
3. Step 2: Business Name = "My Store"
4. Click "Create Account"
5. Should see success message ✅

**Sign In:**
1. Use email: test@example.com
2. Use password: Test123!
3. Should land on Dashboard ✅

### 4.3 Test CRUD Operations

**Add Product:**
1. Go to **Inventory**
2. Click "+ Add Product"
3. Fill:
   - Name: "Test Product"
   - Sale Price: 100
   - Purchase Price: 50
   - Stock: 10
   - Min Stock: 5
4. Click Save
5. Should appear in product list ✅

**Add Customer:**
1. Go to **Customers**
2. Click "+ Add Customer"
3. Fill:
   - Name: "Test Customer"
   - Phone: 9841234567
   - Email: customer@test.com
4. Click Save
5. Should appear in customer list ✅

**Create Invoice:**
1. Go to **Billing**
2. Click "+ New Invoice"
3. Select customer: "Test Customer"
4. Add item: Select "Test Product" → Qty: 2
5. Should auto-calculate total: 200 (2 × 100)
6. Click Save
7. Should appear in invoice list ✅

**Record Payment:**
1. Click payment icon on invoice
2. Enter amount: 200
3. Click "Record Payment"
4. Invoice status should change to "Paid" ✅

---

## Troubleshooting

### Backend won't start
**Problem**: "Supabase connected!" doesn't appear
**Solution**: 
- Check .env file has correct credentials
- Verify database schema was created in Supabase
- Check: `npm run dev` shows error message

### Login fails
**Problem**: "Invalid email or password" even with correct credentials
**Solution**: 
- Check user was created: Supabase → Auth → Users
- Verify backend is running on port 5000
- Check browser console (F12) for error messages

### Products/invoices not saving
**Problem**: Click Save but item doesn't appear in list
**Solution**:
- Check network tab in browser (F12)
- Should see POST request to http://localhost:5000/api/products
- If 500 error, check backend console for detailed error
- Verify Supabase table has correct schema

### Can't see data from previous accounts
**Problem**: Signed in, but no products/customers shown
**Solution**: 
- Each user/business is isolated
- Products created by user A not visible to user B
- Add sample data in Settings → Sample Invoices

---

## Next Steps

Once everything works locally:

1. **PDF Generation** (Optional)
   - Puppeteer is installed
   - Create `/api/invoices/:id/pdf` endpoint
   
2. **Email Notifications** (Optional)
   - Set up Resend.com account
   - Add RESEND_API_KEY to .env
   - Create email routes

3. **Production Deployment**
   - Deploy backend to Railway.app
   - Deploy frontend to Vercel
   - Update VITE_API_URL to production URL
   - Enable RLS policies in Supabase

---

## Key Architecture

```
Frontend (React + Vite)
    ↓
API Client (/src/api/client.js)
    ↓ HTTP with JWT tokens
Backend (Express.js on port 5000)
    ↓
Supabase (PostgreSQL)
```

**Authentication Flow:**
1. User signs up → Backend hashes password with bcrypt
2. Backend creates user in Supabase.users
3. Backend generates JWT tokens (15min access + 30day refresh)
4. Frontend stores tokens in localStorage
5. Frontend sends JWT in Authorization header for all requests
6. Backend verifies JWT before allowing database access

**Data Isolation:**
- Every user has a business_id
- All tables filtered by business_id in backend queries
- Users from Business A cannot see Business B's data
- Multi-tenant SaaS architecture ✅

---

**Questions?** Check the browser console (F12) and backend terminal for error messages!
