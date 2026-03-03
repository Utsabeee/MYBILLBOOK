import express from 'express';
import { z } from 'zod';
import { supabase, supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

const productSchema = z.object({
  name: z.string().min(1),
  code: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().optional(),
  sale_price: z.number().positive(),
  purchase_price: z.number().positive().optional(),
  stock: z.number().nonnegative().default(0),
  min_stock: z.number().nonnegative().default(0),
  tax_rate: z.number().nonnegative().default(0),
});

// =========================
// GET ALL PRODUCTS
// =========================
router.get('/', async (req, res) => {
  try {
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('business_id', req.user.businessId)
      .order('name');

    if (error) throw error;
    res.json(products || []);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// =========================
// GET SINGLE PRODUCT
// =========================
router.get('/:id', async (req, res) => {
  try {
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .eq('business_id', req.user.businessId)
      .single();

    if (error) throw error;
    if (!product) return res.status(404).json({ error: 'Product not found' });

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// =========================
// CREATE PRODUCT
// =========================
router.post('/', async (req, res) => {
  try {
    const validatedData = productSchema.parse(req.body);

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .insert({
        business_id: req.user.businessId,
        name: validatedData.name,
        code: validatedData.code || null,
        category: validatedData.category || null,
        unit: validatedData.unit || 'pcs',
        sale_price: validatedData.sale_price,
        purchase_price: validatedData.purchase_price || validatedData.sale_price,
        stock: validatedData.stock,
        min_stock: validatedData.min_stock,
        tax_rate: validatedData.tax_rate,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// =========================
// UPDATE PRODUCT
// =========================
router.put('/:id', async (req, res) => {
  try {
    const validatedData = productSchema.partial().parse(req.body);

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .update({
        name: validatedData.name,
        code: validatedData.code,
        category: validatedData.category,
        unit: validatedData.unit,
        sale_price: validatedData.sale_price,
        purchase_price: validatedData.purchase_price,
        stock: validatedData.stock,
        min_stock: validatedData.min_stock,
        tax_rate: validatedData.tax_rate,
      })
      .eq('id', req.params.id)
      .eq('business_id', req.user.businessId)
      .select()
      .single();

    if (error) throw error;
    if (!product) return res.status(404).json({ error: 'Product not found' });

    res.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// =========================
// DELETE PRODUCT
// =========================
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', req.params.id)
      .eq('business_id', req.user.businessId);

    if (error) throw error;
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
