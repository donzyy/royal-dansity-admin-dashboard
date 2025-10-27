import { Router } from 'express';
import {
  getActivities,
  getUserActivities,
} from '../controllers/activity.controller';
import { protect, authorize } from '../middleware/auth';

/**
 * Activity Routes
 * @route /api/activities
 */

const router = Router();

// All activity routes are admin-only
router.use(protect, authorize('admin'));

router.get('/', getActivities);
router.get('/user/:userId', getUserActivities);

export default router;

