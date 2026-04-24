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

/**
 * Endpoint for users to report bugs or issues.
 * Sends a DM to the configured Discord Admin ID.
 */
router.post('/report', async (req: any, res: any) => {
    const { title, description, userEmail, userName } = req.body;
    const adminId = process.env.DISCORD_ADMIN_ID;

    if (!adminId) {
        return res.status(500).json({ success: false, error: 'Admin ID not configured' });
    }

    try {
        const { DiscordBotService } = require('../services/DiscordBotService');
        
        const embed = {
            title: `🚨 Bug Report: ${title}`,
            description: description,
            color: 0xff0000, // Red
            fields: [
                { name: 'Reporter', value: userName || 'Unknown', inline: true },
                { name: 'Email', value: userEmail || 'Not provided', inline: true }
            ],
            timestamp: new Date().toISOString(),
            footer: { text: 'Clipnic Support Engine' }
        };

        await DiscordBotService.sendDM(adminId, `New Bug Report from **${userName || 'a user'}**`, embed);
        
        res.json({ success: true, message: 'Report sent to administrators' });
    } catch (err: any) {
        console.error('[MonitorRoutes] Bug report failed:', err);
        res.status(500).json({ success: false, error: 'Failed to send report' });
    }
});

export default router;
