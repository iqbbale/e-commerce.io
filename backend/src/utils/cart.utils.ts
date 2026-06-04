import { Response } from 'express';
import { Cart } from '../models/index';
import Product from '../models/Product.model';
import { sendSuccess, sendError } from './response.utils';
import { AuthRequest } from '../middleware/auth.middleware';

export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cart = await Cart.findOne({ user: req.user?.id })
      .populate('items.product', 'name price images stock isActive slug');
    sendSuccess(res, cart || { user: req.user?.id, items: [] });
  } catch (error) {
    sendError(res, 'Failed to fetch cart', 500);
  }
};

export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, quantity = 1, variant } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      sendError(res, 'Product not found', 404);
      return;
    }
    if (product.stock < quantity) {
      sendError(res, 'Insufficient stock', 400);
      return;
    }

    let cart = await Cart.findOne({ user: req.user?.id });
    if (!cart) {
      cart = new Cart({ user: req.user?.id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.variant === variant
    );

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({ product: product._id, quantity, variant, price: product.price });
    }

    await cart.save();
    await cart.populate('items.product', 'name price images stock isActive slug');
    sendSuccess(res, cart, 'Added to cart');
  } catch (error) {
    sendError(res, 'Failed to add to cart', 500);
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user?.id });

    if (!cart) {
      sendError(res, 'Cart not found', 404);
      return;
    }

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === req.params.productId);
    if (itemIndex < 0) {
      sendError(res, 'Item not in cart', 404);
      return;
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    await cart.populate('items.product', 'name price images stock isActive slug');
    sendSuccess(res, cart, 'Cart updated');
  } catch (error) {
    sendError(res, 'Failed to update cart', 500);
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user?.id },
      { $pull: { items: { product: req.params.productId } } },
      { new: true }
    ).populate('items.product', 'name price images stock isActive slug');

    sendSuccess(res, cart, 'Item removed from cart');
  } catch (error) {
    sendError(res, 'Failed to remove from cart', 500);
  }
};

export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Cart.findOneAndUpdate({ user: req.user?.id }, { items: [] });
    sendSuccess(res, null, 'Cart cleared');
  } catch (error) {
    sendError(res, 'Failed to clear cart', 500);
  }
};
