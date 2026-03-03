import express from 'express';
import { z } from 'zod';
import { supabase, supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

const quotationSchema = z.object({
  customer_id: z.string().uuid(),
  quotation_no: z.string().min(1),
  expiry_date: z.string().datetime().optional(),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().positive(),
    unit_price: z.number().positive(),
    tax_rate: z.number().nonnegative().default(0),
  })),
  discount: z.number().nonnegative().default(0),
  notes: z.string().optional(),
});

// =========================
// GET ALL QUOTATIONS
// =========================
router.get('/', async (req, res) => {
  try {
    const { data: quotations, error } = await supabaseAdmin
      .from('quotations')
      .select('*')
      .eq('business_id', req.user.businessId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(quotations || []);
  } catch (error) {
    console.error('Get quotations error:', error);
    res.status(500).json({ error: 'Failed to fetch quotations' });
  }
});

// =========================
// GET SINGLE QUOTATION
// =========================
router.get('/:id', async (req, res) => {
  try {
    const { data: quotation, error } = await supabaseAdmin
      .from('quotations')
      .select('*')
      .eq('id', req.params.id)
      .eq('business_id', req.user.businessId)
      .single();

    if (error) throw error;
    if (!quotation) return res.status(404).json({ error: 'Quotation not found' });

    // Get customer info
    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('id', quotation.customer_id)
      .single();

    res.json({ ...quotation, customer });
  } catch (error) {
    console.error('Get quotation error:', error);
    res.status(500).json({ error: 'Failed to fetch quotation' });
  }
});

// =========================
// CREATE QUOTATION
// =========================
router.post('/', async (req, res) => {
  try {
    const validatedData = quotationSchema.parse(req.body);

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

    const { data: quotation, error } = await supabaseAdmin
      .from('quotations')
      .insert({
        business_id: req.user.businessId,
        customer_id: validatedData.customer_id,
        quotation_no: validatedData.quotation_no,
        expiry_date: validatedData.expiry_date || null,
        items_json: JSON.stringify(itemsDetail),
        subtotal,
        tax_amount: totalTax,
        discount: validatedData.discount,
        total,
        status: 'draft', // draft, sent, accepted, rejected, converted
        notes: validatedData.notes || null,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(quotation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create quotation error:', error);
    res.status(500).json({ error: 'Failed to create quotation' });
  }
});

// =========================
// CONVERT QUOTATION TO INVOICE
// =========================
router.post('/:id/convert', async (req, res) => {
  try {
    const { invoiceNo } = req.body;

    if (!invoiceNo) {
      return res.status(400).json({ error: 'invoiceNo is required' });
    }

    // Get quotation
    const { data: quotation } = await supabase
      .from('quotations')
      .select('*')
      .eq('id', req.params.id)
      .eq('business_id', req.user.businessId)
      .single();

    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    // Create invoice from quotation
    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({
        business_id: req.user.businessId,
        customer_id: quotation.customer_id,
        invoice_no: invoiceNo,
        date: new Date().toISOString(),
        items_json: quotation.items_json,
        subtotal: quotation.subtotal,
        tax_amount: quotation.tax_amount,
        discount: quotation.discount,
        total: quotation.total,
        paid: 0,
        status: 'draft',
        notes: quotation.notes,
      })
      .select()
      .single();

    if (error) throw error;

    // Update quotation status
    await supabase
      .from('quotations')
      .update({ status: 'converted' })
      .eq('id', req.params.id);

    res.json({ quotation, invoice });
  } catch (error) {
    console.error('Convert quotation error:', error);
    res.status(500).json({ error: 'Failed to convert quotation' });
  }
});

// =========================
// UPDATE QUOTATION STATUS
// =========================
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;

    const { data: quotation, error } = await supabaseAdmin
      .from('quotations')
      .update({ status })
      .eq('id', req.params.id)
      .eq('business_id', req.user.businessId)
      .select()
      .single();

    if (error) throw error;
    if (!quotation) return res.status(404).json({ error: 'Quotation not found' });

    res.json(quotation);
  } catch (error) {
    console.error('Update quotation error:', error);
    res.status(500).json({ error: 'Failed to update quotation' });
  }
});

// =========================
// DELETE QUOTATION
// =========================
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('quotations')
      .delete()
      .eq('id', req.params.id)
      .eq('business_id', req.user.businessId);

    if (error) throw error;
    res.json({ message: 'Quotation deleted successfully' });
  } catch (error) {
    console.error('Delete quotation error:', error);
    res.status(500).json({ error: 'Failed to delete quotation' });
  }
});

export default router;
