import { Router } from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  uploadPaymentProof,
  getAllOrders,
  updateOrderStatus,
} from '../utils/order.utils';

const router = Router();

// Customer routes
router.post('/', authenticate, createOrder);
router.get('/my-orders', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrderById);
router.patch('/:id/payment-proof', authenticate, uploadPaymentProof);

// Admin routes
router.get('/', authenticate, authorizeAdmin, getAllOrders);
router.patch('/:id/status', authenticate, authorizeAdmin, updateOrderStatus);

export default router;
