import { Request, Response } from 'express';
import Product from '../models/Product.model';
import { sendSuccess, sendError, getPaginationParams } from './response.utils';
import { AuthRequest } from '../middleware/auth.middleware';

// Get all products (with filters, search, pagination)
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query as Record<string, unknown>);
    const {
      search, category, minPrice, maxPrice,
      sort = '-createdAt', featured, inStock
    } = req.query as Record<string, string>;

    const filter: Record<string, unknown> = { isActive: true };

    if (search) {
      filter.$text = { $search: search };
    }
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {
        ...(minPrice && { $gte: Number(minPrice) }),
        ...(maxPrice && { $lte: Number(maxPrice) }),
      };
    }
    if (featured === 'true') filter.isFeatured = true;
    if (inStock === 'true') filter.stock = { $gt: 0 };

    const sortOptions: Record<string, 1 | -1> = {};
    if (sort === 'price_asc') sortOptions.price = 1;
    else if (sort === 'price_desc') sortOptions.price = -1;
    else if (sort === 'newest') sortOptions.createdAt = -1;
    else if (sort === 'popular') sortOptions.soldCount = -1;
    else if (sort === 'rating') sortOptions['ratings.average'] = -1;
    else sortOptions.createdAt = -1;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('category', 'name slug'),
      Product.countDocuments(filter),
    ]);

    sendSuccess(res, products, 'Products fetched', 200, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    sendError(res, 'Failed to fetch products', 500);
  }
};

// Get single product
export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('category', 'name slug')
      .populate('createdBy', 'name');

    if (!product) {
      sendError(res, 'Product not found', 404);
      return;
    }

    // Increment view count
    await Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } });

    sendSuccess(res, product);
  } catch (error) {
    sendError(res, 'Failed to fetch product', 500);
  }
};

// Create product (admin)
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const productData = { ...req.body, createdBy: req.user?.id };
    const product = new Product(productData);
    await product.save();
    await product.populate('category', 'name slug');
    sendSuccess(res, product, 'Product created successfully', 201);
  } catch (error) {
    sendError(res, 'Failed to create product', 500);
  }
};

// Update product (admin)
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    if (!product) {
      sendError(res, 'Product not found', 404);
      return;
    }
    sendSuccess(res, product, 'Product updated successfully');
  } catch (error) {
    sendError(res, 'Failed to update product', 500);
  }
};

// Delete product (admin - soft delete)
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) {
      sendError(res, 'Product not found', 404);
      return;
    }
    sendSuccess(res, null, 'Product deleted successfully');
  } catch (error) {
    sendError(res, 'Failed to delete product', 500);
  }
};

// Get featured products
export const getFeaturedProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true })
      .limit(8)
      .populate('category', 'name slug')
      .sort('-createdAt');
    sendSuccess(res, products);
  } catch (error) {
    sendError(res, 'Failed to fetch featured products', 500);
  }
};
