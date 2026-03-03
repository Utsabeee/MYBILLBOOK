import express from 'express';
import { z } from 'zod';
import { supabase, supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

const expenseSchema = z.object({
  category: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().datetime().optional(),
  description: z.string().optional(),
  vendor: z.string().optional(),
});

// =========================
// GET ALL EXPENSES
// =========================
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = supabaseAdmin
      .from('expenses')
      .select('*')
      .eq('business_id', req.user.businessId)
      .order('date', { ascending: false });

    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { data: expenses, error } = await query;

    if (error) throw error;
    res.json(expenses || []);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// =========================
// CREATE EXPENSE
// =========================
router.post('/', async (req, res) => {
  try {
    const validatedData = expenseSchema.parse(req.body);

    const { data: expense, error } = await supabaseAdmin
      .from('expenses')
      .insert({
        business_id: req.user.businessId,
        category: validatedData.category,
        amount: validatedData.amount,
        date: validatedData.date || new Date().toISOString(),
        description: validatedData.description || null,
        vendor: validatedData.vendor || null,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(expense);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// =========================
// UPDATE EXPENSE
// =========================
router.put('/:id', async (req, res) => {
  try {
    const validatedData = expenseSchema.partial().parse(req.body);

    const { data: expense, error } = await supabaseAdmin
      .from('expenses')
      .update({
        category: validatedData.category,
        amount: validatedData.amount,
        date: validatedData.date,
        description: validatedData.description,
        vendor: validatedData.vendor,
      })
      .eq('id', req.params.id)
      .eq('business_id', req.user.businessId)
      .select()
      .single();

    if (error) throw error;
    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    res.json(expense);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// =========================
// DELETE EXPENSE
// =========================
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('expenses')
      .delete()
      .eq('id', req.params.id)
      .eq('business_id', req.user.businessId);

    if (error) throw error;
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

export default router;
