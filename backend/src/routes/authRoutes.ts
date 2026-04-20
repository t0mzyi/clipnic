import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/sync', authenticate, AuthController.sync);

export default router;
