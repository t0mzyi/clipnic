import { Router } from 'express';
import { CampaignController } from '../controllers/CampaignController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

// User routes
router.get('/', authenticate, CampaignController.getAll);
router.get('/joined', authenticate, CampaignController.getJoined);
router.get('/participations', authenticate, CampaignController.getParticipations);
router.get('/:id', authenticate, CampaignController.getById);
router.post('/:id/join', authenticate, CampaignController.joinCampaign);

// Admin-only routes
router.post('/', authenticate, requireRole('admin'), CampaignController.create);
router.put('/:id', authenticate, requireRole('admin'), CampaignController.update);
router.patch('/:id/status', authenticate, requireRole('admin'), CampaignController.updateStatus);
router.delete('/:id', authenticate, requireRole('admin'), CampaignController.deleteCampaign);

export default router;
