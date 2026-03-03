import express from 'express';
import { z } from 'zod';
import { supabase, supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

const creditNoteSchema = z.object({
  invoice_id: z.string().uuid(),
  credit_note_no: z.string().min(1),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().positive(),
    unit_price: z.number().positive(),
    tax_rate: z.number().nonnegative().default(0),
  })),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

const debitNoteSchema = z.object({
  invoice_id: z.string().uuid(),
  debit_note_no: z.string().min(1),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().positive(),
    unit_price: z.number().positive(),
    tax_rate: z.number().nonnegative().default(0),
  })),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

// =========================
// CREDIT NOTES
// =========================

// Get all credit notes
router.get('/credit', async (req, res) => {
  try {
    const { data: notes, error } = await supabaseAdmin
      .from('credit_notes')
      .select('*')
      .eq('business_id', req.user.businessId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(notes || []);
  } catch (error) {
    console.error('Get credit notes error:', error);
    res.status(500).json({ error: 'Failed to fetch credit notes' });
  }
});

// Create credit note
router.post('/credit', async (req, res) => {
  try {
    const validatedData = creditNoteSchema.parse(req.body);

    // Get original invoice
    const { data: invoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', validatedData.invoice_id)
      .single();

    if (!invoice || invoice.business_id !== req.user.businessId) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Calculate credit amount
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

    const total = subtotal + totalTax;

    // Create credit note
    const { data: creditNote, error } = await supabaseAdmin
      .from('credit_notes')
      .insert({
        business_id: req.user.businessId,
        invoice_id: validatedData.invoiceId,
        customer_id: invoice.customer_id,
        credit_note_no: validatedData.credit_note_no,
        items_json: JSON.stringify(itemsDetail),
        subtotal,
        tax_amount: totalTax,
        total,
        reason: validatedData.reason || null,
        notes: validatedData.notes || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Update invoice total and paid (reduce by credit amount)
    const newTotal = Math.max(0, invoice.total - total);
    const newPaid = Math.min(invoice.paid, newTotal);

    await supabaseAdmin
      .from('invoices')
      .update({
        total: newTotal,
        paid: newPaid,
      })
      .eq('id', validatedData.invoiceId);

    res.status(201).json(creditNote);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create credit note error:', error);
    res.status(500).json({ error: 'Failed to create credit note' });
  }
});

// =========================
// DEBIT NOTES
// =========================

// Get all debit notes
router.get('/debit', async (req, res) => {
  try {
    const { data: notes, error } = await supabaseAdmin
      .from('debit_notes')
      .select('*')
      .eq('business_id', req.user.businessId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(notes || []);
  } catch (error) {
    console.error('Get debit notes error:', error);
    res.status(500).json({ error: 'Failed to fetch debit notes' });
  }
});

// Create debit note
router.post('/debit', async (req, res) => {
  try {
    const validatedData = debitNoteSchema.parse(req.body);

    // Get original invoice
    const { data: invoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', validatedData.invoice_id)
      .single();

    if (!invoice || invoice.business_id !== req.user.businessId) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Calculate debit amount
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

    const total = subtotal + totalTax;

    // Create debit note
    const { data: debitNote, error } = await supabaseAdmin
      .from('debit_notes')
      .insert({
        business_id: req.user.businessId,
        invoice_id: validatedData.invoice_id,
        customer_id: invoice.customer_id,
        debit_note_no: validatedData.debit_note_no,
        items_json: JSON.stringify(itemsDetail),
        subtotal,
        tax_amount: totalTax,
        total,
        reason: validatedData.reason || null,
        notes: validatedData.notes || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Update invoice total (increase by debit amount)
    const newTotal = invoice.total + total;

    await supabase
      .from('invoices')
      .update({ total: newTotal })
      .eq('id', validatedData.invoiceId);

    res.status(201).json(debitNote);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create debit note error:', error);
    res.status(500).json({ error: 'Failed to create debit note' });
  }
});

export default router;
