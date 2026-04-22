import { Router } from 'express';
import { LoggerService } from '../services/LoggerService';

const router = Router();

/**
 * Proxy endpoint to allow frontend to send logs to Discord 
 * without exposing the Webhook URL in client-side code.
 */
router.post('/log', async (req: any, res: any) => {
    const { title, message, level } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const enrichedMessage = `**User IP**: ${ip}\n**User Agent**: ${userAgent}\n\n${message}`;
    
    try {
        if (level === 'error') {
            await LoggerService.error(`Frontend Fatal: ${title}`, enrichedMessage);
        } else if (level === 'warn') {
            await LoggerService.warn(`Frontend Warning: ${title}`, enrichedMessage);
        } else {
            await LoggerService.info(`Frontend Event: ${title}`, enrichedMessage);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

export default router;
