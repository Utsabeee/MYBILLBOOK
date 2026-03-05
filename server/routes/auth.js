import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import { generateAccessToken, generateRefreshToken } from '../middleware/auth.js';

const router = express.Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  business_name: z.string().min(2),
  owner_name: z.string().min(2),
  business_phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// =========================
// REGISTER
// =========================
router.post('/register', async (req, res) => {
  try {
    const { email, password, business_name, owner_name, business_phone } = registerSchema.parse(req.body);

    // Check if user exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        password_hash: hashedPassword,
        owner_name: owner_name,
      })
      .select()
      .single();

    if (userError) {
      return res.status(400).json({ error: userError.message });
    }

    // Create business
    const { data: business, error: businessError } = await supabaseAdmin
      .from('businesses')
      .insert({
        user_id: user.id,
        name: business_name,
        phone: business_phone || null,
        currency: 'USD',
        tax_enabled: true,
      })
      .select()
      .single();

    if (businessError) {
      return res.status(400).json({ error: businessError.message });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, business.id);
    const refreshToken = generateRefreshToken(user.id, business.id);

    res.status(201).json({
      message: 'Registration successful',
      user: { 
        id: user.id, 
        email: user.email,
        ownerName: user.owner_name 
      },
      business: {
        id: business.id,
        name: business.name,
        phone: business.phone,
        email: business.email,
        address: business.address,
        taxId: business.tax_id,
        currency: business.currency,
        taxEnabled: business.tax_enabled,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// =========================
// LOGIN
// =========================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Get user's business
    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!business) {
      return res.status(400).json({ error: 'No business found for this user' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, business.id);
    const refreshToken = generateRefreshToken(user.id, business.id);

    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, ownerName: user.owner_name },
      business: { id: business.id, name: business.name, currency: business.currency },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// =========================
// REFRESH TOKEN
// =========================
router.post('/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const newAccessToken = generateAccessToken(decoded.userId, decoded.businessId);

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

export default router;
