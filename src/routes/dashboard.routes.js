import { Router } from 'express';
import {
  getSummary,
  getCategoryTotals,
  getMonthlyTrends,
  getRecentActivity,
  getWeeklyTrends,
} from '../controllers/dashboard.controller.js';
import authenticate from '../middleware/auth.js';
import authorize from '../middleware/role.js';

const router = Router();


router.use(authenticate, authorize('viewer', 'analyst', 'admin'));

router.get('/summary', getSummary);
router.get('/categories', getCategoryTotals);
router.get('/trends/monthly', getMonthlyTrends);
router.get('/trends/weekly', getWeeklyTrends);
router.get('/recent', getRecentActivity);

export default router;
