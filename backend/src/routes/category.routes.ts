// category.routes.ts
import { Router, Request, Response } from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';
import { Category } from '../models/index';
import { sendSuccess, sendError } from '../utils/response.utils';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('sortOrder name');
    sendSuccess(res, categories);
  } catch { sendError(res, 'Failed to fetch categories', 500); }
});

router.post('/', authenticate, authorizeAdmin, async (req: Request, res: Response) => {
  try {
    const cat = new Category(req.body);
    await cat.save();
    sendSuccess(res, cat, 'Category created', 201);
  } catch { sendError(res, 'Failed to create category', 500); }
});

router.put('/:id', authenticate, authorizeAdmin, async (req: Request, res: Response) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!cat) { sendError(res, 'Category not found', 404); return; }
    sendSuccess(res, cat, 'Category updated');
  } catch { sendError(res, 'Failed to update category', 500); }
});

router.delete('/:id', authenticate, authorizeAdmin, async (req: Request, res: Response) => {
  try {
    await Category.findByIdAndUpdate(req.params.id, { isActive: false });
    sendSuccess(res, null, 'Category deleted');
  } catch { sendError(res, 'Failed to delete category', 500); }
});

export default router;
