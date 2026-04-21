import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { VerificationController } from '../controllers/VerificationController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/sync', authenticate, AuthController.sync);
router.post('/verify-discord', authenticate, VerificationController.verifyDiscord);
router.get('/discord', authenticate, VerificationController.discordAuth);
router.get('/discord/callback', VerificationController.discordCallback);
router.post('/verify-youtube', authenticate, VerificationController.verifyYoutube);

// TEMPORARY DEBUG - remove after fixing Discord
router.get('/discord/debug', (req, res) => {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;
  const frontendUrl = process.env.FRONTEND_URL;
  res.json({
    DISCORD_CLIENT_ID: clientId ? `${clientId.slice(0,6)}...${clientId.slice(-4)}` : 'MISSING',
    DISCORD_CLIENT_SECRET: clientSecret ? `${clientSecret.slice(0,4)}...${clientSecret.slice(-4)} (len=${clientSecret.length})` : 'MISSING',
    DISCORD_REDIRECT_URI: redirectUri || 'MISSING',
    FRONTEND_URL: frontendUrl || 'MISSING',
    NODE_VERSION: process.version
  });
});

export default router;
