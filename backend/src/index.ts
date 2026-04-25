import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import campaignRoutes from './routes/campaignRoutes';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import submissionRoutes from './routes/submissionRoutes';
import monitorRoutes from './routes/monitorRoutes';
import { LoggerService } from './services/LoggerService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.disable('x-powered-by');
app.set('trust proxy', 1); // Trust first proxy (Render/Vercel/Cloudflare) for accurate IP rate limiting

app.use(compression()); // Compress all responses for better performance
// Security: Helmet for various HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"], // Removed unsafe-inline for better security
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "https:", "http:", "wss:", "ws:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https:", "http:"],
      frameSrc: ["'self'", "https://www.youtube.com", "https://youtube.com"],
      frameAncestors: ["'none'"] // SKILL.md recommendation
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: { maxAge: 63072000, includeSubDomains: true, preload: true } // SKILL.md recommendation
}));

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'https://clipnic.com',
  'https://www.clipnic.com',
  'https://dash.clipnic.com',
  'https://www.dash.clipnic.com'
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    // Be more specific even in development for security consistency
    if (allowedOrigins.indexOf(origin) !== -1 || (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost:'))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Idempotency-Key']
}));

app.use(express.json({ limit: '50kb' })); // SKILL.md recommendation: limit body size to 50kb

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'development' ? 1000 : 200, // Be much more lenient, especially in dev
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many authentication attempts, please try again in an hour.' },
  skip: (req) => process.env.NODE_ENV === 'development' // Skip limiting in local development
});

// Apply global limiter to all routes
app.use(globalLimiter);

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/monitor', monitorRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Don't leak stack traces in production
  if (process.env.NODE_ENV !== 'development') {
      delete err.stack;
  } else {
      console.error(err.stack);
  }
  
  // Log critical server errors
  if (!err.status || err.status >= 500) {
    LoggerService.error('Backend Server Error', `**Route**: ${req.method} ${req.path}\n**Error**: ${err.message}`);
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    code: err.status || 500,
  });
});

app.listen(PORT, () => {
    const domain = process.env.RENDER_EXTERNAL_URL;
    LoggerService.info('Server Started', `Server listening on port ${PORT}`);
    
    // Only log to Discord if we have a real domain (Production)
    if (domain && !domain.includes('localhost')) {
        LoggerService.info('Backend Online', `Server successfully started on **${domain}**`);
    }

    // Keep-alive ping for Render free tier (prevents 50s cold start that kills Discord OAuth codes)
    if (process.env.NODE_ENV !== 'development' && process.env.RENDER_EXTERNAL_URL) {
        const keepAliveUrl = `${process.env.RENDER_EXTERNAL_URL}/api/auth/discord/debug`;
        setInterval(async () => {
            try {
                await fetch(keepAliveUrl);
                console.log('[keep-alive] pinged successfully');
            } catch (e) {
                console.warn('[keep-alive] ping failed:', e);
            }
        }, 14 * 60 * 1000); // every 14 minutes
    }
});

// Lifecycle Listeners for Shutdown/Crash
process.on('SIGTERM', async () => {
    await LoggerService.warn('Backend Shutting Down', 'Process received SIGTERM. Graceful shutdown initiated.');
    process.exit(0);
});

process.on('SIGINT', async () => {
    await LoggerService.warn('Backend Shutting Down', 'Process received SIGINT. Manual shutdown initiated.');
    process.exit(0);
});

process.on('uncaughtException', async (error) => {
    await LoggerService.error('Backend Crash (Uncaught)', `**Error**: ${error.message}\n\`\`\`${error.stack?.slice(0, 500)}\`\`\``);
    process.exit(1);
});

process.on('unhandledRejection', async (reason: any) => {
    await LoggerService.error('Backend Crash (Unhandled Rejection)', `**Reason**: ${reason?.message || reason}`);
    process.exit(1);
});
