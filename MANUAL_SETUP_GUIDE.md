# Manual Setup Guide - Add Users & Inventory

Since mock data functionality has been removed, here's how to manually add users and data to your MyBillBook application.

## Step 1: Start the Application

```bash
cd /Users/utsavlamsal/Documents/MYBILLBOOK
npm run dev:all
```

Access the app at `http://localhost:5173`

## Step 2: Create Your First User Account

1. Open the application at `http://localhost:5173`
2. Click **"Sign Up"** or **"Create Account"**
3. Fill in the form:
   - **Email**: Your business email (e.g., `owner@yourbusiness.com`)
   - **Password**: Create a strong password (minimum 6 characters)
   - **Business Name**: Your company name
   - **Phone**: Your contact number

4. Submit the form
5. You should receive a confirmation and be logged in automatically

## Step 3: Add Products (Inventory)

Once logged in, go to **Inventory** section in the sidebar:

### Method 1: Add Products One by One
1. Click **"+ Add Product"** button
2. Fill in the product details:
   - **Product Name**: e.g., "iPhone 15 Pro"
   - **SKU/Code**: Unique identifier (e.g., "IPHONE-15")
   - **Category**: Select from dropdown (Electronics, Food & Grocery, etc.)
   - **Unit**: PCS, BOX, KG, LTR, etc.
   - **Purchase Price**: Cost price
   - **Sale Price**: Selling price
   - **Stock Quantity**: Current inventory count
   - **Minimum Stock**: Alert level
   - **Tax Rate**: GST percentage (usually 5%)

3. Click **"Save Product"**
4. Repeat for all products

### Sample Products to Add

**Electronics Category:**
- iPhone 15 Pro | SKU: IPHONE-15 | Sale: ₹180,000 | Purchase: ₹155,000 | Stock: 15
- Samsung Galaxy S24 | SKU: SAMSUNG-S24 | Sale: ₹95,000 | Purchase: ₹78,000 | Stock: 22
- Dell XPS 15 | SKU: DELL-XPS15 | Sale: ₹220,000 | Purchase: ₹180,000 | Stock: 8

**Food & Grocery Category:**
- Basmati Rice 5KG | SKU: RICE-BASMATI | Sale: ₹850 | Purchase: ₹650 | Stock: 45
- Organic Wheat Flour 2KG | SKU: FLOUR-WHEAT | Sale: ₹280 | Purchase: ₹180 | Stock: 60
- Sunflower Oil 1L | SKU: OIL-SUNFLOWER | Sale: ₹420 | Purchase: ₹300 | Stock: 55

**Accessories Category:**
- USB-C Cable 2M | SKU: CABLE-USBC | Sale: ₹800 | Purchase: ₹450 | Stock: 150
- Wireless Mouse | SKU: MOUSE-LOG | Sale: ₹3,500 | Purchase: ₹2,200 | Stock: 45
- Mechanical Keyboard | SKU: KEYBOARD-RGB | Sale: ₹8,900 | Purchase: ₹5,500 | Stock: 28

## Step 4: Add Customers

Go to **Customers** section:

1. Click **"+ Add Customer"** button
2. Fill in customer details:
   - **Name**: Customer name
   - **Email**: Customer email
   - **Phone**: Contact number
   - **GST Number**: Their GST ID (if applicable)
   - **Address**: Full address
   - **Type**: "Customer" (for sales) or "Supplier" (for purchases)

3. Click **"Save Customer"**
4. Add at least 5-10 customers for testing

### Sample Customers to Add

**Customers:**
1. Rajesh Kumar | Phone: 9841234567 | Email: rajesh@gmail.com | Kathmandu, Nepal
2. Priya Sharma | Phone: 9845678901 | Email: priya@gmail.com | Lalitpur, Nepal
3. Amit Patel | Phone: 9849876543 | Email: amit@gmail.com | Bhaktapur, Nepal
4. Neha Verma | Phone: 9842345678 | Email: neha@gmail.com | Pokhara, Nepal
5. Vikram Singh | Phone: 9843456789 | Email: vikram@gmail.com | Biratnagar, Nepal

**Suppliers:**
1. Tech Store Nepal | Phone: 9851234567 | Email: info@techstore.com | Thamel, Kathmandu
2. Fresh Mart Groceries | Phone: 9852345678 | Email: freshmart@gmail.com | New Road, Kathmandu

## Step 5: Create Your First Invoice

Go to **Billing** section:

1. Click **"+ Create Invoice"**
2. Fill in the form:
   - **Select Customer**: Choose from your customer list
   - **Invoice Date**: Today's date
   - **Due Date**: Set payment deadline (e.g., 30 days from today)
   - **Add Items**: 
     - Click "Add Item"
     - Select a product from inventory
     - Enter quantity
     - Price auto-fills from product
     - Tax calculation is automatic
   
3. Review the summary (Subtotal, Tax, Total)
4. Mark payment status: Paid / Partial / Unpaid
5. Click **"Save Invoice"**

## Step 6: Check Dashboard

Go to **Dashboard** to see:
- Total Revenue (all invoices combined)
- Sales this month vs yesterday
- Recent transactions
- Low stock alerts
- Overdue payments

## API-Based Setup (Advanced)

If you prefer to add data via API calls directly:

### Login First
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"your_password"}'
```

### Add Product
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro",
    "sku": "IPHONE-15",
    "category": "Electronics",
    "unit": "PCS",
    "salePrice": 180000,
    "purchasePrice": 155000,
    "stock": 15,
    "minStock": 5,
    "taxRate": 5,
    "barcode": "IPHONE15001"
  }'
```

### Add Customer
```bash
curl -X POST http://localhost:8080/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rajesh Kumar",
    "phone": "9841234567",
    "email": "rajesh@gmail.com",
    "gst": "44AABCT1234H1Z0",
    "address": "Kathmandu, Nepal",
    "type": "customer"
  }'
```

## File Structure

```
MyBillBook/
├── src/
│   ├── pages/
│   │   ├── Inventory.jsx      ← Add products here
│   │   ├── Customers.jsx      ← Add customers here
│   │   ├── Billing.jsx        ← Create invoices
│   │   └── Dashboard.jsx      ← View analytics
│   └── ...
├── server/
│   ├── routes/
│   │   ├── products.js        ← Product API
│   │   ├── customers.js       ← Customer API
│   │   └── invoices.js        ← Invoice API
│   └── ...
└── ...
```

## Tips for Testing

1. **Start Small**: Add 3-5 products and customers first
2. **Test Flows**: Create 2-3 invoices to see how everything works
3. **Check Dashboard**: Monitor statistics and low stock alerts
4. **Adjust as Needed**: Edit products/customers if needed
5. **Backup Regularly**: Download backups from Settings

## Troubleshooting

### Products not appearing in dropdown?
- Make sure products are added to Inventory first
- Refresh the page
- Check that stock quantity > 0

### Can't create invoice?
- Ensure you have at least one customer and one product
- Check customer is properly saved
- Verify product has sufficient stock

### Prices showing as 0?
- Make sure to fill in both Purchase and Sale prices
- Check tax rate is set correctly
- Graph may not update immediately on page refresh

## Next Steps

Once you have data set up:
1. Test different invoice types (paid, partial, unpaid)
2. Practice editing customers and products
3. Download invoices/reports
4. Explore Reports section for analytics
5. Set up payment reminders in Settings

---

For API documentation, see `BACKEND_SETUP.md`
