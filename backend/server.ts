import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/auth.js';
import tenantRoutes from './routes/tenants.js';
import outletRoutes from './routes/outlets.js';
import subscriptionRoutes from './routes/subscriptions.js';
import analyticsRoutes from './routes/analytics.js';
import webhookRoutes from './routes/webhooks.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5000';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Configure CORS for production and development
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In production, allow specific origins
    if (NODE_ENV === 'production') {
      const allowedOrigins = [
        FRONTEND_URL,
        process.env.REPLIT_URL,
        process.env.REPL_URL,
        // Add other production domains as needed
      ].filter(Boolean);
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'), false);
    }
    
    // In development, be more lenient
    if (origin.startsWith('http://localhost') || 
        origin.startsWith('https://localhost') ||
        origin.includes('.replit.') ||
        origin === FRONTEND_URL) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));

// Stripe webhook needs raw body, so handle it before JSON parsing
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/outlets', outletRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/webhooks', webhookRoutes);

// Serve static files in production
if (NODE_ENV === 'production') {
  app.use(express.static(path.join(process.cwd(), '../dist')));
  
  // Handle React Router - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(process.cwd(), '../dist/index.html'));
    }
  });
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Customer Dashboard Backend running on port ${PORT}`);
  console.log(`📊 Frontend URL: ${FRONTEND_URL}`);
  console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
});