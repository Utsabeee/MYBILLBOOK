/**
 * MEGA STRESS TEST - Push to ABSOLUTE LIMITS
 * 
 * This creates 10x more data than the standard stress test:
 * - 5,000 products
 * - 2,000 customers
 * - 5,000 invoices (with complex line items)
 * - 3,000 expenses
 * 
 * WARNING: This will take several minutes and create ~15,000+ records!
 */

import { supabaseAdmin } from '../config/supabase.js';

const TEST_EMAIL = 'test@gmail.com';

const MEGA_CONFIG = {
  products: 5000,
  customers: 2000,
  invoicesPerMonth: 400,  // 400 per month = 4,800 per year
  expensesPerMonth: 250,  // 250 per month = 3,000 per year
  itemsPerInvoice: 15,
};

console.log(`
╔════════════════════════════════════════════════════════════╗
║           MEGA STRESS TEST - ABSOLUTE LIMITS               ║
╚════════════════════════════════════════════════════════════╝

⚠️  EXTREME WARNING: This creates MASSIVE amounts of data! ⚠️

Configuration:
  • Products:                 ${MEGA_CONFIG.products.toLocaleString()}
  • Customers:                ${MEGA_CONFIG.customers.toLocaleString()}
  • Invoices per month:       ${MEGA_CONFIG.invoicesPerMonth.toLocaleString()}
  • Total invoices (12mo):    ${(MEGA_CONFIG.invoicesPerMonth * 12).toLocaleString()}
  • Items per invoice:        ${MEGA_CONFIG.itemsPerInvoice}
  • Total invoice items:      ${(MEGA_CONFIG.invoicesPerMonth * 12 * MEGA_CONFIG.itemsPerInvoice).toLocaleString()}
  • Expenses per month:       ${MEGA_CONFIG.expensesPerMonth.toLocaleString()}
  • Total expenses (12mo):    ${(MEGA_CONFIG.expensesPerMonth * 12).toLocaleString()}

ESTIMATED TOTAL RECORDS: ${(
  MEGA_CONFIG.products +
  MEGA_CONFIG.customers +
  (MEGA_CONFIG.invoicesPerMonth * 12) +
  (MEGA_CONFIG.expensesPerMonth * 12)
).toLocaleString()}+

DATABASE LOAD: ~15 MB of data
TIME ESTIMATE: 3-5 minutes

Press Ctrl+C within 10 seconds to cancel...
`);

await new Promise(resolve => setTimeout(resolve, 10000));

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

const PRODUCT_CATEGORIES = [
  'Electronics', 'Furniture', 'Accessories', 'Hardware', 'Software',
  'Office Supplies', 'Tools', 'Components', 'Devices', 'Equipment',
  'Machinery', 'Vehicles', 'Appliances', 'Textiles', 'Medical'
];

const CUSTOMER_TYPES = ['customer', 'supplier'];
const EXPENSE_CATEGORIES = [
  'Rent', 'Utilities', 'Salaries', 'Marketing', 'Supplies',
  'Transportation', 'Maintenance', 'Insurance', 'Legal', 'Technology',
  'Training', 'Consulting', 'Research', 'Development', 'Operations'
];

async function main() {
  const startTime = Date.now();
  
  try {
    console.log('\n🔍 Finding test account...');
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', TEST_EMAIL)
      .single();
    
    if (!user) {
      console.error('❌ Test account not found.');
      return;
    }
    
    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    const businessId = business.id;
    console.log(`✅ Business ID: ${businessId}\n`);
    
    // Clear
    console.log('🧹 Clearing existing data...');
    await supabaseAdmin.from('payments').delete().in('invoice_id', 
      (await supabaseAdmin.from('invoices').select('id').eq('business_id', businessId)).data?.map(i => i.id) || []
    );
    await supabaseAdmin.from('invoices').delete().eq('business_id', businessId);
    await supabaseAdmin.from('expenses').delete().eq('business_id', businessId);
    await supabaseAdmin.from('customers').delete().eq('business_id', businessId);
    await supabaseAdmin.from('products').delete().eq('business_id', businessId);
    console.log('✅ Cleared\n');
    
    // PRODUCTS
    console.log(`📦 Creating ${MEGA_CONFIG.products} products...`);
    const products = [];
    const batchSize = 200;
    
    for (let batch = 0; batch < Math.ceil(MEGA_CONFIG.products / batchSize); batch++) {
      const productBatch = [];
      const batchStart = batch * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, MEGA_CONFIG.products);
      
      for (let i = batchStart; i < batchEnd; i++) {
        const category = randomItem(PRODUCT_CATEGORIES);
        productBatch.push({
          business_id: businessId,
          name: `${category} Item ${i + 1}`,
          code: `MEGA-${String(i + 1).padStart(6, '0')}`,
          category: category,
          unit: randomItem(['pcs', 'box', 'unit', 'set', 'pack']),
          sale_price: random(100, 100000),
          purchase_price: random(50, 80000),
          stock: random(0, 2000),
          min_stock: random(5, 100),
          tax_rate: 13,
        });
      }
      
      const { data } = await supabaseAdmin.from('products').insert(productBatch).select();
      products.push(...data);
      process.stdout.write(`\r  → ${products.length}/${MEGA_CONFIG.products}`);
    }
    console.log(`\n✅ ${products.length} products in ${((Date.now() - startTime) / 1000).toFixed(1)}s\n`);
    
    // CUSTOMERS
    console.log(`👥 Creating ${MEGA_CONFIG.customers} customers...`);
    const customers = [];
    
    for (let batch = 0; batch < Math.ceil(MEGA_CONFIG.customers / batchSize); batch++) {
      const customerBatch = [];
      const batchStart = batch * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, MEGA_CONFIG.customers);
      
      for (let i = batchStart; i < batchEnd; i++) {
        customerBatch.push({
          business_id: businessId,
          name: `Contact #${i + 1}`,
          phone: `+977-98${String(random(10000000, 99999999))}`,
          email: `mega${i + 1}@test.com`,
          tax_id: Math.random() > 0.5 ? `PAN-${random(100000, 999999)}` : null,
          address: `Address ${i + 1}`,
          type: randomItem(CUSTOMER_TYPES),
          color_idx: i % 6,
        });
      }
      
      const { data } = await supabaseAdmin.from('customers').insert(customerBatch).select();
      customers.push(...data);
      process.stdout.write(`\r  → ${customers.length}/${MEGA_CONFIG.customers}`);
    }
    console.log(`\n✅ ${customers.length} customers in ${((Date.now() - startTime) / 1000).toFixed(1)}s\n`);
    
    // INVOICES
    console.log(`📄 Creating ${MEGA_CONFIG.invoicesPerMonth * 12} invoices...`);
    let totalInvoices = 0;
    let invoiceCounter = 1;
    
    for (let month = 1; month <= 12; month++) {
      const monthName = new Date(2026, month - 1, 1).toLocaleString('default', { month: 'short' });
      
      // Process in smaller batches for invoices
      const invoicesThisMonth = MEGA_CONFIG.invoicesPerMonth;
      const invBatchSize = 50;
      
      for (let invBatch = 0; invBatch < Math.ceil(invoicesThisMonth / invBatchSize); invBatch++) {
        const invoiceBatch = [];
        const batchStart = invBatch * invBatchSize;
        const batchEnd = Math.min(batchStart + invBatchSize, invoicesThisMonth);
        
        for (let i = batchStart; i < batchEnd; i++) {
          const customer = randomItem(customers);
          const items = [];
          let subtotal = 0;
          let taxAmount = 0;
          
          for (let j = 0; j < MEGA_CONFIG.itemsPerInvoice; j++) {
            const product = randomItem(products);
            const quantity = random(1, 50);
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
          
          const total = subtotal + taxAmount;
          const paid = Math.random() > 0.3 ? total : 0;
          
          invoiceBatch.push({
            business_id: businessId,
            customer_id: customer.id,
            invoice_no: `MEGA-${String(invoiceCounter).padStart(6, '0')}`,
            date: randomDateInMonth(month).toISOString(),
            due_date: new Date().toISOString(),
            items_json: items,
            subtotal,
            tax_amount: taxAmount,
            discount: 0,
            total,
            paid,
            status: paid > 0 ? 'paid' : 'unpaid',
            notes: 'Mega test',
          });
          
          invoiceCounter++;
        }
        
        const { data: invoices } = await supabaseAdmin.from('invoices').insert(invoiceBatch).select();
        
        // Create payments
        const payments = invoices.filter(inv => inv.paid > 0).map(inv => ({
          invoice_id: inv.id,
          amount: inv.paid,
          method: 'cash',
          date: inv.date,
          note: 'Payment',
        }));
        
        if (payments.length > 0) {
          await supabaseAdmin.from('payments').insert(payments);
        }
        
        totalInvoices += invoices.length;
      }
      
      process.stdout.write(`\r  → ${monthName}: ${totalInvoices}/${MEGA_CONFIG.invoicesPerMonth * 12}`);
    }
    console.log(`\n✅ ${totalInvoices} invoices in ${((Date.now() - startTime) / 1000).toFixed(1)}s\n`);
    
    // EXPENSES
    console.log(`💰 Creating ${MEGA_CONFIG.expensesPerMonth * 12} expenses...`);
    let totalExpenses = 0;
    
    for (let month = 1; month <= 12; month++) {
      const expenseBatch = [];
      
      for (let i = 0; i < MEGA_CONFIG.expensesPerMonth; i++) {
        expenseBatch.push({
          business_id: businessId,
          category: randomItem(EXPENSE_CATEGORIES),
          amount: random(1000, 100000),
          date: randomDateInMonth(month).toISOString(),
          description: `Expense ${totalExpenses + i + 1}`,
          vendor: `Vendor ${random(1, 500)}`,
        });
      }
      
      await supabaseAdmin.from('expenses').insert(expenseBatch);
      totalExpenses += expenseBatch.length;
      process.stdout.write(`\r  → ${totalExpenses}/${MEGA_CONFIG.expensesPerMonth * 12}`);
    }
    console.log(`\n✅ ${totalExpenses} expenses\n`);
    
    // SUMMARY
    const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
    const elapsedMinutes = (elapsedSeconds / 60).toFixed(1);
    const totalRecords = products.length + customers.length + totalInvoices + totalExpenses;
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║         MEGA STRESS TEST COMPLETED! 🎉                     ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log(`   Products:              ${products.length.toLocaleString()}`);
    console.log(`   Customers:             ${customers.length.toLocaleString()}`);
    console.log(`   Invoices:              ${totalInvoices.toLocaleString()}`);
    console.log(`   Invoice Line Items:    ${(totalInvoices * MEGA_CONFIG.itemsPerInvoice).toLocaleString()}`);
    console.log(`   Expenses:              ${totalExpenses.toLocaleString()}`);
    console.log(`   ─────────────────────────────────────────`);
    console.log(`   TOTAL RECORDS:         ${totalRecords.toLocaleString()}+`);
    console.log(`\n⏱️  Time:                  ${elapsedSeconds}s (${elapsedMinutes} min)`);
    console.log(`🚀 Records/Second:         ${(totalRecords / elapsedSeconds).toFixed(1)}`);
    console.log(`💾 Est. Size:              ~${(totalRecords * 1.5 / 1024).toFixed(1)} MB\n`);
    
    console.log('🎯 The app should now be at its ABSOLUTE LIMIT!');
    console.log('   Test performance, pagination, and loading times.\n');
    
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
