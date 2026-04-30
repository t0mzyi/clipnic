import { Router } from 'express';
import { CampaignController } from '../controllers/CampaignController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

// User routes
router.get('/', authenticate, CampaignController.getAll);
router.get('/joined', authenticate, CampaignController.getJoined);
router.get('/brand-assigned', authenticate, requireRole('brand'), CampaignController.getBrandCampaigns);
router.get('/participations', authenticate, CampaignController.getParticipations);
router.get('/:id', authenticate, CampaignController.getById);
router.post('/:id/join', authenticate, CampaignController.joinCampaign);
router.delete('/:id/leave', authenticate, CampaignController.leaveCampaign);

// Admin-only routes
router.get('/admin/all', authenticate, requireRole('admin'), CampaignController.getAllAdmin);
router.post('/', authenticate, requireRole('admin'), CampaignController.create);
router.put('/:id', authenticate, requireRole('admin'), CampaignController.update);
router.patch('/:id/status', authenticate, requireRole('admin'), CampaignController.updateStatus);
router.patch('/:id/featured', authenticate, requireRole('admin'), CampaignController.updateFeatured);
router.delete('/:id', authenticate, requireRole('admin'), CampaignController.deleteCampaign);

export default router;
