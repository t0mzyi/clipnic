import { Router } from 'express';
import { CampaignController } from '../controllers/CampaignController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Public / User routes
router.get('/', authenticate, CampaignController.getAll);
router.get('/:id', authenticate, CampaignController.getById);

// Admin routes
router.post('/', authenticate, requireRole('admin'), CampaignController.create);

export default router;
