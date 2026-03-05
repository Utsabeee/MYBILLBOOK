import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import customerRoutes from './routes/customers.js';
import invoiceRoutes from './routes/invoices.js';
import paymentRoutes from './routes/payments.js';
import expenseRoutes from './routes/expenses.js';
import businessRoutes from './routes/business.js';
import reportRoutes from './routes/reports.js';
import quotationRoutes from './routes/quotations.js';
import notesRoutes from './routes/notes.js';

// Import middleware
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============= MIDDLEWARE =============

// CORS - Must be FIRST before anything else (rate limiter, body parser, routes, etc)
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:5177',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
      'http://127.0.0.1:5176',
      'http://127.0.0.1:5177',
    ];

    // Allow requests with no origin (mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Page-Size'],
  maxAge: 3600, // 1 hour
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Rate limiting (AFTER CORS)
// In development, use very high limits; in production, use strict limits
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 for dev, 100 for prod
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => {
    // Skip rate limiting for health checks and auth endpoints
    return req.path === '/api/health' || req.path.startsWith('/api/auth');
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter);

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ============= ROUTES =============

// Public routes (no auth required)
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Protected routes (auth required)
app.use('/api/products', authenticateToken, productRoutes);
app.use('/api/customers', authenticateToken, customerRoutes);
app.use('/api/invoices', authenticateToken, invoiceRoutes);
app.use('/api/payments', authenticateToken, paymentRoutes);
app.use('/api/expenses', authenticateToken, expenseRoutes);
app.use('/api/business', authenticateToken, businessRoutes);
app.use('/api/reports', authenticateToken, reportRoutes);
app.use('/api/quotations', authenticateToken, quotationRoutes);
app.use('/api/notes', authenticateToken, notesRoutes);

// ============= ERROR HANDLING =============

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ============= START SERVER =============

app.listen(PORT, () => {
  console.log(`🚀 MyBillBook API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Frontend URL: ${process.env.FRONTEND_URL}`);
});

export default app;
