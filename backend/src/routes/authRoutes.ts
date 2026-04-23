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
router.post('/verify-instagram', authenticate, VerificationController.verifyInstagram);
router.post('/verify-instagram-bio', authenticate, VerificationController.verifyInstagramBio);
router.post('/verify-instagram-reel', authenticate, VerificationController.verifyInstagramReel);
router.delete('/youtube/:channelId', authenticate, VerificationController.disconnectYoutubeChannel);
router.delete('/instagram', authenticate, VerificationController.disconnectInstagram);
router.delete('/discord', authenticate, VerificationController.disconnectDiscord);

// Global Settings
router.get('/settings', SettingsController.getSettings);

export default router;
