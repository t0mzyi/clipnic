import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { VerificationController } from '../controllers/VerificationController';
import { SettingsController } from '../controllers/SettingsController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/sync', authenticate, AuthController.sync);
router.get('/login/google', AuthController.googleAuth);
router.get('/login/google/callback', AuthController.googleCallback);
router.get('/login/discord', AuthController.discordAuth);
router.get('/login/discord/callback', AuthController.discordCallback);
router.post('/verify-discord', authenticate, VerificationController.verifyDiscord);
router.get('/discord', authenticate, VerificationController.discordAuth);
router.get('/discord/callback', VerificationController.discordCallback);
router.get('/discord/debug', (req, res) => res.json({ success: true, message: 'Keep-alive active' }));
router.post('/login/brand', AuthController.brandLogin);

// Google/YouTube Auth Routes
router.get('/youtube', authenticate, VerificationController.youtubeGoogleAuth);
router.get('/youtube/callback', VerificationController.youtubeGoogleCallback);
router.post('/verify-youtube', authenticate, VerificationController.verifyYoutube);
router.post('/verify-instagram', authenticate, VerificationController.verifyInstagram);
router.post('/verify-instagram-bio', authenticate, VerificationController.verifyInstagram);
router.post('/verify-tiktok-bio', authenticate, VerificationController.verifyTiktokBio);
router.delete('/youtube/:channelId', authenticate, VerificationController.disconnectYoutubeChannel);
router.delete('/instagram', authenticate, VerificationController.disconnectInstagram);
router.delete('/tiktok', authenticate, VerificationController.disconnectTiktok);
router.delete('/discord', authenticate, VerificationController.disconnectDiscord);

// Global Settings
router.get('/settings', SettingsController.getSettings);

export default router;
