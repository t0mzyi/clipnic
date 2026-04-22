import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { SettingsController } from '../controllers/SettingsController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, requireRole('admin'));
router.get('/stats', AdminController.getDashboardStats);
router.get('/users', AdminController.getAllUsers);
router.get('/users/:id', AdminController.getUser);
router.patch('/users/:id/block', AdminController.toggleBlock);
router.patch('/users/:id/role', AdminController.updateUserRole);
router.get('/users/:id/earnings', AdminController.getUserEarnings);

// Submission management
router.get('/submissions', AdminController.getAllSubmissions);
router.patch('/submissions/:id/status', AdminController.updateSubmissionStatus);

// Global settings
router.patch('/settings', SettingsController.updateSetting);

export default router;
