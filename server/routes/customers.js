import express from 'express';
import { z } from 'zod';
import { supabase, supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

const customerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  tax_id: z.string().optional(),
  address: z.string().optional(),
  type: z.string().optional(), // B2B, B2C, etc.
  color_idx: z.number().optional(),
});

// =========================
// GET ALL CUSTOMERS
// =========================
router.get('/', async (req, res) => {
  try {
    const { data: customers, error } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('business_id', req.user.businessId)
      .order('name');

    if (error) throw error;
    res.json(customers || []);
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// =========================
// GET SINGLE CUSTOMER
// =========================
router.get('/:id', async (req, res) => {
  try {
    const { data: customer, error } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', req.params.id)
      .eq('business_id', req.user.businessId)
      .single();

    if (error) throw error;
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    // Get customer's invoices and balance
    const { data: invoices } = await supabase
      .from('invoices')
      .select('total, status, paid')
      .eq('customer_id', req.params.id);

    const balance = (invoices || []).reduce((sum, inv) => {
      return sum + (inv.total - (inv.paid || 0));
    }, 0);

    res.json({ ...customer, balance });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// =========================
// CREATE CUSTOMER
// =========================
router.post('/', async (req, res) => {
  try {
    const validatedData = customerSchema.parse(req.body);

    const { data: customer, error } = await supabaseAdmin
      .from('customers')
      .insert({
        business_id: req.user.businessId,
        name: validatedData.name,
        phone: validatedData.phone || null,
        email: validatedData.email || null,
        tax_id: validatedData.taxId || null,
        address: validatedData.address || null,
        type: validatedData.type || 'B2C',
        color_idx: validatedData.colorIdx || 0,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(customer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// =========================
// UPDATE CUSTOMER
// =========================
router.put('/:id', async (req, res) => {
  try {
    const validatedData = customerSchema.partial().parse(req.body);

    const { data: customer, error } = await supabaseAdmin
      .from('customers')
      .update({
        name: validatedData.name,
        phone: validatedData.phone,
        email: validatedData.email,
        tax_id: validatedData.taxId,
        address: validatedData.address,
        type: validatedData.type,
        color_idx: validatedData.colorIdx,
      })
      .eq('id', req.params.id)
      .eq('business_id', req.user.businessId)
      .select()
      .single();

    if (error) throw error;
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    res.json(customer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// =========================
// DELETE CUSTOMER
// =========================
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('customers')
      .delete()
      .eq('id', req.params.id)
      .eq('business_id', req.user.businessId);

    if (error) throw error;
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

export default router;
