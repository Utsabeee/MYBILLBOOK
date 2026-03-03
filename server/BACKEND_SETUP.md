# MyBillBook Backend Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Then edit `.env` and update these critical values:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-super-secret-key
FRONTEND_URL=http://localhost:5173
```

### 3. Set Up Supabase Database

#### Option A: Create Supabase Project (Recommended - Free!)
1. Go to https://supabase.com
2. Click "New Project"
3. Fill in:
   - Project name: `mybillbook`
   - Database password: [create strong password]
   - Region: [closest to your users]
4. Wait for project creation (2-3 minutes)
5. Go to Project Settings → API → Copy:
   - `anon public key` → `SUPABASE_KEY`
   - Project URL → `SUPABASE_URL`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`

#### Option B: Run Schema Locally (PostgreSQL Setup)
If you prefer local PostgreSQL:
```bash
# Install PostgreSQL (if not already installed)
# macOS: brew install postgresql@15
# Windows: https://www.postgresql.org/download/windows/
# Linux: sudo apt install postgresql

# Start PostgreSQL
# macOS: brew services start postgresql@15
# Linux: sudo systemctl start postgresql

# Create database
createdb mybillbook

# Run schema
psql mybillbook < database_schema.sql
```

### 4. Start Development Server
```bash
npm run dev
```

Server will run on `http://localhost:5000`

Health check: `http://localhost:5000/api/health`

---

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` — Create new account
- `POST /api/auth/login` — Login user
- `POST /api/auth/refresh` — Refresh access token

### Products
- `GET /api/products` — List all products
- `GET /api/products/:id` — Get single product
- `POST /api/products` — Create product
- `PUT /api/products/:id` — Update product
- `DELETE /api/products/:id` — Delete product

### Customers
- `GET /api/customers` — List all customers
- `GET /api/customers/:id` — Get single customer (with balance)
- `POST /api/customers` — Create customer
- `PUT /api/customers/:id` — Update customer
- `DELETE /api/customers/:id` — Delete customer

### Invoices
- `GET /api/invoices` — List all invoices
- `GET /api/invoices/:id` — Get single invoice (with details)
- `POST /api/invoices` — Create invoice
- `PUT /api/invoices/:id` — Update invoice status
- `DELETE /api/invoices/:id` — Delete invoice

### Payments
- `GET /api/payments/invoice/:invoiceId` — Get payments for invoice
- `POST /api/payments` — Record payment (auto-updates invoice status)
- `DELETE /api/payments/:id` — Delete payment (refunds invoice)

### Expenses
- `GET /api/expenses` — List expenses (supports date filtering)
- `POST /api/expenses` — Create expense
- `PUT /api/expenses/:id` — Update expense
- `DELETE /api/expenses/:id` — Delete expense

### Business
- `GET /api/business` — Get business profile
- `PUT /api/business` — Update business profile
- `GET /api/business/stats/overview` — Get business stats

### Reports
- `GET /api/reports/sales` — Sales by product & customer
- `GET /api/reports/profitloss` — Profit & Loss statement
- `GET /api/reports/inventory` — Inventory valuation
- `GET /api/reports/customers` — Customer revenue & outstanding

All protected endpoints require:
```
Authorization: Bearer <accessToken>
```

---

## 🔐 Authentication Flow

1. User registers with email + password
2. Server:
   - Hashes password with bcrypt
   - Creates user in database
   - Creates business for user
   - Returns JWT tokens
3. Frontend stores tokens:
   - `accessToken` in memory (15 min expiry)
   - `refreshToken` in localStorage (30 day expiry)
4. Include in requests:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiI...
   ```
5. If access token expires, use refresh endpoint to get new token

---

## 📦 Database Schema

**Users**
- id, email, password_hash, owner_name, created_at, updated_at

**Businesses**
- id, user_id, name, phone, email, address, tax_id, currency, logo_url, etc.

**Products**
- id, business_id, name, code, category, unit, sale_price, purchase_price, stock, tax_rate

**Customers**
- id, business_id, name, phone, email, tax_id, address, type (B2B/B2C), color_idx

**Invoices**
- id, business_id, customer_id, invoice_no, date, due_date, items_json, subtotal, tax_amount, discount, total, paid, status

**Payments**
- id, invoice_id, amount, method, date, note

**Expenses**
- id, business_id, category, amount, date, description, vendor

**Stock Logs**
- id, product_id, type (sale/purchase/adjustment), quantity, date

**Tax Rates**
- id, business_id, name, rate, is_compound

---

## 🚨 Common Issues

### "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js
```

### "Invalid or expired token"
- Check if JWT_SECRET matches between `.env` and code
- Ensure token hasn't expired (15 min for access token)
- Use refresh token to get new access token

### "CORS error"
- Update FRONTEND_URL in `.env` to match your frontend URL
- Ensure it's exactly: `http://localhost:5173` (for dev)

### Supabase connection fails
- Verify SUPABASE_URL and SUPABASE_KEY are correct
- Check that Supabase project is active
- Try health endpoint: `http://localhost:5000/api/health`

---

## 🔄 Next Steps

1. **Connect Frontend** → Update AppContext.jsx to use these API endpoints
2. **Add PDF Generation** → Implement invoice PDF downloads
3. **Add Email Notifications** → Send invoice reminders via Resend/SendGrid
4. **Deploy Backend** → Railway.app or Render
5. **Deploy Frontend** → Vercel

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com)
- [Supabase Documentation](https://supabase.com/docs)
- [Zod Validation](https://zod.dev)
- [JWT.io](https://jwt.io)
