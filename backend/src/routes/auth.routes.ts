import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshTokenAction,
  getCurrentUser,
} from '../utils/auth.utils';

const router = Router();

router.post(
  '/register',
  validate([
    body('name').trim().notEmpty().isLength({ min: 2, max: 50 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ]),
  registerUser
);

router.post(
  '/login',
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ]),
  loginUser
);

router.post('/logout', authenticate, logoutUser);
router.post('/refresh', refreshTokenAction);
router.get('/me', authenticate, getCurrentUser);

export default router;
