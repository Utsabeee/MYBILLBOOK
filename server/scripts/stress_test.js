/**
 * STRESS TEST - Test Absolute Limits of MyBillBook
 * 
 * This script will push the database and app to their limits by:
 * - Creating thousands of products
 * - Creating thousands of customers
 * - Creating thousands of invoices with complex line items
 * - Creating thousands of expenses
 * - Testing large data payloads
 */

import { supabaseAdmin } from '../config/supabase.js';

const TEST_EMAIL = 'test@gmail.com';

// Configuration - YOU CAN ADJUST THESE NUMBERS
const STRESS_CONFIG = {
  products: 1000,      // 1,000 products
  customers: 500,      // 500 customers
  invoicesPerMonth: 100, // 100 invoices per month = 1,200 per year
  expensesPerMonth: 50,  // 50 expenses per month = 600 per year
  itemsPerInvoice: 10,   // 10 line items per invoice
  runFullYear: true,     // Test full 12 months
};

console.log(`
╔════════════════════════════════════════════════════════════╗
║           MYBILLBOOK EXTREME STRESS TEST                   ║
╚════════════════════════════════════════════════════════════╝

WARNING: This will create MASSIVE amounts of data!

Configuration:
  • Products:                 ${STRESS_CONFIG.products.toLocaleString()}
  • Customers:                ${STRESS_CONFIG.customers.toLocaleString()}
  • Invoices per month:       ${STRESS_CONFIG.invoicesPerMonth.toLocaleString()}
  • Total invoices (12mo):    ${(STRESS_CONFIG.invoicesPerMonth * 12).toLocaleString()}
  • Items per invoice:        ${STRESS_CONFIG.itemsPerInvoice}
  • Total invoice items:      ${(STRESS_CONFIG.invoicesPerMonth * 12 * STRESS_CONFIG.itemsPerInvoice).toLocaleString()}
  • Expenses per month:       ${STRESS_CONFIG.expensesPerMonth.toLocaleString()}
  • Total expenses (12mo):    ${(STRESS_CONFIG.expensesPerMonth * 12).toLocaleString()}

ESTIMATED DATABASE RECORDS: ${(
  STRESS_CONFIG.products +
  STRESS_CONFIG.customers +
  (STRESS_CONFIG.invoicesPerMonth * 12) +
  (STRESS_CONFIG.expensesPerMonth * 12)
).toLocaleString()}+

Press Ctrl+C within 5 seconds to cancel...
`);

await new Promise(resolve => setTimeout(resolve, 5000));

// Helper functions
function randomDateInMonth(month) {
  const year = 2026;
  const daysInMonth = new Date(year, month, 0).getDate();
  const day = Math.floor(Math.random() * daysInMonth) + 1;
  const hour = Math.floor(Math.random() * 24);
  const minute = Math.floor(Math.random() * 60);
  return new Date(year, month - 1, day, hour, minute);
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Categories for variety
const PRODUCT_CATEGORIES = [
  'Electronics', 'Furniture', 'Accessories', 'Hardware', 'Software',
  'Office Supplies', 'Tools', 'Components', 'Devices', 'Equipment'
];

const CUSTOMER_TYPES = ['customer', 'supplier'];

const EXPENSE_CATEGORIES = [
  'Rent', 'Utilities', 'Salaries', 'Marketing', 'Supplies',
  'Transportation', 'Maintenance', 'Insurance', 'Legal', 'Technology'
];

async function main() {
  const startTime = Date.now();
  
  try {
    console.log('\n🔍 Finding test account...');
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', TEST_EMAIL)
      .single();
    
    if (userError || !user) {
      console.error('❌ Test account not found. Please register test@gmail.com first.');
      return;
    }
    
    console.log(`✅ Found user: ${user.id}`);
    
    const { data: business, error: bizError } = await supabaseAdmin
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (bizError || !business) {
      console.error('❌ Business not found.');
      return;
    }
    
    const businessId = business.id;
    console.log(`✅ Business ID: ${businessId}\n`);
    
    // Clear existing data
    console.log('🧹 Clearing existing stress test data...');
    await supabaseAdmin.from('payments').delete().in('invoice_id', 
      (await supabaseAdmin.from('invoices').select('id').eq('business_id', businessId)).data?.map(i => i.id) || []
    );
    await supabaseAdmin.from('invoices').delete().eq('business_id', businessId);
    await supabaseAdmin.from('expenses').delete().eq('business_id', businessId);
    await supabaseAdmin.from('customers').delete().eq('business_id', businessId);
    await supabaseAdmin.from('products').delete().eq('business_id', businessId);
    console.log('✅ Cleared\n');
    
    // ========== PHASE 1: CREATE PRODUCTS ==========
    console.log(`\n📦 PHASE 1: Creating ${STRESS_CONFIG.products} products...`);
    const products = [];
    const batchSize = 100;
    
    for (let batch = 0; batch < Math.ceil(STRESS_CONFIG.products / batchSize); batch++) {
      const productBatch = [];
      const batchStart = batch * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, STRESS_CONFIG.products);
      
      for (let i = batchStart; i < batchEnd; i++) {
        const category = randomItem(PRODUCT_CATEGORIES);
        productBatch.push({
          business_id: businessId,
          name: `${category} Product ${i + 1}`,
          code: `PRD-${String(i + 1).padStart(6, '0')}`,
          category: category,
          unit: randomItem(['pcs', 'box', 'unit', 'set', 'pack']),
          sale_price: random(500, 50000),
          purchase_price: random(300, 40000),
          stock: random(0, 1000),
          min_stock: random(5, 50),
          tax_rate: 13,
        });
      }
      
      const { data, error } = await supabaseAdmin
        .from('products')
        .insert(productBatch)
        .select();
      
      if (error) throw error;
      products.push(...data);
      
      process.stdout.write(`\r  → Created ${products.length}/${STRESS_CONFIG.products} products`);
    }
    console.log(`\n✅ Created ${products.length} products in ${((Date.now() - startTime) / 1000).toFixed(1)}s\n`);
    
    // ========== PHASE 2: CREATE CUSTOMERS ==========
    console.log(`👥 PHASE 2: Creating ${STRESS_CONFIG.customers} customers...`);
    const customers = [];
    
    for (let batch = 0; batch < Math.ceil(STRESS_CONFIG.customers / batchSize); batch++) {
      const customerBatch = [];
      const batchStart = batch * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, STRESS_CONFIG.customers);
      
      for (let i = batchStart; i < batchEnd; i++) {
        const type = randomItem(CUSTOMER_TYPES);
        const hasGst = Math.random() > 0.5;
        customerBatch.push({
          business_id: businessId,
          name: `${type === 'customer' ? 'Customer' : 'Supplier'} #${i + 1}`,
          phone: `+977-98${String(random(10000000, 99999999))}`,
          email: `contact${i + 1}@example.com`,
          tax_id: hasGst ? `PAN-${String(random(100000, 999999))}` : null,
          address: `${random(1, 999)} Main St, Kathmandu`,
          type: type,
          color_idx: i % 6,
        });
      }
      
      const { data, error } = await supabaseAdmin
        .from('customers')
        .insert(customerBatch)
        .select();
      
      if (error) throw error;
      customers.push(...data);
      
      process.stdout.write(`\r  → Created ${customers.length}/${STRESS_CONFIG.customers} customers`);
    }
    console.log(`\n✅ Created ${customers.length} customers in ${((Date.now() - startTime) / 1000).toFixed(1)}s\n`);
    
    // ========== PHASE 3: CREATE INVOICES ==========
    console.log(`📄 PHASE 3: Creating ${STRESS_CONFIG.invoicesPerMonth * 12} invoices with ${STRESS_CONFIG.itemsPerInvoice} items each...`);
    let totalInvoices = 0;
    let invoiceCounter = 1;
    
    for (let month = 1; month <= 12; month++) {
      const monthName = new Date(2026, month - 1, 1).toLocaleString('default', { month: 'long' });
      process.stdout.write(`\r  → ${monthName}: Creating ${STRESS_CONFIG.invoicesPerMonth} invoices...`);
      
      const invoiceBatch = [];
      
      for (let i = 0; i < STRESS_CONFIG.invoicesPerMonth; i++) {
        const customer = randomItem(customers);
        const items = [];
        let subtotal = 0;
        let taxAmount = 0;
        
        // Create line items
        for (let j = 0; j < STRESS_CONFIG.itemsPerInvoice; j++) {
          const product = randomItem(products);
          const quantity = random(1, 20);
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
        
        // Random payment status
        const statusRoll = Math.random();
        let status, paid;
        if (statusRoll < 0.6) {
          status = 'paid';
          paid = total;
        } else if (statusRoll < 0.8) {
          status = 'partial';
          paid = total * random(30, 80) / 100;
        } else {
          status = 'unpaid';
          paid = 0;
        }
        
        const invoiceDate = randomDateInMonth(month);
        const dueDate = new Date(invoiceDate);
        dueDate.setDate(dueDate.getDate() + random(7, 30));
        
        invoiceBatch.push({
          business_id: businessId,
          customer_id: customer.id,
          invoice_no: `INV-${String(invoiceCounter).padStart(6, '0')}`,
          date: invoiceDate.toISOString(),
          due_date: dueDate.toISOString(),
          items_json: items,
          subtotal,
          tax_amount: taxAmount,
          discount,
          total,
          paid,
          status,
          notes: 'Stress test invoice',
        });
        
        invoiceCounter++;
      }
      
      // Insert batch
      const { data: invoices, error } = await supabaseAdmin
        .from('invoices')
        .insert(invoiceBatch)
        .select();
      
      if (error) throw error;
      
      // Create payments for paid invoices
      const payments = [];
      for (const invoice of invoices) {
        if (invoice.paid > 0) {
          payments.push({
            invoice_id: invoice.id,
            amount: invoice.paid,
            method: randomItem(['cash', 'bank', 'card', 'mobile']),
            date: new Date(new Date(invoice.date).getTime() + random(0, 7) * 24 * 60 * 60 * 1000).toISOString(),
            note: 'Payment received',
          });
        }
      }
      
      if (payments.length > 0) {
        await supabaseAdmin.from('payments').insert(payments);
      }
      
      totalInvoices += invoices.length;
      process.stdout.write(`\r  → ${monthName}: ✓ Created ${invoices.length} invoices (Total: ${totalInvoices})`);
    }
    console.log(`\n✅ Created ${totalInvoices} invoices with ${totalInvoices * STRESS_CONFIG.itemsPerInvoice} line items\n`);
    
    // ========== PHASE 4: CREATE EXPENSES ==========
    console.log(`💰 PHASE 4: Creating ${STRESS_CONFIG.expensesPerMonth * 12} expenses...`);
    let totalExpenses = 0;
    
    for (let month = 1; month <= 12; month++) {
      const monthName = new Date(2026, month - 1, 1).toLocaleString('default', { month: 'short' });
      
      const expenseBatch = [];
      for (let i = 0; i < STRESS_CONFIG.expensesPerMonth; i++) {
        const category = randomItem(EXPENSE_CATEGORIES);
        expenseBatch.push({
          business_id: businessId,
          category: category,
          amount: random(1000, 50000),
          date: randomDateInMonth(month).toISOString(),
          description: `${category} expense - ${monthName} 2026`,
          vendor: `Vendor ${random(1, 100)}`,
        });
      }
      
      const { error } = await supabaseAdmin
        .from('expenses')
        .insert(expenseBatch);
      
      if (error) throw error;
      totalExpenses += expenseBatch.length;
      
      process.stdout.write(`\r  → Created ${totalExpenses}/${STRESS_CONFIG.expensesPerMonth * 12} expenses`);
    }
    console.log(`\n✅ Created ${totalExpenses} expenses\n`);
    
    // ========== FINAL SUMMARY ==========
    const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
    const elapsedMinutes = (elapsedSeconds / 60).toFixed(1);
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║              STRESS TEST COMPLETED!                        ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log('📊 FINAL STATISTICS:\n');
    console.log(`   Products:              ${products.length.toLocaleString()}`);
    console.log(`   Customers:             ${customers.length.toLocaleString()}`);
    console.log(`   Invoices:              ${totalInvoices.toLocaleString()}`);
    console.log(`   Invoice Line Items:    ${(totalInvoices * STRESS_CONFIG.itemsPerInvoice).toLocaleString()}`);
    console.log(`   Expenses:              ${totalExpenses.toLocaleString()}`);
    console.log(`   ─────────────────────────────────────────`);
    console.log(`   TOTAL RECORDS:         ${(products.length + customers.length + totalInvoices + totalExpenses).toLocaleString()}+`);
    console.log(`\n⏱️  Time Taken:            ${elapsedSeconds}s (${elapsedMinutes} minutes)`);
    console.log(`🚀 Records/Second:         ${((products.length + customers.length + totalInvoices + totalExpenses) / elapsedSeconds).toFixed(1)}`);
    
    // Database size estimation
    const estimatedSizeKB = (
      products.length * 0.5 +
      customers.length * 0.3 +
      totalInvoices * 2 +
      totalExpenses * 0.2
    );
    const estimatedSizeMB = (estimatedSizeKB / 1024).toFixed(2);
    
    console.log(`💾 Est. Database Size:     ~${estimatedSizeMB} MB`);
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('   1. Login to test@gmail.com');
    console.log('   2. Test app performance with this massive dataset');
    console.log('   3. Check loading times, pagination, filters');
    console.log('   4. Monitor memory usage and browser performance');
    console.log('   5. Test report generation with large datasets\n');
    
    // Performance recommendations
    console.log('💡 PERFORMANCE TIPS:');
    console.log('   • Use pagination for large lists');
    console.log('   • Implement virtual scrolling for 100+ items');
    console.log('   • Add database indexes on frequently queried fields');
    console.log('   • Consider caching for report data');
    console.log('   • Use lazy loading for invoice items\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
