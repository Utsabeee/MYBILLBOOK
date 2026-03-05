# Quick Reference - Manual Data Entry

## 🚀 Quick Start

```bash
# 1. Start the application
cd /Users/utsavlamsal/Documents/MYBILLBOOK
npm run dev:all

# 2. Open browser
# http://localhost:5173
```

## 👤 Add Your First User

**Sign Up Page:**
```
Email:          owner@yourbusiness.com
Password:       YourPassword123
Business Name:  Your Company Name
Phone:          +977-1-1234567
```

## 📦 Add Products (3 Quick Steps)

### Step 1: Go to **Inventory** → Click **+ Add Product**

### Step 2: Fill Required Fields

```
Name:            iPhone 15 Pro Max
SKU:             IPHONE-15
Category:        Electronics (dropdown)
Unit:            PCS (dropdown)
Purchase Price:  155,000
Sale Price:      180,000
Current Stock:   15
Min Stock:       5
Tax Rate:        5%
Barcode:         (optional)
```

### Step 3: Click **Save Product**

**Common Categories:**
- Electronics
- Food & Grocery
- Dairy
- Beverages
- Cooking Essentials
- Health & Beauty

**Common Units:**
- PCS (Pieces)
- BOX (Boxes)
- KG (Kilograms)
- LTR (Liters)
- BAG (Bags)
- BOTTLE (Bottles)
- JAR (Jars)
- PKT (Packets)

## 👥 Add Customers (3 Quick Steps)

### Step 1: Go to **Customers** → Click **+ Add Customer**

### Step 2: Fill Required Fields

```
Name:       Rajesh Kumar
Phone:      9841234567
Email:      rajesh@gmail.com
Type:       Customer (dropdown)
            or Supplier
GST:        44AABCT1234H1Z0 (optional)
Address:    Kathmandu, Nepal
```

### Step 3: Click **Save Customer**

**Types:**
- **Customer** - For sales invoices
- **Supplier** - For purchase invoices

## 📄 Create Your First Invoice

### Step 1: Go to **Billing** → Click **+ Create Invoice**

### Step 2: Select Details

```
Customer:   (dropdown - select from your customers)
Date:       Today's date (auto-filled)
Due Date:   Set payment deadline
```

### Step 3: Add Items

1. Click **Add Item**
2. Select product from dropdown
3. Enter quantity
4. Price auto-fills
5. Tax calculated automatically
6. Total shows at bottom

### Step 4: Payment Status

```
☑ Paid        - Full payment received
☑ Partial     - Partial payment received
☑ Unpaid      - No payment yet
```

### Step 5: Click **Save Invoice**

## 📊 View Dashboard

The Dashboard auto-updates with:
- Total Revenue (all invoices)
- Sales This Month
- Sales Yesterday
- Low Stock Items
- Recent Transactions
- Overdue Payments

## 🔍 Common Tasks

### Find a Product
```
Inventory page → Use search bar → Type product name
```

### Edit Product
```
Inventory → Find product → Click edit icon → Update → Save
```

### Delete Product
```
Inventory → Find product → Click delete icon → Confirm
```

### Find a Customer
```
Customers page → Use search bar → Type customer name
```

### View All Invoices
```
Billing page → Shows all invoices in list format
```

### Download Invoice PDF
```
Billing → Find invoice → Click download icon
```

### Mark Invoice as Paid
```
Billing → Find invoice → Click paid/partial/unpaid status
```

## 💰 Sample Data to Add

### 3 Sample Products

| Product | SKU | Sale | Purchase | Stock |
|---------|-----|------|----------|-------|
| iPhone 15 Pro | IPHONE-15 | ₹180,000 | ₹155,000 | 15 |
| Samsung Galaxy S24 | SAMSUNG-S24 | ₹95,000 | ₹78,000 | 22 |
| Wireless Mouse | MOUSE-001 | ₹3,500 | ₹2,200 | 45 |

### 3 Sample Customers

| Name | Email | Phone | Type |
|------|-------|-------|------|
| Rajesh Kumar | rajesh@gmail.com | 9841234567 | Customer |
| Tech Store Nepal | info@techstore.com | 9851234567 | Supplier |
| Fresh Mart | freshmart@gmail.com | 9852345678 | Supplier |

## 🔧 Troubleshooting

### No Products in Invoice?
- ✅ Go to Inventory, add at least 1 product
- ✅ Product must have stock > 0
- ✅ Refresh the page

### No Customers in Dropdown?
- ✅ Go to Customers, add at least 1 customer
- ✅ Make sure to click Save
- ✅ Refresh the page

### Invoice Won't Save?
- ✅ Select a customer (required)
- ✅ Add at least 1 item (required)
- ✅ Enter valid quantity > 0

### Low Stock Alert?
- ✅ Go to Inventory
- ✅ Find the product
- ✅ Increase stock quantity
- ✅ Update minimum stock if needed

### Can't Login?
- ✅ Check email spelling
- ✅ Password is case-sensitive
- ✅ Use at least 6 characters

## ⌨️ Keyboard Shortcuts

```
Tab         Jump to next field
Enter       Save form / Submit
Escape      Cancel / Close dialog
⌘+S         Save (on Mac)
Ctrl+S      Save (on Windows)
```

## 📱 Mobile Tips

- Same functionality on mobile browsers
- Swipe to navigate between pages
- Landscape mode better for forms
- Test on larger screen for best experience

## ☁️ Cloud Backup

Go to **Settings** → **Backup & Data**:
- 📥 Download Backup (saves .json file)
- 📤 Restore Backup (coming soon)
- ✅ Auto-sync to Supabase (always on)

## 📞 Support

For issues, check:
1. **Browser Console** (F12) for errors
2. **Network Tab** for failed API calls
3. **Terminal logs** where app is running
4. **MANUAL_SETUP_GUIDE.md** for detailed walkthrough

---

**Need more info?** See `MANUAL_SETUP_GUIDE.md` or `README.md`
