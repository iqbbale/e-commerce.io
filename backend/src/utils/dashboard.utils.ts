import { Request, Response } from 'express';
import Order from '../models/Order.model';
import Product from '../models/Product.model';
import User from '../models/User.model';
import { sendSuccess, sendError } from './response.utils';

// Overview stats
export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Only count PAID orders in revenue/sales
    const [
      totalRevenue,
      monthRevenue,
      lastMonthRevenue,
      totalOrders,
      pendingOrders,
      totalProducts,
      lowStockProducts,
      totalCustomers,
      newCustomersThisMonth,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', paymentDate: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', paymentDate: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.countDocuments({ paymentStatus: 'paid' }),
      Order.countDocuments({ status: 'pending_payment', paymentStatus: 'unpaid' }),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true, $expr: { $lte: ['$stock', '$lowStockThreshold'] } }),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'customer', createdAt: { $gte: startOfMonth } }),
    ]);

    const currentMonthRev = monthRevenue[0]?.total || 0;
    const lastMonthRev = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = lastMonthRev === 0 ? 100 : ((currentMonthRev - lastMonthRev) / lastMonthRev) * 100;

    sendSuccess(res, {
      revenue: {
        total: totalRevenue[0]?.total || 0,
        thisMonth: currentMonthRev,
        lastMonth: lastMonthRev,
        growth: Math.round(revenueGrowth * 100) / 100,
      },
      orders: { total: totalOrders, pending: pendingOrders },
      products: { total: totalProducts, lowStock: lowStockProducts },
      customers: { total: totalCustomers, newThisMonth: newCustomersThisMonth },
    });
  } catch (error) {
    sendError(res, 'Failed to fetch dashboard stats', 500);
  }
};

// Monthly revenue chart (only paid orders)
export const getMonthlyRevenue = async (req: Request, res: Response): Promise<void> => {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();

    const data = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          paymentDate: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$paymentDate' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);

    // Fill all 12 months
    const months = Array.from({ length: 12 }, (_, i) => {
      const found = data.find((d) => d._id.month === i + 1);
      return {
        month: i + 1,
        monthName: new Date(year, i, 1).toLocaleString('id-ID', { month: 'short' }),
        revenue: found?.revenue || 0,
        orders: found?.orders || 0,
      };
    });

    sendSuccess(res, { year, months });
  } catch (error) {
    sendError(res, 'Failed to fetch monthly revenue', 500);
  }
};

// Daily revenue for current month
export const getDailyRevenue = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const year = parseInt(req.query.year as string) || now.getFullYear();
    const month = parseInt(req.query.month as string) || now.getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();

    const data = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          paymentDate: {
            $gte: new Date(`${year}-${String(month).padStart(2, '0')}-01`),
            $lte: new Date(`${year}-${String(month).padStart(2, '0')}-${daysInMonth}`),
          },
        },
      },
      {
        $group: {
          _id: { day: { $dayOfMonth: '$paymentDate' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.day': 1 } },
    ]);

    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const found = data.find((d) => d._id.day === i + 1);
      return {
        day: i + 1,
        revenue: found?.revenue || 0,
        orders: found?.orders || 0,
      };
    });

    sendSuccess(res, { year, month, days });
  } catch (error) {
    sendError(res, 'Failed to fetch daily revenue', 500);
  }
};

// Top selling products
export const getTopProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find({ isActive: true })
      .sort('-soldCount')
      .limit(10)
      .select('name images price soldCount ratings stock')
      .populate('category', 'name');

    sendSuccess(res, products);
  } catch (error) {
    sendError(res, 'Failed to fetch top products', 500);
  }
};

// Orders by status chart
export const getOrderStatusDistribution = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    sendSuccess(res, data);
  } catch (error) {
    sendError(res, 'Failed to fetch order status distribution', 500);
  }
};

// Yearly comparison
export const getYearlyComparison = async (_req: Request, res: Response): Promise<void> => {
  try {
    const currentYear = new Date().getFullYear();

    const data = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          paymentDate: { $gte: new Date(`${currentYear - 2}-01-01`) },
        },
      },
      {
        $group: {
          _id: { year: { $year: '$paymentDate' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1 } },
    ]);

    sendSuccess(res, data);
  } catch (error) {
    sendError(res, 'Failed to fetch yearly comparison', 500);
  }
};
