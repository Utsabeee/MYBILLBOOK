import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// =========================
// SALES REPORT
// =========================
router.get('/sales', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = supabase
      .from('invoices')
      .select('*')
      .eq('business_id', req.user.businessId);

    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { data: invoices, error } = await query;

    if (error) throw error;

    // Group by product
    const salesByProduct = {};
    const salesByCustomer = {};

    for (const invoice of invoices || []) {
      const items = JSON.parse(invoice.items_json || '[]');

      for (const item of items) {
        if (!salesByProduct[item.productId]) {
          salesByProduct[item.productId] = { quantity: 0, revenue: 0 };
        }
        salesByProduct[item.productId].quantity += item.quantity;
        salesByProduct[item.productId].revenue += item.amount + item.taxAmount;
      }

      if (!salesByCustomer[invoice.customer_id]) {
        salesByCustomer[invoice.customer_id] = { count: 0, revenue: 0 };
      }
      salesByCustomer[invoice.customer_id].count += 1;
      salesByCustomer[invoice.customer_id].revenue += invoice.total;
    }

    res.json({
      byProduct: salesByProduct,
      byCustomer: salesByCustomer,
      totalInvoices: invoices?.length || 0,
      totalRevenue: (invoices || []).reduce((sum, inv) => sum + inv.total, 0),
    });
  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({ error: 'Failed to fetch sales report' });
  }
});

// =========================
// PROFIT & LOSS REPORT
// =========================
router.get('/profitloss', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let invoiceQuery = supabase
      .from('invoices')
      .select('total')
      .eq('business_id', req.user.businessId);

    let expenseQuery = supabase
      .from('expenses')
      .select('amount')
      .eq('business_id', req.user.businessId);

    if (startDate) {
      invoiceQuery = invoiceQuery.gte('date', startDate);
      expenseQuery = expenseQuery.gte('date', startDate);
    }

    if (endDate) {
      invoiceQuery = invoiceQuery.lte('date', endDate);
      expenseQuery = expenseQuery.lte('date', endDate);
    }

    const { data: invoices } = await invoiceQuery;
    const { data: expenses } = await expenseQuery;

    const revenue = (invoices || []).reduce((sum, inv) => sum + inv.total, 0);
    const totalExpenses = (expenses || []).reduce((sum, exp) => sum + exp.amount, 0);
    const profit = revenue - totalExpenses;

    res.json({
      revenue,
      expenses: totalExpenses,
      profit,
      profitMargin: revenue > 0 ? ((profit / revenue) * 100).toFixed(2) : 0,
    });
  } catch (error) {
    console.error('P&L report error:', error);
    res.status(500).json({ error: 'Failed to fetch P&L report' });
  }
});

// =========================
// INVENTORY REPORT
// =========================
router.get('/inventory', async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('business_id', req.user.businessId)
      .order('name');

    if (error) throw error;

    const inventory = (products || []).map(product => ({
      id: product.id,
      name: product.name,
      stock: product.stock,
      minStock: product.min_stock,
      unitPrice: product.sale_price,
      stockValue: product.stock * product.sale_price,
      status: product.stock <= product.min_stock ? 'low' : 'ok',
    }));

    const totalValue = inventory.reduce((sum, item) => sum + item.stockValue, 0);

    res.json({
      items: inventory,
      totalItems: inventory.length,
      totalValue,
      lowStockItems: inventory.filter(item => item.status === 'low'),
    });
  } catch (error) {
    console.error('Inventory report error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory report' });
  }
});

// =========================
// CUSTOMER REPORT
// =========================
router.get('/customers', async (req, res) => {
  try {
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('business_id', req.user.businessId);

    if (customerError) throw customerError;

    const { data: invoices } = await supabase
      .from('invoices')
      .select('customer_id, total, paid')
      .eq('business_id', req.user.businessId);

    const customerStats = (customers || []).map(customer => {
      const customerInvoices = (invoices || []).filter(inv => inv.customer_id === customer.id);
      const totalSpent = customerInvoices.reduce((sum, inv) => sum + inv.total, 0);
      const totalPaid = customerInvoices.reduce((sum, inv) => sum + (inv.paid || 0), 0);
      const outstanding = totalSpent - totalPaid;

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        type: customer.type,
        invoiceCount: customerInvoices.length,
        totalSpent,
        totalPaid,
        outstanding,
      };
    });

    res.json({
      customers: customerStats,
      totalCustomers: customerStats.length,
      totalRevenue: customerStats.reduce((sum, c) => sum + c.totalSpent, 0),
      totalOutstanding: customerStats.reduce((sum, c) => sum + c.outstanding, 0),
    });
  } catch (error) {
    console.error('Customer report error:', error);
    res.status(500).json({ error: 'Failed to fetch customer report' });
  }
});

export default router;
