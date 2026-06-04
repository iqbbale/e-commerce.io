import { Request, Response } from 'express';
import Order from '../models/Order.model';
import Product from '../models/Product.model';
import { Cart } from '../models/index';
import { sendSuccess, sendError, getPaginationParams } from './response.utils';
import { AuthRequest } from '../middleware/auth.middleware';

// Create order (customer)
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { items, shippingAddress, paymentMethod, customerNote, discount = 0, shippingCost = 0 } = req.body;

    // Validate and get current prices
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        sendError(res, `Product not found: ${item.productId}`, 400);
        return;
      }
      if (product.stock < item.quantity) {
        sendError(res, `Insufficient stock for: ${product.name}`, 400);
        return;
      }
      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url || '',
        price: product.price,
        quantity: item.quantity,
        variant: item.variant,
        subtotal: itemSubtotal,
      });
    }

    const tax = Math.round(subtotal * 0.11); // 11% PPN
    const total = subtotal + shippingCost + tax - discount;

    const order = new Order({
      customer: req.user?.id,
      items: orderItems,
      shippingAddress,
      subtotal,
      shippingCost,
      discount,
      tax,
      total,
      paymentMethod,
      customerNote,
      status: 'pending_payment',
      paymentStatus: 'unpaid',
    });

    await order.save();

    // Clear cart after order
    await Cart.findOneAndUpdate(
      { user: req.user?.id },
      { items: [] }
    );

    sendSuccess(res, order, 'Order created successfully', 201);
  } catch (error) {
    sendError(res, 'Failed to create order', 500);
  }
};

// Get customer orders
export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query as Record<string, unknown>);
    const { status } = req.query as { status?: string };

    const filter: Record<string, unknown> = { customer: req.user?.id };
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .populate('items.product', 'name images slug'),
      Order.countDocuments(filter),
    ]);

    sendSuccess(res, orders, 'Orders fetched', 200, {
      total, page, limit, totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    sendError(res, 'Failed to fetch orders', 500);
  }
};

// Get single order (customer can only see their own)
export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filter: Record<string, unknown> = { _id: req.params.id };
    if (req.user?.role !== 'admin') {
      filter.customer = req.user?.id;
    }
    const order = await Order.findOne(filter)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name images slug');

    if (!order) {
      sendError(res, 'Order not found', 404);
      return;
    }
    sendSuccess(res, order);
  } catch (error) {
    sendError(res, 'Failed to fetch order', 500);
  }
};

// Upload payment proof (customer)
export const uploadPaymentProof = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.user?.id });
    if (!order) {
      sendError(res, 'Order not found', 404);
      return;
    }
    if (order.paymentStatus === 'paid') {
      sendError(res, 'Order already paid', 400);
      return;
    }

    order.paymentProof = req.body.paymentProof;
    order.status = 'pending_payment';
    await order.save();

    sendSuccess(res, order, 'Payment proof uploaded. Waiting for admin verification.');
  } catch (error) {
    sendError(res, 'Failed to upload payment proof', 500);
  }
};

// ===== ADMIN ACTIONS =====

// Get all orders (admin)
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query as Record<string, unknown>);
    const { status, paymentStatus, search } = req.query as Record<string, string>;

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (search) filter.orderNumber = { $regex: search, $options: 'i' };

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .populate('customer', 'name email phone'),
      Order.countDocuments(filter),
    ]);

    sendSuccess(res, orders, 'Orders fetched', 200, {
      total, page, limit, totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    sendError(res, 'Failed to fetch orders', 500);
  }
};

// Update order status (admin)
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, paymentStatus, trackingNumber, adminNote, estimatedDelivery } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      sendError(res, 'Order not found', 404);
      return;
    }

    if (status) order.status = status;
    if (adminNote) order.adminNote = adminNote;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (estimatedDelivery) order.estimatedDelivery = new Date(estimatedDelivery);

    // Handle payment verification
    if (paymentStatus === 'paid' && order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid';
      order.paymentDate = new Date();
      if (order.status === 'pending_payment') {
        order.status = 'processing';
      }
      // Deduct stock when payment confirmed
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity, soldCount: item.quantity }
        });
      }
    } else if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    if (status === 'delivered') order.deliveredAt = new Date();
    if (status === 'cancelled') {
      order.cancelledAt = new Date();
      order.cancelReason = req.body.cancelReason;
      // Restore stock if was paid
      if (order.paymentStatus === 'paid') {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity, soldCount: -item.quantity }
          });
        }
      }
    }

    await order.save();
    sendSuccess(res, order, 'Order updated successfully');
  } catch (error) {
    sendError(res, 'Failed to update order', 500);
  }
};
