/**
 * Mock Data Population Script
 * Populates test account (test@gmail.com) with comprehensive mock data
 * spanning January to December 2026
 */

import { supabaseAdmin } from '../config/supabase.js';

const TEST_EMAIL = 'test@gmail.com';

// Helper: Generate random date in a given month of 2026
function randomDateInMonth(month) {
  const year = 2026;
  const daysInMonth = new Date(year, month, 0).getDate();
  const day = Math.floor(Math.random() * daysInMonth) + 1;
  const hour = Math.floor(Math.random() * 24);
  const minute = Math.floor(Math.random() * 60);
  return new Date(year, month - 1, day, hour, minute);
}

// Helper: Random number in range
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper: Random item from array
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Mock data templates
const PRODUCTS = [
  { name: 'Laptop Dell XPS 15', code: 'TECH-001', category: 'Electronics', unit: 'pcs', salePrice: 85000, purchasePrice: 70000, stock: 50, minStock: 5, taxRate: 13 },
  { name: 'iPhone 15 Pro', code: 'TECH-002', category: 'Electronics', unit: 'pcs', salePrice: 135000, purchasePrice: 120000, stock: 30, minStock: 5, taxRate: 13 },
  { name: 'Samsung Galaxy S24', code: 'TECH-003', category: 'Electronics', unit: 'pcs', salePrice: 95000, purchasePrice: 82000, stock: 40, minStock: 5, taxRate: 13 },
  { name: 'Sony Headphones WH-1000XM5', code: 'TECH-004', category: 'Electronics', unit: 'pcs', salePrice: 28000, purchasePrice: 23000, stock: 75, minStock: 10, taxRate: 13 },
  { name: 'iPad Air', code: 'TECH-005', category: 'Electronics', unit: 'pcs', salePrice: 65000, purchasePrice: 55000, stock: 35, minStock: 5, taxRate: 13 },
  { name: 'Office Chair Premium', code: 'FURN-001', category: 'Furniture', unit: 'pcs', salePrice: 15000, purchasePrice: 11000, stock: 60, minStock: 8, taxRate: 13 },
  { name: 'Standing Desk Electric', code: 'FURN-002', category: 'Furniture', unit: 'pcs', salePrice: 35000, purchasePrice: 27000, stock: 25, minStock: 3, taxRate: 13 },
  { name: 'Monitor LG 27" 4K', code: 'TECH-006', category: 'Electronics', unit: 'pcs', salePrice: 38000, purchasePrice: 32000, stock: 45, minStock: 5, taxRate: 13 },
  { name: 'Mechanical Keyboard RGB', code: 'TECH-007', category: 'Electronics', unit: 'pcs', salePrice: 8500, purchasePrice: 6500, stock: 100, minStock: 15, taxRate: 13 },
  { name: 'Wireless Mouse Logitech', code: 'TECH-008', category: 'Electronics', unit: 'pcs', salePrice: 3500, purchasePrice: 2500, stock: 150, minStock: 20, taxRate: 13 },
  { name: 'USB-C Hub 7-in-1', code: 'TECH-009', category: 'Electronics', unit: 'pcs', salePrice: 4500, purchasePrice: 3200, stock: 120, minStock: 15, taxRate: 13 },
  { name: 'Webcam HD 1080p', code: 'TECH-010', category: 'Electronics', unit: 'pcs', salePrice: 6500, purchasePrice: 5000, stock: 80, minStock: 10, taxRate: 13 },
  { name: 'Printer HP LaserJet', code: 'TECH-011', category: 'Electronics', unit: 'pcs', salePrice: 22000, purchasePrice: 18000, stock: 30, minStock: 3, taxRate: 13 },
  { name: 'External SSD 1TB', code: 'TECH-012', category: 'Electronics', unit: 'pcs', salePrice: 12000, purchasePrice: 9500, stock: 70, minStock: 10, taxRate: 13 },
  { name: 'Power Bank 20000mAh', code: 'TECH-013', category: 'Electronics', unit: 'pcs', salePrice: 3200, purchasePrice: 2400, stock: 200, minStock: 25, taxRate: 13 },
  { name: 'Smart Watch', code: 'TECH-014', category: 'Electronics', unit: 'pcs', salePrice: 18000, purchasePrice: 14000, stock: 55, minStock: 8, taxRate: 13 },
  { name: 'Bluetooth Speaker', code: 'TECH-015', category: 'Electronics', unit: 'pcs', salePrice: 8500, purchasePrice: 6800, stock: 90, minStock: 12, taxRate: 13 },
  { name: 'Desk Lamp LED', code: 'FURN-003', category: 'Furniture', unit: 'pcs', salePrice: 2500, purchasePrice: 1800, stock: 110, minStock: 15, taxRate: 13 },
  { name: 'Gaming Chair', code: 'FURN-004', category: 'Furniture', unit: 'pcs', salePrice: 22000, purchasePrice: 17000, stock: 28, minStock: 4, taxRate: 13 },
  { name: 'Phone Case Universal', code: 'ACC-001', category: 'Accessories', unit: 'pcs', salePrice: 800, purchasePrice: 500, stock: 300, minStock: 40, taxRate: 13 },
];

const CUSTOMERS = [
  { name: 'Ramesh Computers', phone: '+977-9801234567', email: 'ramesh@computers.com', taxId: 'PAN-123456', address: 'Thamel, Kathmandu', type: 'customer' },
  { name: 'Sita Electronics', phone: '+977-9812345678', email: 'sita@electronics.np', taxId: 'PAN-234567', address: 'New Road, Kathmandu', type: 'customer' },
  { name: 'Krishna Traders', phone: '+977-9823456789', email: 'krishna@traders.com', taxId: 'PAN-345678', address: 'Durbar Marg, Kathmandu', type: 'customer' },
  { name: 'Maya Tech Solutions', phone: '+977-9834567890', email: 'maya@techsol.com', taxId: 'PAN-456789', address: 'Lazimpat, Kathmandu', type: 'customer' },
  { name: 'Bijay Store', phone: '+977-9845678901', email: 'bijay@store.np', taxId: '', address: 'Baneswor, Kathmandu', type: 'customer' },
  { name: 'Rina Enterprises', phone: '+977-9856789012', email: 'rina@ent.com', taxId: 'PAN-567890', address: 'Patan, Lalitpur', type: 'supplier' },
  { name: 'Anil Kumar', phone: '+977-9867890123', email: 'anil@personal.com', taxId: '', address: 'Bhaktapur', type: 'customer' },
  { name: 'Deepak Hardware', phone: '+977-9878901234', email: 'deepak@hardware.np', taxId: 'PAN-678901', address: 'Putalisadak, Kathmandu', type: 'supplier' },
  { name: 'Sunita Fashion', phone: '+977-9889012345', email: 'sunita@fashion.com', taxId: '', address: 'Maharajgunj, Kathmandu', type: 'customer' },
  { name: 'Raju Wholesale', phone: '+977-9890123456', email: 'raju@wholesale.np', taxId: 'PAN-789012', address: 'Kalimati, Kathmandu', type: 'supplier' },
];

const EXPENSE_CATEGORIES = [
  { category: 'Rent', amount: [25000, 30000], vendors: ['Building Owner', 'Property Manager'] },
  { category: 'Utilities', amount: [3000, 8000], vendors: ['NEA', 'Water Supply', 'Internet Provider'] },
  { category: 'Salaries', amount: [45000, 85000], vendors: ['Staff Payment', 'Employee Salary'] },
  { category: 'Marketing', amount: [5000, 20000], vendors: ['Facebook Ads', 'Google Ads', 'Print Media'] },
  { category: 'Supplies', amount: [2000, 10000], vendors: ['Office Supply Store', 'Stationery Shop'] },
  { category: 'Transportation', amount: [1500, 5000], vendors: ['Fuel Station', 'Transport Service'] },
  { category: 'Maintenance', amount: [3000, 15000], vendors: ['Repair Shop', 'Maintenance Service'] },
  { category: 'Insurance', amount: [8000, 12000], vendors: ['Insurance Company'] },
];

async function main() {
  console.log('🚀 Starting Mock Data Population...\n');
  
  try {
    // 1. Find test user
    console.log('📧 Finding test account...');
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', TEST_EMAIL)
      .single();
    
    if (userError || !user) {
      console.error('❌ Test account not found. Please register with test@gmail.com first.');
      return;
    }
    
    console.log(`✅ Found user: ${user.id}\n`);
    
    // 2. Get business ID
    console.log('🏢 Getting business...');
    const { data: business, error: bizError } = await supabaseAdmin
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (bizError || !business) {
      console.error('❌ Business not found for test account.');
      return;
    }
    
    const businessId = business.id;
    console.log(`✅ Business ID: ${businessId}\n`);
    
    // 3. Clear existing data
    console.log('🧹 Clearing existing mock data...');
    await supabaseAdmin.from('payments').delete().in('invoice_id', 
      (await supabaseAdmin.from('invoices').select('id').eq('business_id', businessId)).data?.map(i => i.id) || []
    );
    await supabaseAdmin.from('invoices').delete().eq('business_id', businessId);
    await supabaseAdmin.from('expenses').delete().eq('business_id', businessId);
    await supabaseAdmin.from('customers').delete().eq('business_id', businessId);
    await supabaseAdmin.from('products').delete().eq('business_id', businessId);
    console.log('✅ Cleared existing data\n');
    
    // 4. Create Products
    console.log('📦 Creating products...');
    const productInserts = PRODUCTS.map(p => ({
      business_id: businessId,
      name: p.name,
      code: p.code,
      category: p.category,
      unit: p.unit,
      sale_price: p.salePrice,
      purchase_price: p.purchasePrice,
      stock: p.stock,
      min_stock: p.minStock,
      tax_rate: p.taxRate,
    }));
    
    const { data: createdProducts, error: prodError } = await supabaseAdmin
      .from('products')
      .insert(productInserts)
      .select();
    
    if (prodError) throw prodError;
    console.log(`✅ Created ${createdProducts.length} products\n`);
    
    // 5. Create Customers
    console.log('👥 Creating customers...');
    const customerInserts = CUSTOMERS.map((c, idx) => ({
      business_id: businessId,
      name: c.name,
      phone: c.phone,
      email: c.email,
      tax_id: c.taxId,
      address: c.address,
      type: c.type,
      color_idx: idx % 6,
    }));
    
    const { data: createdCustomers, error: custError } = await supabaseAdmin
      .from('customers')
      .insert(customerInserts)
      .select();
    
    if (custError) throw custError;
    console.log(`✅ Created ${createdCustomers.length} customers\n`);
    
    // 6. Create Invoices & Payments for each month
    console.log('📄 Creating invoices and payments (Jan-Dec)...');
    let invoiceCounter = 1;
    
    for (let month = 1; month <= 12; month++) {
      const monthName = new Date(2026, month - 1, 1).toLocaleString('default', { month: 'long' });
      const invoicesThisMonth = random(8, 15); // 8-15 invoices per month
      
      for (let i = 0; i < invoicesThisMonth; i++) {
        const customer = randomItem(createdCustomers);
        const itemsCount = random(1, 5);
        const items = [];
        let subtotal = 0;
        let taxAmount = 0;
        
        for (let j = 0; j < itemsCount; j++) {
          const product = randomItem(createdProducts);
          const quantity = random(1, 10);
          const unitPrice = parseFloat(product.sale_price);
          const amount = quantity * unitPrice;
          const itemTax = (amount * product.tax_rate) / 100;
          
          items.push({
            productId: product.id,
            productName: product.name,
            quantity,
            unitPrice,
            amount,
            taxRate: product.tax_rate,
            taxAmount: itemTax,
          });
          
          subtotal += amount;
          taxAmount += itemTax;
        }
        
        const discount = subtotal > 100000 ? random(0, 5000) : 0;
        const total = subtotal + taxAmount - discount;
        
        // Random status distribution
        const statusRoll = Math.random();
        let status, paid;
        if (statusRoll < 0.6) { // 60% paid
          status = 'paid';
          paid = total;
        } else if (statusRoll < 0.8) { // 20% partial
          status = 'partial';
          paid = total * random(30, 80) / 100;
        } else { // 20% unpaid
          status = 'unpaid';
          paid = 0;
        }
        
        const invoiceDate = randomDateInMonth(month);
        const dueDate = new Date(invoiceDate);
        dueDate.setDate(dueDate.getDate() + random(7, 30));
        
        // Create invoice
        const { data: invoice, error: invError } = await supabaseAdmin
          .from('invoices')
          .insert({
            business_id: businessId,
            customer_id: customer.id,
            invoice_no: `INV-${String(invoiceCounter).padStart(4, '0')}`,
            date: invoiceDate.toISOString(),
            due_date: dueDate.toISOString(),
            items_json: items,
            subtotal,
            tax_amount: taxAmount,
            discount,
            total,
            paid,
            status,
            notes: 'Thank you for your business!',
          })
          .select()
          .single();
        
        if (invError) throw invError;
        
        // Create payments if any
        if (paid > 0) {
          const paymentMethods = ['cash', 'bank', 'card', 'mobile'];
          const paymentsCount = status === 'partial' ? random(1, 2) : 1;
          
          if (paymentsCount === 1) {
            await supabaseAdmin.from('payments').insert({
              invoice_id: invoice.id,
              amount: paid,
              method: randomItem(paymentMethods),
              date: new Date(invoiceDate.getTime() + random(0, 7) * 24 * 60 * 60 * 1000).toISOString(),
              note: 'Payment received',
            });
          } else {
            // Split payment
            const firstPayment = paid * 0.6;
            const secondPayment = paid - firstPayment;
            
            await supabaseAdmin.from('payments').insert([
              {
                invoice_id: invoice.id,
                amount: firstPayment,
                method: randomItem(paymentMethods),
                date: new Date(invoiceDate.getTime() + random(0, 3) * 24 * 60 * 60 * 1000).toISOString(),
                note: 'First payment',
              },
              {
                invoice_id: invoice.id,
                amount: secondPayment,
                method: randomItem(paymentMethods),
                date: new Date(invoiceDate.getTime() + random(4, 10) * 24 * 60 * 60 * 1000).toISOString(),
                note: 'Second payment',
              },
            ]);
          }
        }
        
        invoiceCounter++;
      }
      
      console.log(`  ✓ ${monthName}: ${invoicesThisMonth} invoices`);
    }
    
    console.log(`✅ Created ${invoiceCounter - 1} total invoices\n`);
    
    // 7. Create Expenses for each month
    console.log('💰 Creating expenses (Jan-Dec)...');
    let totalExpenses = 0;
    
    for (let month = 1; month <= 12; month++) {
      const monthName = new Date(2026, month - 1, 1).toLocaleString('default', { month: 'long' });
      const expensesThisMonth = random(10, 20);
      
      const expenseInserts = [];
      for (let i = 0; i < expensesThisMonth; i++) {
        const expenseType = randomItem(EXPENSE_CATEGORIES);
        const amount = random(expenseType.amount[0], expenseType.amount[1]);
        const expenseDate = randomDateInMonth(month);
        
        expenseInserts.push({
          business_id: businessId,
          category: expenseType.category,
          amount,
          date: expenseDate.toISOString(),
          description: `${expenseType.category} - ${monthName} 2026`,
          vendor: randomItem(expenseType.vendors),
        });
      }
      
      const { error: expError } = await supabaseAdmin
        .from('expenses')
        .insert(expenseInserts);
      
      if (expError) throw expError;
      totalExpenses += expensesThisMonth;
      console.log(`  ✓ ${monthName}: ${expensesThisMonth} expenses`);
    }
    
    console.log(`✅ Created ${totalExpenses} total expenses\n`);
    
    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ MOCK DATA POPULATION COMPLETE!\n');
    console.log('📊 Summary:');
    console.log(`   • Products: ${createdProducts.length}`);
    console.log(`   • Customers: ${createdCustomers.length}`);
    console.log(`   • Invoices: ${invoiceCounter - 1} (Jan-Dec 2026)`);
    console.log(`   • Expenses: ${totalExpenses} (Jan-Dec 2026)`);
    console.log('\n🎉 You can now test all features with test@gmail.com!\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
