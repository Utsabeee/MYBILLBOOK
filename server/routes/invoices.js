import express from 'express';
import { z } from 'zod';
import { supabase, supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

const invoiceSchema = z.object({
  customer_id: z.string().uuid(),
  invoice_no: z.string().min(1).optional(), // Auto-generated if not provided
  date: z.string().datetime().optional(),
  due_date: z.string().datetime().optional(),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().positive(),
    unit_price: z.number().positive(),
    tax_rate: z.number().nonnegative().default(0),
  })),
  discount: z.number().nonnegative().default(0),
  notes: z.string().optional(),
  status: z.string().default('draft'), // draft, sent, paid, partial, overdue
});

// =========================
// GET ALL INVOICES
// =========================
router.get('/', async (req, res) => {
  try {
    const { data: invoices, error } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('business_id', req.user.businessId)
      .order('date', { ascending: false });

    if (error) throw error;
    res.json(invoices || []);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// =========================
// GET SINGLE INVOICE
// =========================
router.get('/:id', async (req, res) => {
  try {
    const { data: invoice, error } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('id', req.params.id)
      .eq('business_id', req.user.businessId)
      .single();

    if (error) throw error;
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    // Get associated customer and payments
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', invoice.customer_id)
      .single();

    const { data: payments } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('invoice_id', req.params.id);

    res.json({ ...invoice, customer, payments: payments || [] });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// =========================
// CREATE INVOICE
// =========================
router.post('/', async (req, res) => {
  try {
    const validatedData = invoiceSchema.parse(req.body);

    // Calculate totals
    let subtotal = 0;
    let totalTax = 0;
    const itemsDetail = [];

    for (const item of validatedData.items) {
      const itemAmount = item.quantity * item.unit_price;
      const itemTax = itemAmount * (item.tax_rate / 100);
      subtotal += itemAmount;
      totalTax += itemTax;
      itemsDetail.push({
        productId: item.product_id,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        amount: itemAmount,
        taxRate: item.tax_rate,
        taxAmount: itemTax,
      });
    }

    const total = subtotal + totalTax - validatedData.discount;

    // Generate invoice number if not provided
    const invoiceNo = validatedData.invoice_no || `INV-${Date.now()}`;

    const { data: invoice, error } = await supabaseAdmin
      .from('invoices')
      .insert({
        business_id: req.user.businessId,
        customer_id: validatedData.customer_id,
        invoice_no: invoiceNo,
        date: validatedData.date || new Date().toISOString(),
        due_date: validatedData.due_date || null,
        items_json: JSON.stringify(itemsDetail),
        subtotal,
        tax_amount: totalTax,
        discount: validatedData.discount,
        total,
        paid: 0,
        status: validatedData.status,
        notes: validatedData.notes || null,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(invoice);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// =========================
// UPDATE INVOICE
// =========================
router.put('/:id', async (req, res) => {
  try {
    const { status, notes } = req.body;

    const { data: invoice, error } = await supabase
      .from('invoices')
      .update({
        status: status || undefined,
        notes: notes || undefined,
      })
      .eq('id', req.params.id)
      .eq('business_id', req.user.businessId)
      .select()
      .single();

    if (error) throw error;
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    res.json(invoice);
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

// =========================
// DELETE INVOICE
// =========================
router.delete('/:id', async (req, res) => {
  try {
    // Delete associated payments first
    await supabase
      .from('payments')
      .delete()
      .eq('invoice_id', req.params.id);

    // Delete invoice
    const { error } = await supabaseAdmin
      .from('invoices')
      .delete()
      .eq('id', req.params.id)
      .eq('business_id', req.user.businessId);

    if (error) throw error;
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

export default router;
