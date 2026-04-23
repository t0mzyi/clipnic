import { Router } from 'express';
import { SubmissionController } from '../controllers/SubmissionController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Requires standard user authentication for submitting and viewing their own submissions
router.post('/', authenticate, SubmissionController.submitClip);
router.get('/my', authenticate, SubmissionController.getAllMySubmissions);
router.get('/earnings', authenticate, SubmissionController.getEarningsSummary);
router.get('/campaign/:campaignId/my', authenticate, SubmissionController.getMySubmissions);

router.post('/:id/refresh', authenticate, SubmissionController.refreshSubmission);
router.get('/check-url', authenticate, SubmissionController.checkUrlAvailability);
router.delete('/:id', authenticate, SubmissionController.deleteSubmission);

// Public or general route for Leaderboard
router.get('/campaign/:campaignId/leaderboard', SubmissionController.getLeaderboard);

export default router;
