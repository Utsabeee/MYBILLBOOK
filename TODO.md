# MyBillBook — Production Roadmap & TODO
> **Version:** 2.0 Pre-Release  
> **Last Updated:** 2026-02-27  
> **Goal:** A globally usable billing & inventory SaaS — Nepal, India, South Asia, Africa, Southeast Asia, and beyond.

---

## 🌍 Global-First Changes (Priority: CRITICAL)

The app was initially built with India-specific assumptions. These must be changed before any serious launch.

### Internationalization (i18n) — Remove Indian-Only Features
- [x] **Remove GSTIN** — Replace with a generic "Tax ID / VAT Number / Business Registration No." field that works worldwide
- [x] **Remove GST slab references** (0%/5%/12%/18%/28%) — Replace with a **custom tax rate system** where the user defines their own tax rates, names (VAT, Sales Tax, Service Tax, SST, etc.), and percentages
- [x] **Remove CGST / SGST split** in invoice — Replace with a flexible tax breakdown the user configures
- [x] **Remove GSTR-1 / GSTR-3B report references** — Replace with a generic "Tax Report" that shows collected vs paid tax
- [ ] **Remove INR (₹) as the only currency** — ~~partially done~~ Implement a proper currency selector with:
  - NPR (Nepalese Rupee) 🇳🇵
  - INR (Indian Rupee) 🇮🇳
  - USD (US Dollar) 🇺🇸
  - EUR (Euro) 🇪🇺
  - GBP (British Pound) 🇬🇧
  - AED (UAE Dirham) 🇦🇪
  - BDT (Bangladeshi Taka) 🇧🇩
  - MYR (Malaysian Ringgit) 🇲🇾
  - PHP (Philippine Peso) 🇵🇭
  - KES (Kenyan Shilling) 🇰🇪
  - NGN (Nigerian Naira) 🇳🇬
  - + user can type any custom currency symbol
- [ ] **Currency formatting** — Each currency should format numbers correctly (e.g., NPR uses comma-separated lakhs, USD uses thousands)
- [ ] **Date format** — Let user choose: DD/MM/YYYY or MM/DD/YYYY or YYYY-MM-DD
- [ ] **Language/locale selector** — English first; Nepali (नेपाली), Hindi later
- [x] **Remove hardcoded "₹" signs** throughout all components:
  - `Dashboard.jsx` — stat cards, charts
  - `Billing.jsx` — invoice totals, preview
  - `Inventory.jsx` — price columns
  - `Customers.jsx` — balance display
  - `Reports.jsx` — all chart labels and table values
  - `AppContext.jsx` — computed values
- [x] **Replace "HSN/SAC code" field** with generic "Product Code / Item Code"
- [x] **Replace "UPI" payment references** with generic "Digital Payment / Bank Transfer / QR Code"
- [x] **Remove India-specific phone format** validation — support international phone numbers with country code picker
- [x] **Replace "WhatsApp share via wa.me"** — keep it (WhatsApp is global) but remove india assumptinos in message text

---

## 🔴 CRITICAL — Must-Have Before Launch

### 1. Data Persistence (Highest Priority)
- [x] **Add localStorage persistence** to `AppContext.jsx`:
  - Save all state to `localStorage` on every change
  - Load from `localStorage` on app boot
  - This prevents ALL data from being lost on page refresh
  - Estimated effort: **2-4 hours**
- [ ] Later replace with real backend database

### 2. Backend API (Node.js + Express)
- [ ] Set up `/server` directory with Express
- [ ] REST API endpoints:
  - `POST /api/auth/login` — Login with email + password
  - `POST /api/auth/register` — Create new account
  - `POST /api/auth/forgot-password` — Send reset email
  - `GET/POST/PUT/DELETE /api/products` — Product CRUD
  - `GET/POST/PUT/DELETE /api/customers` — Customer CRUD
  - `GET/POST/PUT/DELETE /api/invoices` — Invoice CRUD
  - `GET/PUT /api/business` — Business profile
  - `GET /api/reports/summary` — Dashboard stats
  - `GET /api/reports/sales` — Sales report data
- [ ] Input validation (Joi or Zod)
- [ ] Error handling middleware
- [ ] Rate limiting (express-rate-limit)
- [ ] CORS configuration

### 3. Database (PostgreSQL via Supabase — free tier)
- [ ] Create **Supabase** project (free, hosted PostgreSQL)
- [ ] Design schema:
  ```sql
  users (id, email, password_hash, business_id, role, created_at)
  businesses (id, name, tax_id, phone, email, address, currency, logo_url, invoice_settings)
  products (id, business_id, name, code, category, unit, sale_price, purchase_price, stock, min_stock, tax_rate, barcode)
  customers (id, business_id, name, phone, email, tax_id, address, type, color_idx)
  invoices (id, business_id, customer_id, invoice_no, date, due_date, items_json, subtotal, discount, tax_amount, total, paid, status, notes)
  payments (id, invoice_id, amount, method, date, note)
  expenses (id, business_id, category, amount, date, description)
  stock_logs (id, product_id, type, quantity, note, created_at)
  ```
- [ ] Set up Row Level Security (RLS) — each business only sees their own data
- [ ] Database migrations setup

### 4. Real Authentication
- [ ] **JWT tokens** — `accessToken` (15 min) + `refreshToken` (30 days)
- [ ] Store tokens in `httpOnly` cookies (not localStorage — security)
- [ ] **Email/OTP verification** on signup (SendGrid free tier)
- [ ] Password hashing with **bcrypt**
- [ ] "Forgot password" — email with reset link (valid 1 hour)
- [ ] Protected routes — redirect to login if not authenticated
- [ ] Auto logout on token expiry

### 5. PDF Invoice Generation
- [ ] Server-side PDF using **Puppeteer** (render HTML → PDF) OR **PDFKit** (programmatic)
- [ ] Professional invoice template:
  - Business logo + contact info
  - Customer details
  - Itemized product table with configurable tax columns
  - Subtotal / Tax / Discount / Total section
  - Payment status (Paid / Due / Partial)
  - Customizable footer (bank details, thank you message, terms)
  - Invoice color branding
- [ ] Download as PDF button
- [ ] Email PDF directly to customer
- [ ] PDF file naming: `Invoice-{invoiceNo}-{BusinessName}.pdf`

---

## 🟠 HIGH PRIORITY — Core Business Features

### 6. Missing Core Modules

#### 6.1 Purchase Orders & Supplier Bills
- [ ] Create purchase orders (buy from suppliers)
- [ ] Record received goods → auto-update stock
- [ ] Supplier payment tracking
- [ ] Purchase history per supplier

#### 6.2 Payment Recording
- [ ] Mark invoice as fully or partially paid
- [ ] Payment methods: Cash, Card, Bank Transfer, Mobile Money, Cheque, Other
- [ ] Payment history log per invoice
- [ ] Overpayment → credit note
- [ ] Generate payment receipt

#### 6.3 Expense Tracking
- [ ] Add daily business expenses (rent, salary, electricity, etc.)
- [ ] Expense categories (user-defined)
- [ ] Monthly expense summary → feeds into P&L report
- [ ] Expense receipts (photo upload)

#### 6.4 Quotations / Estimates
- [ ] Create a quotation (same as invoice but "Quote" status)
- [ ] Send to customer via email/WhatsApp
- [ ] Convert accepted quotation → Invoice with one click
- [ ] Quote expiry date

#### 6.5 Credit/Debit Notes
- [ ] Issue a credit note (refund or discount after invoice)
- [ ] Debit note (charge extra after invoice)
- [ ] Link to original invoice

### 7. Tax System (Global)
- [x] **Custom tax rates** — user creates their own (e.g., "VAT 13%" for Nepal, "Sales Tax 7.5%" for Nigeria)
- [x] Multiple taxes on one invoice (e.g., 10% VAT + 2% Service Charge)
- [x] Tax-inclusive vs tax-exclusive pricing toggle
- [x] Tax report: collected tax per period per tax type
- [x] Tax exemption flag per customer (B2B zero-rated)

### 8. Reports Improvements
- [ ] **Fix reports with real data** (currently uses hardcoded dummy data)
- [ ] Connect charts to real invoice + product data from context/API
- [ ] Add date range picker for all reports
- [ ] **Sales Report** — by product, by customer, by period
- [ ] **Profit & Loss** — real income vs expenses
- [ ] **Tax Report** — tax collected per period (generic, not GST-specific)
- [ ] **Inventory Report** — stock valuation, fast/slow movers
- [ ] **Customer Report** — top customers by revenue, outstanding balances
- [ ] Export to **CSV** (simpler than Excel, works everywhere)
- [ ] Export to **PDF** (printable report)

---

## 🟡 IMPORTANT — User Experience & Polish

### 9. Missing CSS / UI Fixes
These CSS classes are used in components but not defined in `index.css`:
- [x] `.form-row-3` — 3-column grid for forms
- [x] `.grid-2` — 2-column grid for cards
- [x] `.btn-lg` — larger button variant
- [x] `.btn-outline` — outlined button variant  
- [x] `.btn-success`, `.btn-danger`, `.btn-warning` — colored button variants
- [x] `.btn-sm` — small button variant
- [x] `.stat-card` base + `.blue`, `.green`, `.teal`, `.orange`, `.red`, `.purple` modifiers
- [x] `.badge-teal`, `.badge-warning`, `.badge-primary`, `.badge-gray` badge variants
- [x] `.contact-avatar` — avatar circle for contacts
- [x] `.stock-bar`, `.stock-bar-fill` — mini progress bar
- [x] `.search-input-wrap` — search box with icon
- [x] `.filter-bar` — filter row layout
- [x] `.table-wrapper` — scrollable table container
- [x] `.empty-state`, `.empty-state-icon` — empty placeholder
- [x] `.tabs`, `.tab-btn` — tab navigation
- [x] `.breadcrumb`, `.breadcrumb-sep`, `.breadcrumb-current` — breadcrumb nav
- [x] `.card-body` — card content area
- [x] `.modal-sm` — smaller modal variant

### 10. Toast Notifications (Already Installed)
- [x] Wire up `react-hot-toast` in `App.jsx` (`<Toaster />` component)
- [x] Replace `alert()` calls with proper toasts:
  - Success: "Invoice saved ✓", "Product added ✓", "Stock updated ✓"
  - Error: "Failed to save, try again"
  - Info: "PDF generated, downloading..."

### 11. Loading States
- [ ] Loading spinners when saving/fetching data
- [ ] Skeleton screen for dashboard while data loads
- [ ] Disabled buttons while form submits

### 12. Form Validation
- [ ] Inline error messages on required fields (not `alert()` popups)
- [ ] Phone number validation with country code support
- [ ] Email format validation
- [ ] Price ≥ 0 validation on all price fields
- [ ] Prevent duplicate invoice numbers

### 13. Search & Filters
- [ ] **Global search** in header — actually search across invoices, products, customers
- [ ] Filter invoices by date range
- [ ] Filter invoices by customer
- [ ] Sort products by name, price, stock level
- [ ] Pagination for large data sets (products, invoices)

### 14. Dashboard Enhancements
- [ ] Connect all dashboard stats to **real data** (currently some use hardcoded values)
- [ ] Date range picker for dashboard (Today / This Week / This Month / Custom)
- [ ] "New Invoice" button on welcome banner actually opens billing page
- [ ] Recent transactions link → navigates to billing page filtered

---

## 🟢 GROWTH — Monetization & Scale

### 15. Subscription & Payment
- [ ] **Pricing tiers:**
  - **Free:** 50 invoices/month, 100 products, 1 user
  - **Starter** ($5/month): Unlimited invoices, PDF, 3 users
  - **Pro** ($12/month): Multi-business, advanced reports, email sending
  - **Enterprise:** Custom pricing, API access, white-label
- [ ] Integrate **Stripe** for global subscription billing (supports NPR, USD, EUR etc.)
- [ ] Subscription status check on API calls (block if limit exceeded)
- [ ] Upgrade nudge banners in the UI
- [ ] Trial period (14 days free Pro)

### 16. Multi-User / Team
- [ ] Invite team members by email
- [ ] Role-based access:
  - **Owner** — full access
  - **Manager** — all except settings/billing
  - **Cashier** — billing only
  - **Accountant** — reports + payments only, read-only invoices
- [ ] Activity log — "Who did what, when"

### 17. Multi-Business Support
- [ ] One account → manage multiple businesses (e.g., 2 shops, different locations)
- [ ] Switch between businesses from sidebar
- [ ] Separate data per business

### 18. Digital Payment Links
- [ ] Generate a **payment link** per invoice (Stripe Payment Link or regional equivalents)
- [ ] Customer pays online → invoice auto-marked as paid
- [ ] Esewa / Khalti QR for Nepal 🇳🇵
- [ ] UPI for India 🇮🇳
- [ ] Generic QR code for others

### 19. WhatsApp Automation (Global)
- [ ] WhatsApp Business API integration (Meta)
- [ ] Send invoice PDF via WhatsApp
- [ ] Payment due reminders
- [ ] "Your order is ready" notifications
- [ ] Bulk messaging (careful — spam risk)

### 20. Mobile App
- [ ] **Option A (Quick):** Wrap with **Capacitor.js** → iOS + Android APK from current React code
- [ ] **Option B (Native feel):** Rebuild in **React Native** / **Expo**
- [ ] Barcode scanner using device camera (add product at billing counter)
- [ ] Offline mode — queue transactions, sync when online
- [ ] Push notifications — low stock, overdue payments
- [ ] Biometric login (fingerprint / Face ID)
- [ ] App Store (Apple) + Play Store (Google) listing

---

## 🔵 DEPLOYMENT & INFRASTRUCTURE

### 21. Hosting Setup
- [ ] **Frontend** → Vercel (free, auto-deploy from GitHub)
- [ ] **Backend** → Railway.app or Render (free tier Node.js)
- [ ] **Database** → Supabase (free tier PostgreSQL, 500MB)
- [ ] **File Storage** (logos, attachments) → Supabase Storage or Cloudflare R2
- [ ] **Email** → Resend.com or SendGrid (100 emails/day free)

### 22. Domain & Branding
- [ ] Register domain: `mybillbook.com` or `mybillbook.app` or `mybillbook.co`
- [ ] Custom email: `hello@mybillbook.com`
- [ ] SSL certificate (auto via Vercel)
- [ ] Custom logo / app icon design
- [ ] App meta tags: og:image, twitter card for social sharing

### 23. CI/CD Pipeline
- [ ] GitHub repository (private)
- [ ] Auto-deploy frontend on `git push main` → Vercel
- [ ] Auto-deploy backend on `git push main` → Railway
- [ ] Environment variables securely stored (not in code)
- [ ] `.env.example` file documenting all required variables

### 24. Security
- [ ] All API routes authenticated (check JWT on every request)
- [ ] Input sanitization — prevent SQL injection, XSS
- [ ] HTTPS only
- [ ] Password strength requirements
- [ ] 2FA (Two Factor Authentication) — optional but recommended
- [ ] Regular security audits
- [ ] GDPR compliance (important for EU users) — data deletion, export
- [ ] Data encryption at rest (Supabase handles this)

### 25. Monitoring & Analytics
- [ ] Error tracking — **Sentry** (free tier)
- [ ] Uptime monitoring — **UptimeRobot** (free)
- [ ] App analytics — **PostHog** (open source, self-hostable)
- [ ] Server logs — Railway/Render built-in logs

---

## ⚖️ LEGAL & COMPLIANCE

### 26. Legal Pages (Required)
- [ ] **Privacy Policy** — what data you collect, how you use it, GDPR compliant
- [ ] **Terms of Service** — usage rules, account termination policy
- [ ] **Refund Policy** — for subscription payments
- [ ] **Cookie Policy** — if using analytics
- Add links in app footer and auth pages

### 27. Business Registration
- [ ] Register the SaaS business (company or sole proprietorship)
- [ ] Business bank account for receiving payments
- [ ] Tax registration in operating country

---

## 📋 DEVELOPMENT TASK ORDER (Suggested Sprint Plan)

### Sprint 1 — Foundations (Week 1-2)
1. Add `localStorage` persistence to AppContext → data survives refresh
2. Fix all missing CSS classes in `index.css`
3. Remove all hardcoded Indian-only references (₹, GST, GSTIN, HSN)
4. Add multi-currency selector + currency formatting utility
5. Add custom tax rate system (user-defined VAT/Sales Tax)
6. Wire up `react-hot-toast` — replace all `alert()` calls

### Sprint 2 — Backend (Week 3-4)
7. Set up Supabase project + design database schema  
8. Create Node.js + Express backend
9. Implement real JWT authentication (login, signup, forgot password)
10. Implement Products API + connect frontend
11. Implement Customers API + connect frontend
12. Implement Invoices API + connect frontend

### Sprint 3 — Core Features (Week 5-6)
13. PDF invoice generation with professional template
14. Payment recording on invoices
15. Purchase orders module
16. Expense tracking module
17. Fix Reports page to use real data + date range picker

### Sprint 4 — Polish & Launch Prep (Week 7-8)
18. Loading states + skeleton screens
19. Inline form validation
20. Global search functionality
21. Legal pages (Privacy Policy, Terms of Service)
22. Deploy to Vercel + Railway + Supabase

### Sprint 5 — Growth (Week 9-12)
23. Stripe subscription integration
24. Multi-user + role-based access
25. Mobile app (Capacitor.js wrap)
26. WhatsApp Business API integration
27. Khalti/Esewa for Nepal, Stripe for global

---

## 🌐 Localization Targets

| Country | Currency | Tax System | Priority |
|---------|----------|------------|----------|
| 🇳🇵 Nepal | NPR (रू) | VAT 13% | **#1** |
| 🇮🇳 India | INR (₹) | GST 5-28% | #2 |
| 🇧🇩 Bangladesh | BDT (৳) | VAT 15% | #3 |
| 🇵🇰 Pakistan | PKR (₨) | GST 17% | #4 |
| 🇱🇰 Sri Lanka | LKR (Rs) | VAT 15% | #5 |
| 🇲🇾 Malaysia | MYR (RM) | SST 6-10% | #6 |
| 🇰🇪 Kenya | KES (KSh) | VAT 16% | #7 |
| 🇳🇬 Nigeria | NGN (₦) | VAT 7.5% | #8 |
| 🇺🇸 USA | USD ($) | Sales Tax varies | Long term |
| 🇬🇧 UK | GBP (£) | VAT 20% | Long term |

---

## 🐛 Known Bugs / Issues (Fix ASAP)

- [x] Page refresh wipes all data (no persistence yet)
- [x] Missing CSS utility classes cause visual glitches on some pages
- [x] `alert()` popups are ugly — replace with toast notifications
- [ ] Invoice preview modal doesn't use the real business logo
- [ ] Reports page charts use dummy data, not real invoice data
- [ ] Dashboard "New Invoice" button doesn't navigate to billing
- [ ] Stock bar in inventory may overflow for very high stock counts
- [ ] Mobile bottom nav bar `display:none` style conflicts with sidebar on tablet
- [ ] PDF download is just print dialog — not a proper PDF file

---

## 💡 Nice-to-Have Features (Backlog)

- [ ] Dark mode toggle (CSS variables already set up for this)
- [ ] Recurring invoices (auto-generate monthly invoices for subscriptions)
- [ ] Customer portal — customers can view/pay their invoices online
- [ ] Inventory barcode label printing
- [ ] POS (Point of Sale) mode — quick billing with keyboard shortcuts
- [ ] Accounting integration (export to Tally, QuickBooks, Xero)
- [ ] Multiple warehouses / locations for inventory
- [ ] Employee management + salary tracking
- [ ] AI-powered insights ("Your best selling product this month is...")
- [ ] Offline-first PWA (Progressive Web App) support
- [ ] Multi-language UI (Nepali नेपाली, Hindi हिंदी, etc.)

---

*This document should be updated after each sprint. Check off items as they are completed.*
