import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import campaignRoutes from './routes/campaignRoutes';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import submissionRoutes from './routes/submissionRoutes';
import monitorRoutes from './routes/monitorRoutes';
import { LoggerService } from './services/LoggerService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173'
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/monitor', monitorRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  
  // Log critical server errors to Discord
  if (!err.status || err.status >= 500) {
    LoggerService.error('Backend Server Error', `**Route**: ${req.method} ${req.path}\n**Error**: ${err.message}\n\`\`\`${err.stack?.slice(0, 500)}...\`\`\``);
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    code: err.status || 500,
  });
});

app.listen(PORT, () => {
    const domain = process.env.RENDER_EXTERNAL_URL;
    console.log(`Server listening on port ${PORT}`);
    
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
