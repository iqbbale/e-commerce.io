import { Router, Request, Response } from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/response.utils';

const router = Router();

// Placeholder for image upload (integrate with Cloudinary or local storage)
router.post('/image', authenticate, async (req: Request, res: Response) => {
  try {
    // In production, integrate with Cloudinary
    // For now, accept base64 or URL
    const { imageUrl } = req.body;
    sendSuccess(res, { url: imageUrl }, 'Image uploaded');
  } catch {
    sendError(res, 'Failed to upload image', 500);
  }
});

export default router;
