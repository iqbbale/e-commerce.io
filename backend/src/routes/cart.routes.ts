import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../utils/cart.utils';

const router = Router();
router.get('/', authenticate, getCart);
router.post('/add', authenticate, addToCart);
router.put('/item/:productId', authenticate, updateCartItem);
router.delete('/item/:productId', authenticate, removeFromCart);
router.delete('/clear', authenticate, clearCart);
export default router;
