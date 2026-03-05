import express from 'express';
import { z } from 'zod';
import { supabase, supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

const businessSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  tax_id: z.string().optional(),
  currency: z.string().length(3).optional(),
  logo_url: z.string().optional(), // Changed from .url() to accept base64 data URLs
});

// =========================
// GET BUSINESS PROFILE
// =========================
router.get('/', async (req, res) => {
  try {
    const { data: business, error } = await supabaseAdmin
      .from('businesses')
      .select('*')
      .eq('id', req.user.businessId)
      .single();

    if (error) throw error;
    if (!business) return res.status(404).json({ error: 'Business not found' });

    res.json(business);
  } catch (error) {
    console.error('Get business error:', error);
    res.status(500).json({ error: 'Failed to fetch business' });
  }
});

// =========================
// UPDATE BUSINESS PROFILE
// =========================
router.put('/', async (req, res) => {
  try {
    const validatedData = businessSchema.parse(req.body);

    const { data: business, error } = await supabaseAdmin
      .from('businesses')
      .update({
        name: validatedData.name,
        phone: validatedData.phone,
        email: validatedData.email,
        address: validatedData.address,
        tax_id: validatedData.tax_id,
        currency: validatedData.currency,
        logo_url: validatedData.logo_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.user.businessId)
      .select()
      .single();

    if (error) throw error;
    res.json(business);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update business error:', error);
    res.status(500).json({ error: 'Failed to update business' });
  }
});

// =========================
// GET BUSINESS STATS
// =========================
router.get('/stats/overview', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let invoiceQuery = supabase
      .from('invoices')
      .select('total, status, paid')
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

    const totalRevenue = (invoices || []).reduce((sum, inv) => sum + inv.total, 0);
    const totalExpenses = (expenses || []).reduce((sum, exp) => sum + exp.amount, 0);
    const totalPaid = (invoices || []).reduce((sum, inv) => sum + (inv.paid || 0), 0);
    const totalOutstanding = totalRevenue - totalPaid;
    const profit = totalRevenue - totalExpenses;

    res.json({
      totalRevenue,
      totalExpenses,
      totalPaid,
      totalOutstanding,
      profit,
      invoiceCount: invoices?.length || 0,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
