import { Router, Response } from 'express';
import { authenticate, authorizeAdmin, AuthRequest } from '../middleware/auth.middleware';
import User from '../models/User.model';
import { sendSuccess, sendError, getPaginationParams } from '../utils/response.utils';

const router = Router();

// All admin routes require auth + admin role
router.use(authenticate, authorizeAdmin);

// Get all users
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query as Record<string, unknown>);
    const { search, role } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    const [users, total] = await Promise.all([
      User.find(filter).sort('-createdAt').skip(skip).limit(limit).select('-password -refreshToken'),
      User.countDocuments(filter),
    ]);
    sendSuccess(res, users, 'Users fetched', 200, { total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    sendError(res, 'Failed to fetch users', 500);
  }
});

// Toggle user active status
router.patch('/users/:id/toggle-status', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) { sendError(res, 'User not found', 404); return; }
    if (user.role === 'admin') { sendError(res, 'Cannot deactivate admin', 403); return; }
    user.isActive = !user.isActive;
    await user.save();
    sendSuccess(res, { isActive: user.isActive }, `User ${user.isActive ? 'activated' : 'deactivated'}`);
  } catch (error) {
    sendError(res, 'Failed to update user status', 500);
  }
});

export default router;
