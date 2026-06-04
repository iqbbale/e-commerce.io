import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import User from '../models/User.model';
import Product from '../models/Product.model';
import { sendSuccess, sendError } from '../utils/response.utils';

const router = Router();

// Update profile
router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { $set: { name, phone, avatar } },
      { new: true, runValidators: true }
    );
    sendSuccess(res, user, 'Profile updated');
  } catch (error) {
    sendError(res, 'Failed to update profile', 500);
  }
});

// Change password
router.put('/change-password', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user?.id).select('+password');
    if (!user) { sendError(res, 'User not found', 404); return; }
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) { sendError(res, 'Current password is incorrect', 400); return; }
    user.password = newPassword;
    await user.save();
    sendSuccess(res, null, 'Password changed successfully');
  } catch (error) {
    sendError(res, 'Failed to change password', 500);
  }
});

// Add address
router.post('/addresses', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { $push: { addresses: req.body } },
      { new: true }
    );
    sendSuccess(res, user?.addresses, 'Address added');
  } catch (error) {
    sendError(res, 'Failed to add address', 500);
  }
});

// Toggle wishlist
router.post('/wishlist/:productId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) { sendError(res, 'User not found', 404); return; }
    const productId = req.params.productId;
    const idx = user.wishlist.findIndex((id) => id.toString() === productId);
    if (idx >= 0) {
      user.wishlist.splice(idx, 1);
    } else {
      const product = await Product.findById(productId);
      if (!product) { sendError(res, 'Product not found', 404); return; }
      user.wishlist.push(product._id);
    }
    await user.save();
    sendSuccess(res, { wishlist: user.wishlist }, idx >= 0 ? 'Removed from wishlist' : 'Added to wishlist');
  } catch (error) {
    sendError(res, 'Failed to update wishlist', 500);
  }
});

export default router;
