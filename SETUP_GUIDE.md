# MyBillBook - Complete Setup & Implementation Guide

## 📋 Project Overview

MyBillBook is a **global billing & inventory SaaS application** built with:
- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL (via Supabase)
- **Auth:** JWT + bcrypt
- **Features:** Invoicing, inventory management, expense tracking, reports

---

## 🚀 Quick Start (5 minutes)

### 1. Frontend Setup

```bash
# Install dependencies
npm install

# Create .env.local (copy from .env.example)
cp .env.example .env.local

# Edit .env.local and set:
VITE_API_URL=http://localhost:5000/api

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173`

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create .env (copy from .env.example)
cp .env.example .env

# Edit .env with your Supabase credentials
# See BACKEND_SETUP.md for detailed instructions

# Start development server
npm run dev
```

Backend runs on `http://localhost:5000`

---

## 🗄️ Database Setup (Supabase - Recommended)

### Option 1: Cloud Supabase (Easiest)

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Click "New Project"
   - Fill in project details
   - Wait 2-3 minutes for creation

2. **Get Credentials**
   - Go to Project Settings → API
   - Copy:
     - `Project URL` → `SUPABASE_URL` in `.env`
     - `anon public` → `SUPABASE_KEY` in `.env`
     - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` in `.env`

3. **Create Tables**
   - Go to SQL Editor in Supabase dashboard
   - Create new query
   - Copy contents of `server/database_schema.sql`
   - Run the query

### Option 2: Local PostgreSQL

```bash
# Install PostgreSQL
# macOS: brew install postgresql@15
# Ubuntu: sudo apt install postgresql
# Windows: https://www.postgresql.org/download/windows/

# Create database
createdb mybillbook

# Run schema
psql mybillbook < server/database_schema.sql

# Update .env to use local database
SUPABASE_URL=postgres://localhost:5432/mybillbook
```

---

## 🔐 Authentication Flow

### User Registration
1. User enters email + password + business details
2. Frontend: `POST /api/auth/register`
3. Backend:
   - Validates input with Zod
   - Hashes password with bcrypt
   - Creates user in database
   - Creates business for user
   - Returns JWT tokens
4. Frontend stores tokens:
   - `accessToken` in memory (15 min expiry)
   - `refreshToken` in localStorage (30 day expiry)

### User Login
1. User enters email + password
2. Frontend: `POST /api/auth/login`
3. Backend:
   - Finds user by email
   - Verifies password with bcrypt
   - Returns JWT tokens
4. Frontend stores tokens

### API Requests
All protected endpoints require:
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

### Token Refresh
When access token expires:
1. Frontend calls `POST /api/auth/refresh` with refreshToken
2. Backend returns new accessToken
3. Frontend retries original request

---

## 📱 Frontend Integration

### API Client (Already Created)
File: `src/api/client.js`

```javascript
import { 
  productsApi, 
  customersApi, 
  invoicesApi,
  paymentsApi,
  expensesApi,
  reportsApi
} from '@/api/client';

// Get all products
const products = await productsApi.getAll();

// Create invoice
const invoice = await invoicesApi.create({
  customerId: 'xxx',
  invoiceNo: 'INV-001',
  items: [...]
});
```

### Update AppContext.jsx
Replace mock data with API calls:

```javascript
// OLD: Mock data
// const [products, setProducts] = useState(mockProducts);

// NEW: API integration
useEffect(() => {
  const loadData = async () => {
    try {
      const [products, customers, invoices] = await Promise.all([
        productsApi.getAll(),
        customersApi.getAll(),
        invoicesApi.getAll(),
      ]);
      setProducts(products);
      setCustomers(customers);
      setInvoices(invoices);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };
  
  if (authToken) loadData();
}, [authToken]);
```

---

## 📊 API Endpoints Summary

### Authentication
```
POST   /api/auth/register           Create account
POST   /api/auth/login              Login account
POST   /api/auth/refresh            Refresh token
```

### Products
```
GET    /api/products                List all
GET    /api/products/:id            Get one
POST   /api/products                Create
PUT    /api/products/:id            Update
DELETE /api/products/:id            Delete
```

### Customers
```
GET    /api/customers               List all (with balance)
GET    /api/customers/:id           Get one
POST   /api/customers               Create
PUT    /api/customers/:id           Update
DELETE /api/customers/:id           Delete
```

### Invoices
```
GET    /api/invoices                List all
GET    /api/invoices/:id            Get one (with details & payments)
POST   /api/invoices                Create
PUT    /api/invoices/:id            Update status
DELETE /api/invoices/:id            Delete
```

### Payments
```
GET    /api/payments/invoice/:id    Get payments for invoice
POST   /api/payments                Create (auto-updates invoice)
DELETE /api/payments/:id            Delete (refunds invoice)
```

### Expenses
```
GET    /api/expenses                List (supports date filter)
POST   /api/expenses                Create
PUT    /api/expenses/:id            Update
DELETE /api/expenses/:id            Delete
```

### Business
```
GET    /api/business                Get profile
PUT    /api/business                Update profile
GET    /api/business/stats/overview Get dashboard stats
```

### Quotations
```
GET    /api/quotations              List all
GET    /api/quotations/:id          Get one
POST   /api/quotations              Create
PUT    /api/quotations/:id          Update status
POST   /api/quotations/:id/convert  Convert to invoice
DELETE /api/quotations/:id          Delete
```

### Credit/Debit Notes
```
GET    /api/notes/credit            List credit notes
POST   /api/notes/credit            Create credit note
GET    /api/notes/debit             List debit notes
POST   /api/notes/debit             Create debit note
```

### Reports
```
GET    /api/reports/sales           Sales by product & customer
GET    /api/reports/profitloss      P&L statement
GET    /api/reports/inventory       Inventory valuation
GET    /api/reports/customers       Customer revenue report
```

---

## 🎯 Implementation Checklist

### Phase 1: Backend Foundation ✅ DONE
- [x] Express server setup
- [x] Supabase/PostgreSQL integration
- [x] JWT authentication
- [x] CRUD endpoints for all resources
- [x] Input validation (Zod)
- [x] Error handling middleware
- [x] Database schema with indexes

### Phase 2: Frontend Integration 🔄 IN PROGRESS
- [ ] Update AppContext.jsx to use API
- [ ] Update all pages to fetch real data
- [ ] Add loading states & error handling
- [ ] Store tokens in localStorage/sessionStorage
- [ ] Implement auth guard for protected routes
- [ ] Connect forms to POST/PUT endpoints
- [ ] Add toast notifications for actions

### Phase 3: Missing Features
- [ ] PDF invoice generation (Puppeteer)
- [ ] Email notifications (Resend/SendGrid)
- [ ] Search & filtering across all pages
- [ ] Date range picker for reports
- [ ] Pagination for large datasets
- [ ] Multi-business support
- [ ] User role management
- [ ] Activity logging

### Phase 4: Polish & Deployment
- [ ] Form validation & error messages
- [ ] Loading spinners & skeletons
- [ ] Mobile-responsive design
- [ ] Performance optimization
- [ ] Security review (CORS, headers, etc.)
- [ ] Deploy backend (Railway/Render)
- [ ] Deploy frontend (Vercel)
- [ ] Domain & SSL setup
- [ ] Monitoring & logging

---

## 🛠️ Development Workflow

### Start Both Servers
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
cd server && npm run dev
```

### Making Changes
1. **Backend change** → API automatically resets
2. **Frontend change** → Page automatically reloads (HMR)

### Debugging
- **Frontend:** F12 (DevTools) → Console/Network tabs
- **Backend:** Check terminal output + server logs
- **Database:** Use Supabase dashboard SQL editor

### Testing API Manually
```bash
# Test health check
curl http://localhost:5000/api/health

# Test register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","businessName":"My Business","ownerName":"John"}'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 📦 Project Structure

```
MYBILLBOOK/
├── src/                          # Frontend React app
│   ├── api/
│   │   └── client.js            # API client (CREATED)
│   ├── components/              # React components
│   ├── pages/                   # Page components
│   ├── context/                 # AppContext
│   ├── App.jsx
│   └── main.jsx
├── server/                      # Backend Node.js
│   ├── config/
│   │   └── supabase.js         # Supabase config
│   ├── middleware/
│   │   └── auth.js             # JWT middleware
│   ├── routes/                 # API endpoints
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── customers.js
│   │   ├── invoices.js
│   │   ├── payments.js
│   │   ├── expenses.js
│   │   ├── quotations.js
│   │   ├── notes.js
│   │   ├── business.js
│   │   └── reports.js
│   ├── database_schema.sql      # PostgreSQL schema
│   ├── .env.example
│   ├── BACKEND_SETUP.md
│   └── index.js
├── .env.example                 # Frontend env vars
├── vite.config.js
├── package.json
└── README.md
```

---

## 🚢 Deployment

### Backend Deployment (Railway.app)
1. Push code to GitHub
2. Go to railway.app → New Project
3. Connect GitHub repo
4. Add PostgreSQL service
5. Deploy automatically on push

### Frontend Deployment (Vercel)
1. Push code to GitHub
2. Go to vercel.com → Import Project
3. Select GitHub repo
4. Set env var: `VITE_API_URL=https://your-api.railway.app/api`
5. Deploy

### Database Deployment
Already on Supabase (cloud-hosted) — no additional steps needed!

---

## 🔗 Quick Links

- [Supabase Docs](https://supabase.com/docs)
- [Express.js Docs](https://expressjs.com)
- [Zod Validation](https://zod.dev)
- [JWT.io](https://jwt.io)
- [Railway Hosting](https://railway.app)
- [Vercel Hosting](https://vercel.com)

---

## ❓ Troubleshooting

### "Cannot reach backend"
- Check backend is running: `http://localhost:5000/api/health`
- Check `VITE_API_URL` in frontend .env
- Check CORS configuration in server

### "Database connection failed"
- Verify Supabase credentials in `.env`
- Check internet connection
- Test connection: `npm run dev` in server folder

### "Invalid token error"
- Tokens expire after 15 minutes
- The API client auto-refreshes them
- If still failing, use refresh endpoint manually

### "Port already in use"
```bash
# Find process using port
lsof -i :5000          # Backend
lsof -i :5173          # Frontend

# Kill process
kill -9 <PID>
```

---

## 📝 Next Tasks

1. ✅ Setup backend API ← JUST COMPLETED
2. ⏳ **UPDATE FRONTEND TO USE API ENDPOINTS**
3. ⏳ Add PDF invoice generation
4. ⏳ Add email notification service
5. ⏳ Deploy to production

**Start with task #2:** Update `src/context/AppContext.jsx` to fetch data from the backend API instead of using mock data.
