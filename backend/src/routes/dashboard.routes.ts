import { Router } from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';
import {
  getDashboardStats,
  getMonthlyRevenue,
  getDailyRevenue,
  getTopProducts,
  getOrderStatusDistribution,
  getYearlyComparison,
} from '../utils/dashboard.utils';

const router = Router();

router.use(authenticate, authorizeAdmin);

router.get('/stats', getDashboardStats);
router.get('/revenue/monthly', getMonthlyRevenue);
router.get('/revenue/daily', getDailyRevenue);
router.get('/products/top', getTopProducts);
router.get('/orders/status-distribution', getOrderStatusDistribution);
router.get('/revenue/yearly', getYearlyComparison);

export default router;
