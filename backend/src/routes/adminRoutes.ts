import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { SettingsController } from '../controllers/SettingsController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, requireRole('admin'));

router.get('/users', AdminController.getAllUsers);
router.get('/users/:id', AdminController.getUser);
router.patch('/users/:id/block', AdminController.toggleBlock);
router.patch('/users/:id/role', AdminController.updateUserRole);

// Global settings
router.patch('/settings', SettingsController.updateSetting);

export default router;
