// ===== USER TYPES =====
export interface IAddress {
  _id?: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  avatar?: string;
  addresses?: IAddress[];
  wishlist?: IProduct[];
  isActive: boolean;
  createdAt?: string;
}

// ===== AUTH TYPES =====
export interface IAuthState {
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ILoginForm {
  email: string;
  password: string;
}

export interface IRegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

// ===== PRODUCT TYPES =====
export interface IProductImage {
  url: string;
  publicId?: string;
  alt?: string;
}

export interface IProductVariant {
  name: string;
  value: string;
  stock: number;
  priceModifier: number;
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  images: IProductImage[];
  category: ICategory;
  tags: string[];
  sku: string;
  stock: number;
  lowStockThreshold: number;
  variants?: IProductVariant[];
  isActive: boolean;
  isFeatured: boolean;
  ratings: { average: number; count: number };
  soldCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IProductFilter {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular' | 'rating';
  featured?: boolean;
  inStock?: boolean;
  page?: number;
  limit?: number;
}

// ===== CATEGORY TYPES =====
export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
}

// ===== CART TYPES =====
export interface ICartItem {
  product: IProduct;
  quantity: number;
  variant?: string;
  price: number;
}

export interface ICart {
  _id?: string;
  user: string;
  items: ICartItem[];
}

// ===== ORDER TYPES =====
export type OrderStatus = 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentMethod = 'bank_transfer' | 'credit_card' | 'e_wallet' | 'cod';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'failed';

export interface IOrderItem {
  product: IProduct | string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: string;
  subtotal: number;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  customer: IUser | string;
  items: IOrderItem[];
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  subtotal: number;
  shippingCost: number;
  discount: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentProof?: string;
  paymentDate?: string;
  adminNote?: string;
  customerNote?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ===== REVIEW TYPES =====
export interface IReview {
  _id: string;
  product: string;
  user: { _id: string; name: string; avatar?: string };
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulCount: number;
  createdAt: string;
}

// ===== API RESPONSE TYPES =====
export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown[];
  pagination?: IPagination;
}

export interface IPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ===== DASHBOARD TYPES =====
export interface IDashboardStats {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  orders: { total: number; pending: number };
  products: { total: number; lowStock: number };
  customers: { total: number; newThisMonth: number };
}

export interface IMonthlyRevenue {
  year: number;
  months: Array<{
    month: number;
    monthName: string;
    revenue: number;
    orders: number;
  }>;
}

export interface IDailyRevenue {
  year: number;
  month: number;
  days: Array<{
    day: number;
    revenue: number;
    orders: number;
  }>;
}

export interface ICheckoutForm {
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: PaymentMethod;
  customerNote?: string;
  shippingCost: number;
  discount: number;
}
