import express from 'express';
import { z } from 'zod';
import { supabase, supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

const paymentSchema = z.object({
  invoice_id: z.string().uuid(),
  amount: z.number().positive(),
  method: z.string(), // cash, card, bank, mobile, cheque, other
  date: z.string().datetime().optional(),
  note: z.string().optional(),
});

// =========================
// GET PAYMENTS FOR INVOICE
// =========================
router.get('/invoice/:invoiceId', async (req, res) => {
  try {
    const { data: payments, error } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('invoice_id', req.params.invoiceId)
      .order('date', { ascending: false });

    if (error) throw error;
    res.json(payments || []);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// =========================
// CREATE PAYMENT
// =========================
router.post('/', async (req, res) => {
  try {
    const validatedData = paymentSchema.parse(req.body);

    // Get invoice details
    const { data: invoice } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('id', validatedData.invoice_id)
      .single();

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Verify business ownership
    if (invoice.business_id !== req.user.businessId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Create payment
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        invoice_id: validatedData.invoice_id,
        amount: validatedData.amount,
        method: validatedData.method,
        date: validatedData.date || new Date().toISOString(),
        note: validatedData.note || null,
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Update invoice paid amount
    const totalPaid = (invoice.paid || 0) + validatedData.amount;
    let newStatus = invoice.status;

    if (totalPaid >= invoice.total) {
      newStatus = 'paid';
    } else if (totalPaid > 0) {
      newStatus = 'partial';
    }

    await supabase
      .from('invoices')
      .update({
        paid: totalPaid,
        status: newStatus,
      })
      .eq('id', validatedData.invoiceId);

    res.status(201).json({
      payment,
      invoice: { ...invoice, paid: totalPaid, status: newStatus },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// =========================
// DELETE PAYMENT
// =========================
router.delete('/:id', async (req, res) => {
  try {
    const { data: payment, error } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    // Get invoice
    const { data: invoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', payment.invoice_id)
      .single();

    if (invoice.business_id !== req.user.businessId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete payment
    await supabase
      .from('payments')
      .delete()
      .eq('id', req.params.id);

    // Update invoice
    const newPaid = Math.max(0, (invoice.paid || 0) - payment.amount);
    let newStatus = 'draft';
    if (newPaid >= invoice.total) {
      newStatus = 'paid';
    } else if (newPaid > 0) {
      newStatus = 'partial';
    }

    await supabase
      .from('invoices')
      .update({
        paid: newPaid,
        status: newStatus,
      })
      .eq('id', payment.invoice_id);

    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ error: 'Failed to delete payment' });
  }
});

export default router;
