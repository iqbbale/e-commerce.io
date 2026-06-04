import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { Review } from '../models/index';
import Product from '../models/Product.model';
import Order from '../models/Order.model';
import { sendSuccess, sendError } from '../utils/response.utils';

const router = Router();

router.get('/product/:productId', async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, isApproved: true })
      .populate('user', 'name avatar')
      .sort('-createdAt');
    sendSuccess(res, reviews);
  } catch { sendError(res, 'Failed to fetch reviews', 500); }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { productId, rating, title, comment, images } = req.body;

    // Check if user purchased this product
    const hasPurchased = await Order.findOne({
      customer: req.user?.id,
      paymentStatus: 'paid',
      'items.product': productId,
    });

    const existing = await Review.findOne({ product: productId, user: req.user?.id });
    if (existing) { sendError(res, 'You already reviewed this product', 409); return; }

    const review = new Review({
      product: productId,
      user: req.user?.id,
      rating,
      title,
      comment,
      images,
      isVerifiedPurchase: !!hasPurchased,
    });
    await review.save();
    await review.populate('user', 'name avatar');

    // Update product rating
    const allReviews = await Review.find({ product: productId, isApproved: true });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Product.findByIdAndUpdate(productId, {
      'ratings.average': Math.round(avgRating * 10) / 10,
      'ratings.count': allReviews.length,
    });

    sendSuccess(res, review, 'Review submitted', 201);
  } catch { sendError(res, 'Failed to submit review', 500); }
});

export default router;
