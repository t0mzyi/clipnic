import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { VerificationController } from '../controllers/VerificationController';
import { SettingsController } from '../controllers/SettingsController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/sync', authenticate, AuthController.sync);
router.post('/verify-discord', authenticate, VerificationController.verifyDiscord);
router.get('/discord', authenticate, VerificationController.discordAuth);
router.get('/discord/callback', VerificationController.discordCallback);

// Google/YouTube Auth Routes
router.get('/youtube', authenticate, VerificationController.youtubeGoogleAuth);
router.get('/youtube/callback', VerificationController.youtubeGoogleCallback);
router.post('/verify-youtube', authenticate, VerificationController.verifyYoutube);
router.delete('/youtube/:channelId', authenticate, VerificationController.disconnectYoutubeChannel);

// Global Settings
router.get('/settings', SettingsController.getSettings);

export default router;
